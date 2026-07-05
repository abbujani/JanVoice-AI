export interface Complaint {
  id: string;
  title: string;
  description: string;
  originalLanguage: string;
  translatedDescription: string;
  category: 'Roads' | 'Water' | 'Waste' | 'Infrastructure' | 'Health' | 'Education' | 'Electricity';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  imageUrl: string | null;
  imageAnalysis: string | null;
  voiceUrl: string | null;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  anonymous: boolean;
  status: 'submitted' | 'processing' | 'duplicate' | 'action_proposed' | 'resolved';
  parentId: string | null;
  citizenId: string;
  citizenName: string;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  priorityScore: number;
  scoreBreakdown: {
    demandWeight: number; // complaints frequency
    gapWeight: number;    // lack of facility
    urgencyWeight: number;// severity
    populationWeight: number;
  };
  budgetEstimation: number; // in INR
  expectedBeneficiaries: number;
  complaintIds: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'proposed' | 'approved' | 'in_progress' | 'completed';
  timestamp: string;
}

export const mockUsers = {
  citizen: {
    uid: 'mock-citizen-123',
    email: 'citizen@janvoice.gov.in',
    role: 'citizen',
    displayName: 'Aarav Sharma',
  },
  mp: {
    uid: 'mock-mp-456',
    email: 'mp@janvoice.gov.in',
    role: 'mp',
    displayName: 'Rajesh Kumar, MP',
  },
  admin: {
    uid: 'mock-admin-789',
    email: 'admin@janvoice.gov.in',
    role: 'admin',
    displayName: 'Priya Patel (District Admin)',
  }
};

export const initialComplaints: Complaint[] = [
  {
    id: 'comp-1',
    title: 'Severe Potholes on Main Bazar Road',
    description: 'मेन बाजार रोड पर बहुत बड़े गड्ढे हो गए हैं। पिछले हफ्ते एक बाइक सवार गिर गया था। बारिश के मौसम में स्थिति और खराब हो जाती है।',
    originalLanguage: 'Hindi',
    translatedDescription: 'There are very large potholes on the Main Bazar Road. A bike rider fell down last week. The condition worsens during the rainy season.',
    category: 'Roads',
    urgency: 'high',
    confidenceScore: 0.95,
    sentiment: 'negative',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    imageAnalysis: 'Gemini Vision detected multiple severe road depressions, fractured asphalt base, and water clogging. Pothole depth exceeds 15cm. High risk to public safety.',
    voiceUrl: null,
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Main Bazar Road, Sector 3, Ramnagar'
    },
    anonymous: false,
    status: 'action_proposed',
    parentId: null,
    citizenId: 'mock-citizen-123',
    citizenName: 'Aarav Sharma',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-2',
    title: 'Broken Water Pipe and Flooding',
    description: 'குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது. சாலை முழுவதும் குளம் போல் காட்சியளிக்கிறது. குடிநீர் விநியோகம் தடைபட்டுள்ளது.',
    originalLanguage: 'Tamil',
    translatedDescription: 'Drinking water pipe is broken and water is going waste. The whole road looks like a pond. Drinking water supply is disrupted.',
    category: 'Water',
    urgency: 'critical',
    confidenceScore: 0.92,
    sentiment: 'negative',
    imageUrl: null,
    imageAnalysis: null,
    voiceUrl: null,
    location: {
      lat: 28.6145,
      lng: 77.2085,
      address: 'Gopalpur Main Water Line junction'
    },
    anonymous: true,
    status: 'action_proposed',
    parentId: null,
    citizenId: 'user-001',
    citizenName: 'Anonymous Citizen',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-3',
    title: 'Garbage accumulation near Government Secondary School',
    description: 'शाळेच्या मुख्य गेटसमोर कचऱ्याचे मोठे ढीग साचले आहेत. दुर्गंधीमुळे विद्यार्थ्यांना वर्गात बसणे कठीण झाले आहे. रोगराई पसरण्याची भीती आहे.',
    originalLanguage: 'Marathi',
    translatedDescription: 'Large heaps of garbage have accumulated in front of the main gate of the school. Due to bad smell, it is difficult for students to sit in class. Fear of spread of disease.',
    category: 'Waste',
    urgency: 'high',
    confidenceScore: 0.97,
    sentiment: 'negative',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    imageAnalysis: 'Gemini Vision detected unsegregated household waste, discarded plastic packagings, and organic debris accumulation within 5 meters of a public gate. Infestation risk high.',
    voiceUrl: null,
    location: {
      lat: 28.6110,
      lng: 77.2150,
      address: 'Ward 5 School Road, Gopalpur'
    },
    anonymous: false,
    status: 'submitted',
    parentId: null,
    citizenId: 'user-002',
    citizenName: 'Sunita Deshmukh',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-4',
    title: 'Duplicate Road Issue: Potholes on Bazar Road Lane 2',
    description: 'बाजार वाली गली में सड़क टूटी हुई है। काफी बड़े गड्ढे हैं जिससे गाड़ियां निकल नहीं पाती।',
    originalLanguage: 'Hindi',
    translatedDescription: 'Road is broken in the market lane. There are huge potholes because of which vehicles cannot pass.',
    category: 'Roads',
    urgency: 'medium',
    confidenceScore: 0.91,
    sentiment: 'negative',
    imageUrl: null,
    imageAnalysis: null,
    voiceUrl: null,
    location: {
      lat: 28.6141,
      lng: 77.2093,
      address: 'Lane 2, Sector 3, Ramnagar'
    },
    anonymous: false,
    status: 'duplicate',
    parentId: 'comp-1',
    citizenId: 'user-003',
    citizenName: 'Vikram Singh',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-5',
    title: 'Frequent Voltage Fluctuations and Power Outages',
    description: 'We are facing electricity outages and massive voltage spikes that have damaged two refrigerators in our lane this week. No response from local feeder office.',
    originalLanguage: 'English',
    translatedDescription: 'We are facing electricity outages and massive voltage spikes that have damaged two refrigerators in our lane this week. No response from local feeder office.',
    category: 'Electricity',
    urgency: 'high',
    confidenceScore: 0.94,
    sentiment: 'negative',
    imageUrl: null,
    imageAnalysis: null,
    voiceUrl: null,
    location: {
      lat: 28.6210,
      lng: 77.2010,
      address: 'Lal Chowk, Sub-station 2 Line'
    },
    anonymous: false,
    status: 'submitted',
    parentId: null,
    citizenId: 'user-004',
    citizenName: 'Amit Verma',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Asphalt Resurfacing & Drainage Channelization on Bazar Road',
    description: 'Comprehensive road reconstruction of Bazar Road Sector 3 including sub-base laying and concrete storm-water drains.',
    reasoning: 'Triggered by 12 complaints (including duplicates) regarding severe road degradation and vehicle damages. bazar road has a high pedestrian flow. Heavy monsoon clogging is caused by the lack of drainage. Laying a new bitumen surface and channelizing rainwater prevents yearly damage.',
    priorityScore: 88,
    scoreBreakdown: {
      demandWeight: 30, // 30/30 (highest complaints volume)
      gapWeight: 20,    // 20/25 (road base completely broken)
      urgencyWeight: 20, // 20/25 (accident risks reported)
      populationWeight: 18 // 18/20 (serves major commercial sector)
    },
    budgetEstimation: 1850000, // INR 18.5 Lakhs
    expectedBeneficiaries: 12000,
    complaintIds: ['comp-1', 'comp-4'],
    location: {
      lat: 28.6140,
      lng: 77.2091,
      address: 'Sector 3 Commercial Ring, Ramnagar'
    },
    status: 'proposed',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rec-2',
    title: 'Installation of Primary Water Distribution Valve & Pipeline Replacement',
    description: 'Replacing standard 8-inch joints with reinforced ductile iron lines and installing an automated pressure valve.',
    reasoning: 'Critical burst water lines are causing 40,000 liters of treated drinking water wastage daily, leading to localized flooding and complete pipeline disruption for 4 adjoining wards.',
    priorityScore: 92,
    scoreBreakdown: {
      demandWeight: 25,
      gapWeight: 25,    // Extreme structural gap
      urgencyWeight: 25, // Critical supply cut
      populationWeight: 17
    },
    budgetEstimation: 620000, // INR 6.2 Lakhs
    expectedBeneficiaries: 8500,
    complaintIds: ['comp-2'],
    location: {
      lat: 28.6145,
      lng: 77.2085,
      address: 'Gopalpur Main Water Line junction'
    },
    status: 'approved',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockStats = {
  totalComplaints: 254,
  activeIssues: 188,
  resolvedIssues: 66,
  highPriority: 42
};
