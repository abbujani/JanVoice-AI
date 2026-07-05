import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { QuickStats } from '../components/QuickStats';
import { HeatmapView } from '../components/HeatmapView';
import { GlassCard } from '../components/GlassCard';
import { GeminiBadge } from '../components/GeminiBadge';
import { 
  ResponsiveContainer, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { 
  Download, 
  Users, 
  MapPin, 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  X, 
  PieChart as PieIcon, 
  Map as MapIcon,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Database,
  PlayCircle,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MPDashboard: React.FC = () => {
  const { 
    complaints, 
    recommendations, 
    stats, 
    chatHistory, 
    sendChatMessage, 
    submitComplaint
  } = useData();

  // Chat/Copilot states
  const [chatInput, setChatInput] = useState('');
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'recommendations' | 'map' | 'risks'>('analytics');
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);

  // Filter category selection for Smart Bubble Clusters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // AI Process Animation Overlay State
  const [aiProcessStep, setAiProcessStep] = useState<string | null>(null);

  // Executive brief modal state
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Setup Live Demo event listener
  useEffect(() => {
    const runDemo = () => {
      // Step 1: Trigger AI Processing Animation steps
      setAiProcessStep('lang');
      
      setTimeout(() => setAiProcessStep('trans'), 1200);
      setTimeout(() => setAiProcessStep('image'), 2400);
      setTimeout(() => setAiProcessStep('dup'), 3600);
      setTimeout(() => setAiProcessStep('priority'), 4800);
      setTimeout(() => setAiProcessStep('recommend'), 6000);
      setTimeout(() => setAiProcessStep('report'), 7200);
      
      setTimeout(async () => {
        setAiProcessStep(null);
        // Step 2: Insert new complaint
        await submitComplaint({
          title: "Bazar Lane Water Grid Rupture & Clogging",
          description: "Heavy leakage from main connection is causing major road sinkage and muddy overflow in Bazar Lane Ward 3.",
          category: "Water",
          urgency: "critical",
          location: {
            lat: 28.6142,
            lng: 77.2092,
            address: "Bazar Lane, Sector 3, Ramnagar"
          },
          anonymous: false,
          imageFile: null,
          audioFile: null,
          language: "Hindi"
        });

        // Step 3: Shift view and open Copilot
        setActiveTab('recommendations');
        setIsCopilotOpen(true);
        
        // Push mock query & response into chat logs via direct event dispatch or message injection
        setTimeout(() => {
          sendChatMessage("Explain the priority score for Bazar Lane Water project.");
        }, 1000);

      }, 8400);
    };

    window.addEventListener('run-live-demo', runDemo);
    return () => window.removeEventListener('run-live-demo', runDemo);
  }, []);

  // Voice recording simulation
  const handleVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setChatInput("Show only critical road issues.");
    }, 2000);
  };

  // Recharts Chart calculation
  const getCategoryData = () => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      if (c.status === 'duplicate') return;
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const colors = {
      Roads: '#2563EB',
      Water: '#14B8A6',
      Waste: '#F59E0B',
      Infrastructure: '#8B5CF6',
      Health: '#EF4444',
      Education: '#10B981',
      Electricity: '#6366F1'
    };

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: (colors as any)[key] || '#94A3B8'
    }));
  };



  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatSubmitting(true);
    try {
      await sendChatMessage(chatInput);
      setChatInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setChatSubmitting(false);
    }
  };

  const downloadBriefPDF = () => {
    window.print();
  };

  const categoryData = getCategoryData();
  
  // Filter recommendations based on bubble click
  const filteredRecs = selectedCategoryFilter 
    ? recommendations.filter(r => r.title.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) || r.reasoning.toLowerCase().includes(selectedCategoryFilter.toLowerCase()))
    : recommendations;

  const activeRec = filteredRecs.find(r => r.id === selectedRecId) || filteredRecs[0];
  const totalBudget = recommendations.reduce((acc, curr) => acc + curr.budgetEstimation, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col gap-6 bg-dot-pattern relative">
      
      {/* AI PROCESS ANIMATION OVERLAY */}
      <AnimatePresence>
        {aiProcessStep && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <GlassCard className="p-8 max-w-md w-full bg-slate-900 border-slate-800 text-white flex flex-col gap-6" variant="blue">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-primary animate-spin" />
                <h3 className="text-base font-extrabold font-display uppercase tracking-wider">AI Decision Engine Active</h3>
              </div>

              <div className="space-y-3.5 text-xs font-mono text-slate-350">
                {[
                  { step: 'lang', label: 'Understanding Input Language...' },
                  { step: 'trans', label: 'Translating Dialect to English...' },
                  { step: 'image', label: 'Analyzing Evidence Images (Vision API)...' },
                  { step: 'dup', label: 'Detecting Spatial Duplicates (300m radius)...' },
                  { step: 'priority', label: 'Calculating Priority Score Weights...' },
                  { step: 'recommend', label: 'Generating Strategic Project Recommendation...' },
                  { step: 'report', label: 'Formatting Briefing Report...' }
                ].map((item, idx) => {
                  const isDone = aiProcessStep !== item.step && idx < ['lang', 'trans', 'image', 'dup', 'priority', 'recommend', 'report'].indexOf(aiProcessStep);
                  const isActive = aiProcessStep === item.step;
                  
                  return (
                    <div key={item.step} className="flex items-center justify-between">
                      <span className={isActive ? 'text-white font-bold' : isDone ? 'text-teal-400' : 'text-slate-500'}>
                        {isActive ? '➔ ' : isDone ? '✓ ' : '  '} {item.label}
                      </span>
                      {isActive && <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXECUTIVE SUMMARY HEADER BAR */}
      <div className="sticky top-[68px] z-40 w-full bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md py-2 border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Executive Capsule
          </div>
          <div className="flex items-center gap-6 text-[10px] sm:text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-300">
              Active Wards: <span className="font-bold text-primary">5</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-300">
              Total Proposed Budget: <span className="font-bold text-teal-500 dark:text-teal-400">₹{(totalBudget/100000).toFixed(1)} Lakhs</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-300">
              AI Priority Ratio: <span className="font-bold text-amber-500">Critical ({(stats.highPriority / (stats.totalComplaints || 1) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Representative Hub</span>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            MP Decision Intelligence Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate constituency priorities, approve AI-recommended development plans, and analyze real-time citizen feedback.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBriefModal(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
          >
            <FileText size={14} />
            Generate Brief
          </button>
          
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('run-live-demo'));
            }}
            className="flex items-center gap-1.5 px-4 py-3 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
          >
            <PlayCircle size={14} />
            Run Demo
          </button>
        </div>
      </div>

      {/* Quick stats metric grid */}
      <QuickStats stats={stats} />

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4">
        <button
          onClick={() => { setActiveTab('analytics'); setSelectedCategoryFilter(null); }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
        >
          <PieIcon size={14} />
          Visual Analytics
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'recommendations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
        >
          <Sparkles size={14} />
          AI Recommendations
          <span className="px-1.5 py-0.5 text-[9px] bg-primary text-white rounded-full font-extrabold shrink-0">
            {filteredRecs.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('map'); setSelectedCategoryFilter(null); }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'map' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
        >
          <MapIcon size={14} />
          Digital Twin Map
        </button>
        <button
          onClick={() => { setActiveTab('risks'); setSelectedCategoryFilter(null); }}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'risks' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
        >
          <AlertTriangle size={14} />
          Future Risk Forecast
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="flex-1 w-full mt-2">
        
        {/* TAB 1: VISUAL ANALYTICS & SMART CLUSTER BUBBLES */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Government Data Integration Panel */}
            <GlassCard className="md:col-span-2 p-6 border-slate-200/50" variant="blue">
              <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 block mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} className="text-primary" /> District Census & Assets Register
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
                {[
                  { label: 'Wards Population', val: '3.45 Lakhs', detail: 'Census 2026' },
                  { label: 'Asphalt Roads', val: '1,240 km', detail: 'Asset Log' },
                  { label: 'Schools Registered', val: '142 Facilities', detail: 'ED Database' },
                  { label: 'Clinics / Centers', val: '28 Centers', detail: 'Health DB' },
                  { label: 'Water Lines', val: '56K Connections', detail: 'Utility Grid' },
                  { label: 'Public Assets', val: '84 Structures', detail: 'Asset Index' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/10">
                    <span className="text-[9px] text-slate-400 font-semibold block">{item.label}</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1 font-display">{item.val}</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">{item.detail}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Smart Cluster Bubble Chart */}
            <GlassCard className="flex flex-col justify-between border-slate-200/50" variant="teal">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1">
                  <Layers size={14} className="text-secondary" /> Smart Cluster Bubbles
                </span>
                <span className="text-[9px] text-slate-400 mt-1 block">Bubble size represents density of complaints. Click a bubble to isolate recommendations.</span>
              </div>
              
              {/* Interactive Bubble force mock grid */}
              <div className="flex flex-wrap gap-4 justify-center items-center py-6 min-h-[220px]">
                {categoryData.map((item, idx) => {
                  const size = Math.min(Math.max(item.value * 16, 68), 120);
                  const isSelected = selectedCategoryFilter === item.name;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategoryFilter(isSelected ? null : item.name)}
                      className={`rounded-full flex flex-col items-center justify-center text-center font-bold text-white shadow-lg cursor-pointer border border-white/10 shrink-0 select-none relative transition-all duration-300 ${isSelected ? 'ring-4 ring-offset-2 ring-primary' : ''}`}
                      style={{ 
                        width: size, 
                        height: size, 
                        backgroundColor: item.color,
                      }}
                    >
                      <span className="text-[9px] tracking-tight font-display line-clamp-1 px-2">{item.name}</span>
                      <span className="text-sm font-extrabold mt-0.5">{item.value}</span>
                      <div className="absolute inset-0.5 rounded-full border border-white/15 pointer-events-none"></div>
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Category distribution */}
            <GlassCard className="flex flex-col h-88 justify-between border-slate-200/50" variant="blue">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} /> Incidents Category Spectrum
              </span>
              
              <div className="flex-1 min-h-[220px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: 500 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart data...</div>
                )}
              </div>
            </GlassCard>

          </div>
        )}

        {/* TAB 2: AI RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Recommendations Left List */}
            <div className="md:col-span-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Actions</span>
                {selectedCategoryFilter && (
                  <button 
                    onClick={() => setSelectedCategoryFilter(null)}
                    className="text-[9px] text-red-500 font-extrabold uppercase"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              {filteredRecs.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecId(r.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${r.id === activeRec?.id ? 'bg-primary/8 border-primary dark:bg-primary/15 dark:border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{r.title}</span>
                    <span className={`px-2.5 py-0.5 text-[8px] font-extrabold rounded-full tracking-wider border ${r.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : r.status === 'approved' ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-250/20'}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users size={12} className="text-slate-450" />
                      {r.expectedBeneficiaries.toLocaleString()} residents
                    </span>
                    <span className="font-extrabold text-primary dark:text-blue-300 font-display">Priority: {r.priorityScore}/100</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Recommendation Details View */}
            {activeRec && (
              <div className="md:col-span-7 flex">
                <GlassCard className="flex-1 p-8 border-slate-200/50 flex flex-col gap-6" variant="blue">
                  <div className="flex flex-col gap-2.5 border-b border-slate-100 dark:border-slate-850 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold text-slate-950 dark:text-white tracking-tight">{activeRec.title}</h3>
                      <div className="flex items-center gap-2">
                        <GeminiBadge type="ai" value="Active" />
                        <span className="text-xl font-extrabold text-teal-500 dark:text-teal-400 font-display">Score: {activeRec.priorityScore}/100</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-slate-400 shrink-0" /> {activeRec.location.address}
                    </span>
                  </div>

                  {/* Impact & Beneficiary Visual Showcase */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/10">
                      <span className="text-[8px] text-slate-450 uppercase block font-semibold">People Served</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">{(activeRec.expectedBeneficiaries).toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/10">
                      <span className="text-[8px] text-slate-450 uppercase block font-semibold">Schools Upgraded</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">{activeRec.title.includes('School') ? 1 : 0}</span>
                    </div>
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/10">
                      <span className="text-[8px] text-slate-450 uppercase block font-semibold">Villages Covered</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block mt-1">2 Villages</span>
                    </div>
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/10">
                      <span className="text-[8px] text-slate-450 uppercase block font-semibold">Quality of Life</span>
                      <span className="text-sm font-bold text-emerald-500 block mt-1">+{(activeRec.priorityScore * 0.4).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Project Timeline Stage Tracker */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide block mb-3">Project Execution Phases</span>
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                      
                      {[
                        { label: 'Planning', active: true },
                        { label: 'Approved', active: activeRec.status !== 'proposed' },
                        { label: 'Tender', active: activeRec.status === 'in_progress' || activeRec.status === 'completed' },
                        { label: 'Construction', active: activeRec.status === 'in_progress' || activeRec.status === 'completed' },
                        { label: 'Finished', active: activeRec.status === 'completed' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 relative z-10">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${item.active ? 'bg-primary border-primary text-white' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 text-slate-400'}`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-wide ${item.active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rationale Explainers */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">AI Explainer Panel</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/10 shadow-inner">
                      {activeRec.reasoning}
                    </p>
                  </div>

                  {/* Explainability Breakdown sliders */}
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Explainability Weighting</span>
                    
                    <div className="space-y-3.5">
                      {[
                        { label: 'Citizen Demand Frequency', current: activeRec.scoreBreakdown.demandWeight, max: 30, color: 'bg-blue-500' },
                        { label: 'Infrastructure Gap Metrics', current: activeRec.scoreBreakdown.gapWeight, max: 25, color: 'bg-teal-500' },
                        { label: 'Category Urgency Weight', current: activeRec.scoreBreakdown.urgencyWeight, max: 25, color: 'bg-orange-500' },
                        { label: 'Local Population Density', current: activeRec.scoreBreakdown.populationWeight, max: 20, color: 'bg-purple-500' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-mono text-[10px] text-slate-500 font-semibold">
                            <span>{item.label}</span>
                            <span className="text-slate-800 dark:text-slate-200">{item.current}/{item.max}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${(item.current / item.max) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </GlassCard>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HOTSPOT HEATMAP / DIGITAL TWIN */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-12">
              <GlassCard className="p-6 border-slate-200/50 flex flex-col justify-between min-h-[500px]" variant="teal">
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digital Twin Map Workspace</span>
                  <span className="text-xs text-slate-400 mt-1">Review live coordinate mappings, density indicators, and infrastructure overlays.</span>
                </div>
                <div className="flex-1 w-full relative min-h-[400px]">
                  <HeatmapView complaints={complaints} />
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* TAB 4: PREDICTIVE RISKS */}
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {[
              {
                title: 'High-Risk Road Sub-base Cracking',
                category: 'Roads',
                desc: 'Gemini models anticipate severe surface erosion and micro-fractures inside Ward 3 near Bazar Road due to heavy logging trucks.',
                prob: 84,
                timeline: '3-6 Months',
                conf: 91,
                action: 'Reinforce concrete foundations and clean gutter drains immediately.'
              },
              {
                title: 'Monsoon Flooding Vulnerability',
                category: 'Water',
                desc: 'Clogged drainage blockages on Bazar Lane present an active flood overflow risk if rainfall exceeds 30mm/hr.',
                prob: 72,
                timeline: '2-3 Months',
                conf: 88,
                action: 'Clear municipal storm gutters and set sandbag guides.'
              },
              {
                title: 'Primary Health Center Capacity Peak',
                category: 'Health',
                desc: 'Local clinic registries indicate a capacity peak due to seasonal viral intakes, leaving medical supplies low.',
                prob: 68,
                timeline: '1-2 Months',
                conf: 85,
                action: 'Provide emergency funding for essential pharmaceuticals and diagnostic kits.'
              },
              {
                title: 'Voltage Spiking & Grid Load Failure',
                category: 'Electricity',
                desc: 'Over-indexing of domestic air cooling grid linkages exposes the Sector 3 transformer to overheating limits.',
                prob: 61,
                timeline: '1 Month',
                conf: 90,
                action: 'Install a high-capacity circuit breaker stabilizer unit.'
              }
            ].map((risk, idx) => (
              <GlassCard key={idx} className="p-6 flex flex-col gap-4 border-slate-200/50" variant="blue">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{risk.title}</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Predictive Analyzer Category: {risk.category}</span>
                  </div>
                  <span className="text-sm font-extrabold text-red-500 font-display">{risk.prob}% Probability</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-100/30 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/5">
                  {risk.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <div>
                    <span>EXPECTED TIMELINE</span>
                    <span className="block text-slate-800 dark:text-white font-bold mt-1 flex items-center gap-1">
                      <Calendar size={12} className="text-primary" /> {risk.timeline}
                    </span>
                  </div>
                  <div>
                    <span>AI CONFIDENCE</span>
                    <span className="block text-slate-800 dark:text-white font-bold mt-1 flex items-center gap-1">
                      <Sparkles size={12} className="text-secondary" /> {risk.conf}% Match
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    <strong className="font-bold uppercase tracking-wider text-[8px] text-amber-500 block mb-0.5">Preventive Strategy</strong>
                    {risk.action}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

      </div>

      {/* FLOATING GEMINI COPILOT SLIDE-IN CHAT PANEL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/20"
        >
          <Bot size={24} className={isCopilotOpen ? 'hidden' : 'animate-pulse'} />
          <X size={24} className={isCopilotOpen ? 'block' : 'hidden'} />
        </button>

        {/* Drawer overlay */}
        <AnimatePresence>
          {isCopilotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 h-[520px]"
            >
              <GlassCard className="h-full flex flex-col justify-between p-5 border-slate-200/60 shadow-2xl overflow-hidden" variant="blue">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 flex items-center justify-center">
                      <Bot size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                        JanVoice Copilot
                      </span>
                      <span className="text-[9px] text-slate-400">Powered by Gemini 1.5 Pro</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-250 dark:bg-slate-800'}`}
                    title="Simulate Voice Input"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>

                {/* Suggestions Row */}
                <div className="flex gap-2 overflow-x-auto py-2 shrink-0 border-b border-slate-100 dark:border-slate-850 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <button 
                    type="button"
                    onClick={() => sendChatMessage("I have ₹5 Crore. What should I fund?")}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer shrink-0 text-slate-650 dark:text-slate-300"
                  >
                    ₹5Cr Budget Plan
                  </button>
                  <button 
                    type="button"
                    onClick={() => sendChatMessage("Show only critical road issues.")}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer shrink-0 text-slate-650 dark:text-slate-300"
                  >
                    Road Issues
                  </button>
                  <button 
                    type="button"
                    onClick={() => sendChatMessage("Summarize this constituency.")}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer shrink-0 text-slate-650 dark:text-slate-300"
                  >
                    Summarize Wards
                  </button>
                </div>

                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
                  {chatHistory.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/40 dark:border-slate-800/80 shadow-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}

                  {chatSubmitting && (
                    <div className="flex items-center gap-1.5 mr-auto p-3 bg-slate-100 dark:bg-slate-850 rounded-2xl rounded-tl-none text-slate-400 border border-slate-200/20">
                      <span className="wave-bar h-3 bg-slate-400"></span>
                      <span className="wave-bar h-3 bg-slate-400" style={{ animationDelay: '0.1s' }}></span>
                      <span className="wave-bar h-3 bg-slate-400" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-3.5 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask e.g. What is the total budget?"
                    className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={chatSubmitting || !chatInput}
                    className="p-2.5 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EXECUTIVE BRIEF BRIEFING MODAL */}
      <AnimatePresence>
        {showBriefModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <GlassCard className="p-8 max-w-2xl w-full flex flex-col gap-6" variant="blue">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <span className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">MLA Executive Briefing Summary</span>
                </div>
                <button 
                  onClick={() => setShowBriefModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed max-h-[350px] overflow-y-auto pr-1 text-slate-650 dark:text-slate-350">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-1">1. Brief Overview</h4>
                  <p>JanVoice AI summarized 48 active citizen municipal reports in Ramnagar, generating 3 key developmental priorities focusing on Roads, Waste, and Water systems.</p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-1">2. Core Recommendations</h4>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>Road Paving (Ward 3)</strong>: Expected Cost ₹15.8L, serving 3,500 residents. Priority score 92/100.</li>
                    <li><strong>Water grid lines (Ward 5)</strong>: Expected Cost ₹6.4L, serving 2,500 residents. Priority score 85/100.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] mb-1">3. Key Briefing Talking Points</h4>
                  <p>Citizen urgency indexes are driven by seasonal monsoon road cracking. Recommending immediate concrete sub-base drainage reinforcements before construction tenders are finalized.</p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-200/50 dark:border-slate-800 pt-4">
                <button
                  onClick={downloadBriefPDF}
                  className="flex-1 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary-hover flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  Print / Download PDF Brief
                </button>
                <button
                  onClick={() => setShowBriefModal(false)}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
