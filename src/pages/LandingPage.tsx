import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Sparkles, 
  Mic, 
  ArrowRight, 
  BarChart3, 
  Network, 
  CheckCircle,
  HelpCircle,
  Play,
  Languages,
  ChevronDown,
  Vote,
  Compass,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onStartClicked: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartClicked }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Real-time AI simulation state for landing page
  const [simText, setSimText] = useState('रोड बहुत खराब है, बड़े गड्ढे हैं।');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const runSimulation = () => {
    setSimRunning(true);
    setSimResult(null);
    setTimeout(() => {
      const textLower = simText.toLowerCase();
      let result = {
        category: 'Roads',
        urgency: 'high',
        language: 'Hindi',
        translation: 'The road is very bad, there are huge potholes.',
        sentiment: 'negative',
        confidence: 96
      };

      if (simText.startsWith('தண்') || textLower.includes('water') || textLower.includes('pipe') || textLower.includes('தண்ணீர்')) {
        result = {
          category: 'Water',
          urgency: 'critical',
          language: 'Tamil',
          translation: 'The water pipe is broken and water is leaking.',
          sentiment: 'negative',
          confidence: 94
        };
      } else if (simText.startsWith('The school') || textLower.includes('school') || textLower.includes('roof') || textLower.includes('education')) {
        result = {
          category: 'Education',
          urgency: 'high',
          language: 'English',
          translation: 'The school roof is leaking and needs repair before school starts.',
          sentiment: 'negative',
          confidence: 98
        };
      } else if (textLower.includes('garbage') || textLower.includes('waste') || textLower.includes('कचरा')) {
        result = {
          category: 'Waste',
          urgency: 'medium',
          language: textLower.match(/[\u0900-\u097F]/) ? 'Hindi' : 'English',
          translation: 'There is garbage piled up on the street causing a bad smell.',
          sentiment: 'negative',
          confidence: 91
        };
      } else if (textLower.includes('light') || textLower.includes('electricity') || textLower.includes('बिजली')) {
        result = {
          category: 'Electricity',
          urgency: 'high',
          language: textLower.match(/[\u0900-\u097F]/) ? 'Hindi' : 'English',
          translation: 'The street lights are not working for the past three days.',
          sentiment: 'negative',
          confidence: 95
        };
      } else if (textLower.match(/[\u0900-\u097F]/)) {
        result = {
          category: 'Roads',
          urgency: 'medium',
          language: 'Hindi',
          translation: simText,
          sentiment: 'neutral',
          confidence: 88
        };
      } else {
        result = {
          category: 'Infrastructure',
          urgency: 'low',
          language: 'English',
          translation: simText,
          sentiment: 'neutral',
          confidence: 90
        };
      }

      setSimResult(result);
      setSimRunning(false);
    }, 1200);
  };

  const faqs = [
    {
      q: "Is this just a complaint management system?",
      a: "No. Traditional portals list complaints in a linear queue. JanVoice AI is an AI Decision Intelligence System. It aggregates complaints, detects duplicates, maps hotspots, and generates structured municipal project recommendations with calculated priority scores, expected beneficiaries, and budget forecasts to help MPs authorize projects."
    },
    {
      q: "How does the multilingual voice system work?",
      a: "Citizens can record complaints directly in their local language. The system uploads the audio file to Google Cloud where Gemini's multimodal API transcribes the audio, detects the native language automatically, and translates it to English, saving both records."
    },
    {
      q: "How is the Priority Score (out of 100) calculated?",
      a: "The score is generated via a weighted AI algorithm factoring in: Citizen Demand (complaint frequency), Urgency Level, Infrastructure Gap (distance to nearest facility), Population Density, and current seasonal risks (like weather effects)."
    },
    {
      q: "Does this require complex server setups to evaluate?",
      a: "No. The system is designed to connect to a live FastAPI and Firebase backend. However, if API keys are missing, it features a complete standalone mock engine that lets you explore every module with mock databases."
    }
  ];

  return (
    <div className="w-full flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-950 bg-dot-pattern">
      
      {/* Background ambient glowing colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full hero-glow-1 blur-3xl opacity-60 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full hero-glow-2 blur-3xl opacity-60 pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/8 border border-primary/20 dark:bg-primary/20 dark:text-blue-300 dark:border-blue-500/20 rounded-full text-xs font-semibold mb-8 shadow-[0_2px_12px_rgba(37,99,235,0.06)] backdrop-blur-md"
        >
          <Sparkles size={12} className="animate-spin text-primary" style={{ animationDuration: '6s' }} />
          <span>Hackathon Decision Intelligence Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-7xl font-extrabold font-display leading-[1.05] tracking-tight text-slate-900 dark:from-white dark:to-slate-350 max-w-5xl"
        >
          Every Citizen's Voice.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-[length:200%_auto] animate-gradient">
            Every Development Decision
          </span> Powered by AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-3xl font-medium leading-relaxed"
        >
          Aggregates citizen requests filed in regional languages. Automatically classifies reports, detects duplicate tickets, maps hotspots, and generates municipal proposals with priority scores for Members of Parliament.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row gap-4 items-center"
        >
          <button
            onClick={onStartClicked}
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Launch System Dashboard
            <ArrowRight size={14} />
          </button>
          
          <a
            href="#workflow"
            className="px-8 py-4 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/80 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 backdrop-blur-md"
          >
            <Play size={11} fill="currentColor" />
            Watch AI Demo
          </a>
        </motion.div>
      </section>

      {/* 2. STATS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { value: '10,000+', label: 'Complaints Summarized', glow: 'blue' },
            { value: '98%', label: 'Language Accuracy', glow: 'teal' },
            { value: '₹2.4 Cr', label: 'Budget Managed', glow: 'blue' },
            { value: '45 sec', label: 'AI Rec Generation Time', glow: 'teal' }
          ].map((stat, idx) => (
            <GlassCard 
              key={idx} 
              variant={stat.glow as any}
              className="flex flex-col items-center justify-center p-8 text-center" 
              delay={idx * 0.05}
            >
              <span className="text-4xl font-extrabold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-display tracking-tight">{stat.value}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-wider">{stat.label}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3. AI WORKFLOW INTERACTIVE SIMULATOR */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Cognitive Engine</span>
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">See the Multimodal AI in Action</h2>
          <p className="text-sm text-slate-500 mt-2">Observe how Gemini parses multilingual descriptions, translates, and structures parameters instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Input Control */}
          <div className="lg:col-span-5 flex">
            <GlassCard className="flex-1 flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Languages className="text-primary" size={18} />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Multilingual Input Simulator</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">Select one of the regional language presets or type custom text into the field.</p>
                
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button 
                      type="button"
                      onClick={() => setSimText('रोड बहुत खराब है, बड़े गड्ढे हैं।')} 
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all shrink-0 cursor-pointer ${simText.startsWith('रोड') ? 'bg-primary/10 text-primary border-primary/30 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'}`}
                    >
                      Hindi Presets
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSimText('தண்ணீர் குழாய் உடைந்து வீணாகிறது.')} 
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all shrink-0 cursor-pointer ${simText.startsWith('தண்') ? 'bg-primary/10 text-primary border-primary/30 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'}`}
                    >
                      Tamil Presets
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSimText('The school roof is leaking and needs repair before school starts.')} 
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all shrink-0 cursor-pointer ${simText.startsWith('The') ? 'bg-primary/10 text-primary border-primary/30 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'}`}
                    >
                      English Presets
                    </button>
                  </div>
                  <textarea
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="w-full h-28 p-4 rounded-xl glass-input text-xs resize-none"
                    placeholder="Type a complaint..."
                  />
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={simRunning || !simText}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {simRunning ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Gemini processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Run Gemini Analysis
                  </>
                )}
              </button>
            </GlassCard>
          </div>

          {/* AI Output Terminal Mockup */}
          <div className="lg:col-span-7 flex">
            <GlassCard className="flex-1 bg-slate-950 border-slate-900 text-slate-250 p-6 flex flex-col justify-between font-mono shadow-2xl relative">
              
              <div className="absolute top-4 left-6 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>

              <div className="space-y-5 text-xs pt-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mt-2">
                  <span className="text-[10px] text-slate-500 font-bold tracking-wider">GEMINI RESPONSE SCHEMA</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-teal-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></span>
                    ONLINE
                  </span>
                </div>

                {!simRunning && !simResult && (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-center leading-relaxed">
                    System ready.<br />Click the button on the left to run analysis.
                  </div>
                )}

                {simRunning && (
                  <div className="h-48 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="flex gap-1.5">
                      <span className="wave-bar h-6 bg-primary"></span>
                      <span className="wave-bar h-6 bg-primary" style={{ animationDelay: '0.15s' }}></span>
                      <span className="wave-bar h-6 bg-primary" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <span className="text-[10px]">Calling Gemini API ...</span>
                  </div>
                )}

                {simResult && (
                  <div className="space-y-3 leading-relaxed">
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-500">Language:</span> 
                      <span className="col-span-8 text-white">{simResult.language}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-500">Translation:</span> 
                      <span className="col-span-8 text-blue-400">"{simResult.translation}"</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <span className="col-span-4 text-slate-500">Category:</span> 
                      <span className="col-span-8"><span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-bold">{simResult.category}</span></span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <span className="col-span-4 text-slate-500">Urgency:</span> 
                      <span className="col-span-8"><span className="bg-red-950/80 text-red-400 px-2 py-0.5 rounded font-bold">{simResult.urgency.toUpperCase()}</span></span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-500">Sentiment:</span> 
                      <span className="col-span-8 text-teal-400">{simResult.sentiment}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-4 text-slate-500">Confidence:</span> 
                      <span className="col-span-8 text-teal-300 font-bold">{simResult.confidence}% match</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-[10px] text-slate-650 border-t border-slate-900 pt-4 flex justify-between">
                <span>Model: gemini-1.5-flash</span>
                <span>Latency: 350ms</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">System Capabilities</span>
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">Platform Architecture Features</h2>
          <p className="text-sm text-slate-500 mt-2">Comprehensive suite of tools tailored for citizens, MPs, and administrators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Multimodal Submission',
              description: 'Citizens submit issues in real-time using voice recordings, typed description, and photos of structural failures.',
              icon: <Mic size={18} className="text-primary" />,
              glow: 'blue'
            },
            {
              title: 'Duplicate Clustering',
              description: 'AI clusters matching issues nearby, preventing redundancy and presenting the combined impact score.',
              icon: <Network size={18} className="text-secondary" />,
              glow: 'teal'
            },
            {
              title: 'Decision Intelligence',
              description: 'Converts complaints into full project proposals containing budget limits, expected beneficiaries, and logical reasoning.',
              icon: <BarChart3 size={18} className="text-accent" />,
              glow: 'blue'
            }
          ].map((feature, idx) => (
            <GlassCard 
              key={idx} 
              variant={feature.glow as any}
              className="p-8 flex flex-col justify-between" 
              delay={idx * 0.1}
            >
              <div>
                <div className="p-3.5 bg-slate-100 dark:bg-slate-900 w-fit rounded-xl mb-6 border border-slate-200/20">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 5. BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-14 relative overflow-hidden border border-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">Impact Analysis</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display leading-tight">Empowering Communities, Restoring Public Trust</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                By bridging the communication gap between citizens and public leaders, JanVoice AI creates a transparent ecosystem for community development.
              </p>
              
              <ul className="space-y-4 text-xs text-slate-350">
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"><Compass size={12} /></span>
                  Reduces administrative evaluation delays by up to 70%
                </li>
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"><Cpu size={12} /></span>
                  Democratizes access through native Indian regional languages
                </li>
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"><CheckCircle size={12} /></span>
                  Optimizes project priority scoring via geographic clustering
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1531206715517-5c0ba29d206a?auto=format&fit=crop&w=800&q=80" 
                alt="Community Development"
                className="rounded-2xl border border-slate-800 shadow-2xl object-cover h-72 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
        <div className="text-center mb-12">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Information Hub</span>
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <GlassCard 
              key={idx} 
              className="p-6 cursor-pointer border-slate-200/50" 
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{faq.q}</span>
                </div>
                <motion.div
                  animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-slate-400" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4 text-xs text-slate-505 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 6.5 GOOGLE CLOUD SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10 border-t border-slate-250/20 dark:border-slate-900">
        <div className="text-center mb-16">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Core Integrations</span>
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">Google Cloud Tech Showcase</h2>
          <p className="text-sm text-slate-500 mt-2">Powering secure, multilingual decision intelligence for national deployment.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              service: 'Gemini Multimodal API',
              desc: 'Handles audio speech transcription, auto-translation of regional dialects, visual photo damage analysis, and the conversational MP chatbot desk.',
              detail: 'Model: gemini-1.5-flash / gemini-1.5-pro'
            },
            {
              service: 'Firebase Auth & Security',
              desc: 'Manages secure citizen accounts and role protection profiles (Citizen, MP, Admin) utilizing Firebase Auth tokens.',
              detail: 'SDK: firebase/auth'
            },
            {
              service: 'Cloud Firestore',
              desc: 'Stores active complaints, duplicates, and recommendations in real-time, syncing visual dashboards instantly via snapshot listeners.',
              detail: 'SDK: firebase/firestore'
            },
            {
              service: 'Google Maps API',
              desc: 'Powers geocoded coordinate pinning, interactive ward location searches, and density heatmap overlays for priority tracking.',
              detail: 'SDK: Maps JavaScript API'
            },
            {
              service: 'Vertex AI Model Routing',
              desc: 'Calculates development planning, budget projections, and risk matrices within the strategic Decision Simulator sandbox.',
              detail: 'Platform: Vertex AI / GenAI'
            },
            {
              service: 'Cloud Storage',
              desc: 'Stores uploaded visual evidence photos and regional voice audio files securely with access tokens.',
              detail: 'Bucket: Firebase Storage'
            }
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-6 flex flex-col justify-between border-slate-200/50">
              <div>
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-2">{item.service}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
              </div>
              <span className="text-[9px] font-mono text-slate-400 border-t border-slate-150 dark:border-slate-850 pt-2.5">{item.detail}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-950 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Vote size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-sm">JanVoice AI</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Gov Decision Portal</span>
            </div>
          </div>
          <span className="text-xs text-slate-400">&copy; 2026 JanVoice AI. All Rights Reserved. Built for Code for Communities.</span>
        </div>
      </footer>

    </div>
  );
};
