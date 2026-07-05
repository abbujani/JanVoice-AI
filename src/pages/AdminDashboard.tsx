import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { GeminiBadge } from '../components/GeminiBadge';
import { GlassCard } from '../components/GlassCard';
import { 
  MapPin, 
  RefreshCw, 
  GitMerge, 
  UserCheck,
  ShieldCheck,
  Edit2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, switchMockRole, isStandalone } = useAuth();
  const { 
    complaints, 
    verifyComplaint, 
    mergeAsDuplicate, 
    triggerReclustering 
  } = useData();

  // Edit classification state
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('Roads');
  const [editUrgency, setEditUrgency] = useState('medium');

  // Merging state
  const [mergeChildId, setMergeChildId] = useState<string | null>(null);
  const [mergeParentId, setMergeParentId] = useState('');

  // Filter out resolved ones to focus on pending/active moderation
  const activeComplaints = complaints.filter(c => c.status !== 'resolved');

  const handleVerifySubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    await verifyComplaint(id, editCategory, editUrgency);
    setSelectedCompId(null);
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeChildId || !mergeParentId) return;
    if (mergeChildId === mergeParentId) {
      alert("A complaint cannot be marked as a duplicate of itself.");
      return;
    }
    await mergeAsDuplicate(mergeChildId, mergeParentId);
    setMergeChildId(null);
    setMergeParentId('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 flex flex-col gap-8 bg-dot-pattern">
      
      {/* Header and Reclustering trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Administration Portal</span>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            System Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Moderate citizen submissions, override AI categorizations, map duplicate clusters, and manage sandbox simulation profiles.
          </p>
        </div>

        <button
          onClick={triggerReclustering}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
          Re-Cluster Incidents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: Complaints Moderation Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Moderation Queue</span>
          
          {activeComplaints.length === 0 ? (
            <GlassCard className="p-10 text-center text-slate-500 border-slate-200/50 flex flex-col items-center justify-center">
              <ShieldCheck size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
              <span className="text-xs font-bold text-slate-855 dark:text-slate-300">All submissions moderated</span>
              <p className="text-[9px] text-slate-400 mt-1">There are no pending tickets in the administration queue.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeComplaints.map(c => (
                <GlassCard key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-slate-200/50" hoverable>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</span>
                      <span className="text-[8px] text-slate-400 font-mono font-extrabold uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-250/20">ID: {c.id}</span>
                      {c.parentId && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold rounded">
                          Duplicate of {c.parentId}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-550 leading-relaxed max-w-xl">
                      {c.translatedDescription}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                      <MapPin size={11} className="text-secondary shrink-0" />
                      <span className="truncate">{c.location.address}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <GeminiBadge type="category" value={c.category} />
                      <GeminiBadge type="urgency" value={c.urgency} urgency={c.urgency} />
                      <GeminiBadge type="confidence" value={c.confidenceScore} />
                      <GeminiBadge type="sentiment" value={c.sentiment} />
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-0">
                    <button
                      onClick={() => {
                        setSelectedCompId(c.id);
                        setEditCategory(c.category);
                        setEditUrgency(c.urgency);
                      }}
                      className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 border border-primary/10"
                    >
                      <Edit2 size={11} />
                      Reclassify
                    </button>
                    
                    {!c.parentId && c.status !== 'duplicate' && (
                      <button
                        onClick={() => setMergeChildId(c.id)}
                        className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-650 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 border border-amber-500/10"
                      >
                        <GitMerge size={11} />
                        Merge
                      </button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Admin Tools Sidebars */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Tool 1: Reclassify Card */}
          {selectedCompId && (
            <GlassCard className="p-5 border-slate-200/50" variant="blue">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-4 uppercase tracking-wider">Reclassify Ticket</span>
              <form onSubmit={(e) => handleVerifySubmit(e, selectedCompId)} className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-550 block mb-1">Target Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-transparent"
                  >
                    <option value="Roads">Roads & Transport</option>
                    <option value="Water">Water Infrastructure</option>
                    <option value="Waste">Waste Management</option>
                    <option value="Infrastructure">Public Infrastructure</option>
                    <option value="Health">Health & Sanitation</option>
                    <option value="Education">Education Facilities</option>
                    <option value="Electricity">Electricity & grid</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-550 block mb-1">Urgency Rank</label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-transparent"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Urgent</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary-hover cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCompId(null)}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Tool 2: Merge Duplicates Panel */}
          {mergeChildId && (
            <GlassCard className="p-5 border-slate-200/50" variant="teal">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <GitMerge size={15} className="text-secondary" /> Merge Duplicates
              </span>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Assign ticket <strong className="text-slate-800 dark:text-white font-mono">{mergeChildId}</strong> to a primary parent complaint.
              </p>
              <form onSubmit={handleMergeSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-550 block mb-1">Primary Incident ID</label>
                  <select
                    required
                    value={mergeParentId}
                    onChange={(e) => setMergeParentId(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-transparent"
                  >
                    <option value="">-- Choose Parent Incident --</option>
                    {complaints.filter(c => c.id !== mergeChildId && !c.parentId && c.status !== 'duplicate').map(c => (
                      <option key={c.id} value={c.id}>
                        [{c.id}] {c.title.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Confirm Merge
                  </button>
                  <button
                    type="button"
                    onClick={() => setMergeChildId(null)}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Tool 3: Role Management simulator */}
          {isStandalone && user && (
            <GlassCard className="p-5 border-slate-200/50">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={15} className="text-primary" /> Sandbox Control Node
              </span>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Instantly swap between mock citizen, representative, or administrator roles to preview all dashboard modules.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => switchMockRole('citizen')}
                  className={`w-full py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${user.role === 'citizen' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-200/50'}`}
                >
                  Citizen Console
                </button>
                <button
                  onClick={() => switchMockRole('mp')}
                  className={`w-full py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${user.role === 'mp' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-855 text-slate-700 dark:text-slate-350 hover:bg-slate-200/50'}`}
                >
                  MP Executive Desk
                </button>
                <button
                  onClick={() => switchMockRole('admin')}
                  className={`w-full py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${user.role === 'admin' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-200/50'}`}
                >
                  District Administrator
                </button>
              </div>
            </GlassCard>
          )}

        </div>

      </div>

    </div>
  );
};
