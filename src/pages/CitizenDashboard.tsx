import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { AudioRecorder } from '../components/AudioRecorder';
import { LocationPicker } from '../components/LocationPicker';
import { GeminiBadge } from '../components/GeminiBadge';
import { 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileImage,
  Sparkles,
  Globe,
  Bookmark,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, submitComplaint } = useData();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads');
  const [urgency, setUrgency] = useState('medium');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 28.6139,
    lng: 77.2090,
    address: 'Main Road, Sector 3, Ramnagar'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [language, setLanguage] = useState('Hindi');
  const [anonymous, setAnonymous] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [processStep, setProcessStep] = useState<string | null>(null);

  // Filter user complaints
  const userComplaints = complaints.filter(c => c.citizenId === user?.uid);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in the title and description fields.");
      return;
    }

    setSubmitting(true);
    setProcessStep('lang');

    // Stagger process animation steps
    const steps = ['lang', 'trans', 'image', 'dup', 'priority', 'recommend', 'report'];
    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => {
        setProcessStep(steps[i]);
      }, i * 800);
    }

    try {
      setTimeout(async () => {
        await submitComplaint({
          title,
          description,
          category,
          urgency,
          location,
          anonymous,
          imageFile,
          audioFile: audioBlob,
          language
        });
        
        setSuccess(true);
        setProcessStep(null);
        setSubmitting(false);

        // Reset form
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        setAudioBlob(null);
        
        setTimeout(() => setSuccess(false), 5000);
      }, steps.length * 800);
    } catch (err) {
      console.error(err);
      setProcessStep(null);
      setSubmitting(false);
      alert("Failed to lodge complaint. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="text-slate-400" size={12} />;
      case 'processing':
        return <Sparkles className="text-primary animate-pulse" size={12} />;
      case 'duplicate':
        return <AlertCircle className="text-amber-500" size={12} />;
      case 'action_proposed':
        return <Sparkles className="text-secondary" size={12} />;
      case 'resolved':
        return <CheckCircle2 className="text-success" size={12} />;
      default:
        return <HelpCircle size={12} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'processing': return 'AI Processing';
      case 'duplicate': return 'Grouped Duplicate';
      case 'action_proposed': return 'Action Proposed';
      case 'resolved': return 'Resolved';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50';
      case 'processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-950/20 border border-blue-500/20 animate-pulse-slow';
      case 'duplicate': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-500/20';
      case 'action_proposed': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:bg-teal-950/20 border border-teal-500/20';
      case 'resolved': return 'bg-green-500/10 text-green-600 dark:text-green-400 dark:bg-green-950/20 border border-green-500/20';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start bg-dot-pattern">
      
      {/* LEFT: Submit Complaint Form */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Citizen Intake Portal</span>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            Lodge Municipal Complaint
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide details in your local language. Gemini AI will handle transcription, translation, and duplicate groupings.
          </p>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-xs rounded-2xl flex items-center gap-2 font-semibold shadow-sm"
          >
            <CheckCircle2 size={16} />
            Complaint registered successfully! The AI engine is analyzing the details. Check the progress timeline.
          </motion.div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <GlassCard className="space-y-5 border-slate-200/50" variant="blue">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FileText size={16} className="text-primary" />
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">Complaint Metadata</span>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe asphalt erosion near main bus station"
                className="w-full glass-input rounded-xl px-4 py-3 text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Detailed Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the location milestones, duration of the issue, and impacts on public safety..."
                className="w-full h-32 p-4 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            {/* Language & Category selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Spoken Language</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full glass-input rounded-xl pl-8 pr-3 py-3 text-xs bg-transparent"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                  </select>
                  <Globe className="absolute left-2.5 top-3.5 text-slate-400" size={12} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-3 text-xs bg-transparent"
                >
                  <option value="Roads">Roads & Transport</option>
                  <option value="Water">Water Infrastructure</option>
                  <option value="Waste">Waste Management</option>
                  <option value="Infrastructure">Public Infrastructure</option>
                  <option value="Health">Health & Sanitation</option>
                  <option value="Education">Education Facilities</option>
                  <option value="Electricity">Electricity & Grid lines</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-3 text-xs bg-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Urgent</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Multimodal Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard className="p-5 border-slate-200/50 flex flex-col justify-between" variant="teal">
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <FileImage size={15} className="text-secondary" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Image Evidence</span>
                </div>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200 dark:border-slate-800 shadow-inner">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-650 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl h-28 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-all duration-300">
                    <FileImage className="text-slate-400 mb-1" size={20} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attach Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </GlassCard>

            <AudioRecorder onAudioSaved={setAudioBlob} />
          </div>

          {/* Location Selection */}
          <GlassCard className="p-5 border-slate-200/50">
            <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100 dark:border-slate-850">
              <MapPin size={15} className="text-primary" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Incident Coordinates</span>
            </div>
            <LocationPicker onLocationSelected={setLocation} />
          </GlassCard>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between p-4 bg-slate-100/75 dark:bg-slate-900/60 rounded-2xl border border-slate-200/30 dark:border-slate-900">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-slate-350 dark:border-slate-800 text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-slate-650 dark:text-slate-300 font-bold select-none uppercase tracking-wide">File Anonymously</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gemini analyzing...
                </>
              ) : (
                <>
                  <Send size={12} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Previous Complaints Status Tracker */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">Submission Logs</span>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">Your Filed Reports</h2>
          <p className="text-xs text-slate-500">Track resolution stages of your community requests.</p>
        </div>

        {userComplaints.length === 0 ? (
          <GlassCard className="p-10 text-center border-slate-200/50 flex flex-col items-center justify-center">
            <Bookmark size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">No active complaints found</span>
            <p className="text-[10px] text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">Fill in the details on the left to submit your first municipal report.</p>
          </GlassCard>
        ) : (
          <div className="space-y-5 max-h-[750px] overflow-y-auto pr-1">
            {userComplaints.map(c => (
              <GlassCard key={c.id} className="p-5 flex flex-col gap-4 border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.01)]" hoverable>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</span>
                    <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                      <MapPin size={9} className="text-slate-400" />
                      {c.location.address.split(',')[0]}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${getStatusColor(c.status)}`}>
                    {getStatusIcon(c.status)}
                    {getStatusText(c.status)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 bg-slate-100/40 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/10">
                  {c.translatedDescription}
                </p>

                {c.imageAnalysis && (
                  <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10 text-[10px] text-blue-600 dark:text-blue-300 flex items-start gap-1.5">
                    <Sparkles size={11} className="mt-0.5 shrink-0 text-blue-500" />
                    <span>
                      <strong className="font-semibold uppercase tracking-wider text-[8px] text-blue-400 block mb-0.5">Gemini Vision Log</strong> 
                      {c.imageAnalysis}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                  <div className="flex gap-2">
                    <GeminiBadge type="category" value={c.category} />
                    <GeminiBadge type="urgency" value={c.urgency} urgency={c.urgency} />
                  </div>
                  <span className="font-mono text-[9px]">{new Date(c.timestamp).toLocaleDateString()}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* AI PROCESS ANIMATION OVERLAY */}
      <AnimatePresence>
        {processStep && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <GlassCard className="p-8 max-w-md w-full bg-slate-900 border-slate-800 text-white flex flex-col gap-6" variant="blue">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-primary animate-spin" />
                <h3 className="text-base font-extrabold font-display uppercase tracking-wider">AI Pipeline Active</h3>
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
                  const isDone = processStep !== item.step && idx < ['lang', 'trans', 'image', 'dup', 'priority', 'recommend', 'report'].indexOf(processStep);
                  const isActive = processStep === item.step;
                  
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

    </div>
  );
};
