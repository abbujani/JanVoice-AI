import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { 
  Complaint, 
  Recommendation
} from '../services/mockData';
import { 
  initialComplaints, 
  initialRecommendations,
  mockStats
} from '../services/mockData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface DataContextType {
  complaints: Complaint[];
  recommendations: Recommendation[];
  stats: typeof mockStats;
  chatHistory: ChatMessage[];
  loading: boolean;
  submitComplaint: (data: {
    title: string;
    description: string;
    category: string;
    urgency: string;
    location: { lat: number; lng: number; address: string };
    anonymous: boolean;
    imageFile: File | null;
    audioFile: Blob | null;
    language: string;
  }) => Promise<Complaint>;
  sendChatMessage: (text: string) => Promise<void>;
  verifyComplaint: (id: string, category: string, urgency: string) => Promise<void>;
  mergeAsDuplicate: (childId: string, parentId: string) => Promise<void>;
  updateProjectStatus: (id: string, status: Recommendation['status']) => Promise<void>;
  triggerReclustering: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isStandalone } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive stats dynamically from complaints and projects
  const [stats, setStats] = useState<typeof mockStats>(mockStats);

  useEffect(() => {
    const total = complaints.length;
    const active = complaints.filter(c => c.status !== 'resolved' && c.status !== 'duplicate').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const high = complaints.filter(c => c.urgency === 'high' || c.urgency === 'critical').length;
    setStats({
      totalComplaints: total || mockStats.totalComplaints,
      activeIssues: active || mockStats.activeIssues,
      resolvedIssues: resolved || mockStats.resolvedIssues,
      highPriority: high || mockStats.highPriority
    });
  }, [complaints]);

  // Load Initial Data / Real-time Sync
  useEffect(() => {
    if (isStandalone || !db) {
      // Standalone mode: load from LocalStorage
      const localComps = localStorage.getItem('janvoice_complaints');
      const localRecs = localStorage.getItem('janvoice_recommendations');
      const localChat = localStorage.getItem('janvoice_chat');

      if (localComps) {
        setComplaints(JSON.parse(localComps));
      } else {
        setComplaints(initialComplaints);
        localStorage.setItem('janvoice_complaints', JSON.stringify(initialComplaints));
      }

      if (localRecs) {
        setRecommendations(JSON.parse(localRecs));
      } else {
        setRecommendations(initialRecommendations);
        localStorage.setItem('janvoice_recommendations', JSON.stringify(initialRecommendations));
      }

      if (localChat) {
        setChatHistory(JSON.parse(localChat));
      } else {
        const welcome: ChatMessage[] = [{
          id: 'welcome',
          sender: 'assistant',
          text: `Welcome, ${user?.displayName || 'MP'}. I am your JanVoice AI Executive Assistant. I can help analyze development priorities, identify infrastructure gaps, and detail community demands. Ask me anything!`,
          timestamp: new Date().toISOString()
        }];
        setChatHistory(welcome);
        localStorage.setItem('janvoice_chat', JSON.stringify(welcome));
      }
      setLoading(false);
      return;
    }

    // Connected mode: setup Firestore real-time listeners
    const qComplaints = query(collection(db!, 'complaints'), orderBy('timestamp', 'desc'));
    const unsubscribeComps = onSnapshot(qComplaints, (snapshot) => {
      const compsList: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        compsList.push({
          id: docSnap.id,
          ...data,
        } as Complaint);
      });
      // Fallback to mock if empty
      if (compsList.length === 0) {
        setComplaints(initialComplaints);
      } else {
        setComplaints(compsList);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Complaints listener failed. Falling back.", error);
      setComplaints(initialComplaints);
      setLoading(false);
    });

    const qRecommendations = query(collection(db!, 'recommendations'), orderBy('priorityScore', 'desc'));
    const unsubscribeRecs = onSnapshot(qRecommendations, (snapshot) => {
      const recsList: Recommendation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        recsList.push({
          id: docSnap.id,
          ...data,
        } as Recommendation);
      });
      if (recsList.length === 0) {
        setRecommendations(initialRecommendations);
      } else {
        setRecommendations(recsList);
      }
    }, (error) => {
      console.error("Firestore Recommendations listener failed:", error);
      setRecommendations(initialRecommendations);
    });

    return () => {
      unsubscribeComps();
      unsubscribeRecs();
    };
  }, [isStandalone]);

  // Submit a Complaint (Citizen View)
  const submitComplaint = async (data: {
    title: string;
    description: string;
    category: string;
    urgency: string;
    location: { lat: number; lng: number; address: string };
    anonymous: boolean;
    imageFile: File | null;
    audioFile: Blob | null;
    language: string;
  }) => {
    const timestamp = new Date().toISOString();
    const newCompId = `comp-${Math.random().toString(36).substr(2, 9)}`;

    // Set up default parameters for AI results which will be populated
    const resultComp: Complaint = {
      id: newCompId,
      title: data.title,
      description: data.description,
      originalLanguage: data.language || 'English',
      translatedDescription: data.description,
      category: (data.category || 'Roads') as Complaint['category'],
      urgency: (data.urgency || 'medium') as Complaint['urgency'],
      confidenceScore: 0.90,
      sentiment: 'negative',
      imageUrl: data.imageFile ? URL.createObjectURL(data.imageFile) : null,
      imageAnalysis: data.imageFile ? "Analysis pending..." : null,
      voiceUrl: data.audioFile ? URL.createObjectURL(data.audioFile) : null,
      location: data.location,
      anonymous: data.anonymous,
      status: 'submitted',
      parentId: null,
      citizenId: user?.uid || 'anonymous-user',
      citizenName: data.anonymous ? 'Anonymous Citizen' : user?.displayName || 'Citizen',
      timestamp
    };

    if (isStandalone) {
      // Simulate Gemini pipelines locally in standalone mode
      const isHindi = /[\u0900-\u097F]/.test(data.description);
      if (isHindi && data.language === 'Hindi') {
        resultComp.originalLanguage = 'Hindi';
        resultComp.translatedDescription = data.description + " (Translated: The road/facility is severely damaged. Please fix it immediately.)";
      }

      // Simulate Image Vision if file attached
      if (data.imageFile) {
        resultComp.imageAnalysis = `Gemini Vision analyzed image: Identified surface cracks, localized debris, and pedestrian blockade. Safety hazard index: 0.85. Categorized as ${data.category}.`;
      }

      // Simulate confidence score
      resultComp.confidenceScore = parseFloat((0.85 + Math.random() * 0.14).toFixed(2));

      // Append to local state
      const updated = [resultComp, ...complaints];
      setComplaints(updated);
      localStorage.setItem('janvoice_complaints', JSON.stringify(updated));

      // Trigger localized mock recommendation creation if there are many complaints in similar spot
      simulateMockProjectGeneration(resultComp);
    } else {
      // Connect to live FastAPI backend which uploads to Firestore
      try {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('urgency', data.urgency);
        formData.append('lat', data.location.lat.toString());
        formData.append('lng', data.location.lng.toString());
        formData.append('address', data.location.address);
        formData.append('anonymous', data.anonymous.toString());
        formData.append('language', data.language);
        formData.append('citizenId', user?.uid || '');
        formData.append('citizenName', data.anonymous ? 'Anonymous' : user?.displayName || '');

        if (data.imageFile) {
          formData.append('image', data.imageFile);
        }
        if (data.audioFile) {
          // Convert Blob to File object for proper uploading
          const audioFileObj = new File([data.audioFile], "recording.wav", { type: "audio/wav" });
          formData.append('audio', audioFileObj);
        }

        // Call our backend API
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/complaints`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Backend failed to process complaint');
        }

        const backendResult = await response.json();
        return backendResult as Complaint;

      } catch (err) {
        console.error("Failed to upload to FastAPI. Saving directly to Firestore as fallback.", err);
        // Direct fallback to Firestore write if backend is down
        if (db) {
          const docRef = await addDoc(collection(db!, 'complaints'), {
            title: resultComp.title,
            description: resultComp.description,
            originalLanguage: resultComp.originalLanguage,
            translatedDescription: resultComp.translatedDescription,
            category: resultComp.category,
            urgency: resultComp.urgency,
            confidenceScore: resultComp.confidenceScore,
            sentiment: resultComp.sentiment,
            imageUrl: resultComp.imageUrl,
            imageAnalysis: resultComp.imageAnalysis,
            voiceUrl: resultComp.voiceUrl,
            location: resultComp.location,
            anonymous: resultComp.anonymous,
            status: resultComp.status,
            parentId: resultComp.parentId,
            citizenId: resultComp.citizenId,
            citizenName: resultComp.citizenName,
            timestamp: resultComp.timestamp
          });
          resultComp.id = docRef.id;
        }
      }
    }

    return resultComp;
  };

  // Helper to generate a mock project when multiple complaints appear
  const simulateMockProjectGeneration = (newComp: Complaint) => {
    // Check if we have multiple complaints in the same category
    const similar = complaints.filter(c => c.category === newComp.category);
    if (similar.length >= 2) {
      const budgetMap = {
        Roads: 1500000,
        Water: 500000,
        Waste: 200000,
        Infrastructure: 2500000,
        Health: 3500000,
        Education: 2000000,
        Electricity: 800000
      };

      const newRec: Recommendation = {
        id: `rec-${Math.random().toString(36).substr(2, 9)}`,
        title: `Community Initiative: ${newComp.category} Project at ${newComp.location.address.split(',')[0]}`,
        description: `Upgrading local system to resolve repetitive citizen concerns about ${newComp.category.toLowerCase()}.`,
        reasoning: `AI detected high cluster density of ${newComp.category} reports in this area. Resolves issues raised by ${similar.length + 1} citizens. Estimated priority rating details high infrastructure gaps.`,
        priorityScore: Math.floor(75 + Math.random() * 20),
        scoreBreakdown: {
          focusDemand: 25 + Math.floor(Math.random() * 5),
          focusGap: 20 + Math.floor(Math.random() * 5),
          focusUrgency: 20 + Math.floor(Math.random() * 5),
          focusPopulation: 15 + Math.floor(Math.random() * 5)
        } as any,
        budgetEstimation: budgetMap[newComp.category] || 1000000,
        expectedBeneficiaries: 1500 * (similar.length + 1),
        complaintIds: [newComp.id, ...similar.map(s => s.id)],
        location: newComp.location,
        status: 'proposed',
        timestamp: new Date().toISOString()
      };

      const updatedRecs = [newRec, ...recommendations];
      setRecommendations(updatedRecs);
      localStorage.setItem('janvoice_recommendations', JSON.stringify(updatedRecs));
    }
  };

  // MP AI Assistant Chat (Uses Gemini backend or Local simulation)
  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    
    if (isStandalone) {
      localStorage.setItem('janvoice_chat', JSON.stringify(newHistory));
    }

    try {
      let assistantText = "";

      if (isStandalone) {
        // Mock Responses based on query keywords
        const lower = text.toLowerCase();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate networking delay

        if (lower.includes('hospital') || lower.includes('health') || lower.includes('medical')) {
          assistantText = "Based on our AI gap analysis, the Eastern Sector (near Gopalpur ward 5) reports the highest health-facility gap. The nearest dispensary is over 12km away, and we have received 4 requests for primary health units this month. A project proposal (ID: rec-2) is recommended with a Priority Score of 92/100.";
        } else if (lower.includes('road') || lower.includes('pothole') || lower.includes('bridge')) {
          const roadCount = complaints.filter(c => c.category === 'Roads').length;
          assistantText = `Road infrastructure represents ${roadCount > 0 ? ((roadCount/complaints.length)*100).toFixed(0) : '35'}% of all active complaints. The most critical hotspot is Main Bazar Road, Sector 3, which has 2 overlapping complaints. The suggested Asphalt Resurfacing project has a priority score of 88/100 and will benefit approximately 12,000 residents.`;
        } else if (lower.includes('water') || lower.includes('supply') || lower.includes('leak')) {
          assistantText = "We have active complaints regarding broken water lines near Gopalpur main water line. It has been marked as CRITICAL urgency due to water contamination and supply cuts affecting 8,500 expected beneficiaries. A pressure valve and pipeline replacement project (Estimated budget: ₹6.2 Lakhs) is currently pending approval.";
        } else if (lower.includes('budget')) {
          const totalBudget = recommendations.reduce((acc, curr) => acc + curr.budgetEstimation, 0);
          assistantText = `The total estimated budget for all proposed development projects is ₹${(totalBudget/100000).toFixed(1)} Lakhs. The largest budget item is for Infrastructure/Roads, and the highest priority projects (Water Pipeline & Bazar Road Repair) require a combined budget of ₹24.7 Lakhs.`;
        } else {
          assistantText = `I have scanned our database of ${complaints.length} active complaints. The most common category is Roads and Water, comprising over half of the submissions. The overall sentiment is negatively geared towards local civic response time. I recommend authorizing the Bazar Road Asphalt project first due to high community feedback overlap.`;
        }
      } else {
        // API call to FastAPI backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: chatHistory.map(h => ({ role: h.sender, content: h.text })) }),
        });

        if (!response.ok) {
          throw new Error('AI Assistant failed to reply');
        }

        const data = await response.json();
        assistantText = data.response;
      }

      const assistantMsg: ChatMessage = {
        id: `chat-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, assistantMsg];
      setChatHistory(finalHistory);
      
      if (isStandalone) {
        localStorage.setItem('janvoice_chat', JSON.stringify(finalHistory));
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
    }
  };

  // Administrator Actions
  const verifyComplaint = async (id: string, category: string, urgency: string) => {
    if (isStandalone) {
      const updated = complaints.map(c => 
        c.id === id 
          ? { ...c, category: category as Complaint['category'], urgency: urgency as Complaint['urgency'], status: 'action_proposed' as const } 
          : c
      );
      setComplaints(updated);
      localStorage.setItem('janvoice_complaints', JSON.stringify(updated));
    } else if (db) {
      const docRef = doc(db!, 'complaints', id);
      await updateDoc(docRef, {
        category,
        urgency,
        status: 'action_proposed'
      });
    }
  };

  // Group overlapping complaints together
  const mergeAsDuplicate = async (childId: string, parentId: string) => {
    if (isStandalone) {
      const updated = complaints.map(c => 
        c.id === childId 
          ? { ...c, parentId, status: 'duplicate' as const } 
          : c
      );
      setComplaints(updated);
      localStorage.setItem('janvoice_complaints', JSON.stringify(updated));
    } else if (db) {
      const docRef = doc(db!, 'complaints', childId);
      await updateDoc(docRef, {
        parentId,
        status: 'duplicate'
      });
    }
  };

  // MP Project Status progression
  const updateProjectStatus = async (id: string, status: Recommendation['status']) => {
    if (isStandalone) {
      const updated = recommendations.map(r => 
        r.id === id ? { ...r, status } : r
      );
      setRecommendations(updated);
      localStorage.setItem('janvoice_recommendations', JSON.stringify(updated));

      // If project is completed, resolve all linked complaints
      if (status === 'completed') {
        const targetRec = recommendations.find(r => r.id === id);
        if (targetRec) {
          const updatedComps = complaints.map(c => 
            targetRec.complaintIds.includes(c.id) ? { ...c, status: 'resolved' as const } : c
          );
          setComplaints(updatedComps);
          localStorage.setItem('janvoice_complaints', JSON.stringify(updatedComps));
        }
      }
    } else if (db) {
      const docRef = doc(db!, 'recommendations', id);
      await updateDoc(docRef, { status });

      if (status === 'completed') {
        // Resolve linked complaints in Firestore using a batch write
        const targetRec = recommendations.find(r => r.id === id);
        if (targetRec && targetRec.complaintIds.length > 0) {
          const batch = writeBatch(db!);
          targetRec.complaintIds.forEach(cid => {
            const compRef = doc(db!, 'complaints', cid);
            batch.update(compRef, { status: 'resolved' });
          });
          await batch.commit();
        }
      }
    }
  };

  // Re-run AI clustering on demand
  const triggerReclustering = async () => {
    if (isStandalone) {
      alert("AI Clustering ran successfully. Found 1 duplicate grouping and updated priority scores.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/recluster`, {
        method: 'POST'
      });
      if (response.ok) {
        alert("Clustering engine triggered successfully on FastAPI.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to the backend clustering service.");
    }
  };

  return (
    <DataContext.Provider value={{
      complaints,
      recommendations,
      stats,
      chatHistory,
      loading,
      submitComplaint,
      sendChatMessage,
      verifyComplaint,
      mergeAsDuplicate,
      updateProjectStatus,
      triggerReclustering
    }}>
      {children}
    </DataContext.Provider>
  );
};
