import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GeminiBadge } from '../components/GeminiBadge';
import { 
  Sparkles, 
  DollarSign, 
  Clock, 
  Target, 
  Layers, 
  AlertTriangle, 
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DecisionSimulator: React.FC = () => {
  // Inputs
  const [budget, setBudget] = useState(30000000); // 3 Crores default
  const [timeline, setTimeline] = useState(12); // 12 months
  const [focus, setFocus] = useState('balance');
  const [category, setCategory] = useState('All');
  const [ruralWeight, setRuralWeight] = useState(50); // 50% rural, 50% urban
  const [coverageTarget, setCoverageTarget] = useState(15000);

  const [generating, setGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGeneratePlan = () => {
    setGenerating(true);
    setPlanGenerated(false);
    
    // Simulate complex AI planning model
    setTimeout(() => {
      // Calculate dynamic values based on inputs
      const impactScore = Math.min(
        Math.round(75 + (budget / 10000000) * 1.5 + (timeline / 12) * 2 + (focus === 'balance' ? 5 : 2)),
        100
      );

      const allocation = [
        { name: 'Roads & Transport', percent: category === 'All' || category === 'Roads' ? 45 : 0, color: 'bg-blue-500' },
        { name: 'Water Grid', percent: category === 'All' || category === 'Water' ? 30 : 0, color: 'bg-teal-500' },
        { name: 'Waste Cleanup', percent: category === 'All' || category === 'Waste' ? 10 : 0, color: 'bg-amber-500' },
        { name: 'Health & Schools', percent: category === 'All' || category === 'Health' || category === 'Education' ? 15 : 0, color: 'bg-purple-500' }
      ];

      // Normalize allocation percentages if single category is selected
      if (category !== 'All') {
        allocation.forEach(a => {
          if (a.name.toLowerCase().includes(category.toLowerCase()) || 
              (category === 'Education' && a.name.includes('Schools'))) {
            a.percent = 100;
          } else {
            a.percent = 0;
          }
        });
      }

      const activeAllocation = allocation.filter(a => a.percent > 0);

      const projects = [
        {
          id: 'sim-p1',
          title: 'Asphalt Paving & Main Drainage Channels',
          category: 'Roads',
          cost: Math.round(budget * 0.45),
          beneficiaries: Math.round(coverageTarget * 0.5),
          duration: Math.round(timeline * 0.7),
          reason: 'Address multiple road safety complaints near the commercial ward.',
          risk: 'Rainy season mud erosion and heavy vehicle routing.',
          mitigation: 'Implement high-grade concrete sub-base layers.'
        },
        {
          id: 'sim-p2',
          title: 'Village Water Pipe Inlets & Filtration Station',
          category: 'Water',
          cost: Math.round(budget * 0.30),
          beneficiaries: Math.round(coverageTarget * 0.3),
          duration: Math.round(timeline * 0.6),
          reason: 'Addresses water shortage reports in rural wards.',
          risk: 'Water pressure drops and pipe blockages.',
          mitigation: 'Deploy automated pressure feedback valve monitors.'
        },
        {
          id: 'sim-p3',
          title: 'Covered Waste Collection Points & Recycling Grids',
          category: 'Waste',
          cost: Math.round(budget * 0.15),
          beneficiaries: Math.round(coverageTarget * 0.2),
          duration: Math.round(timeline * 0.4),
          reason: 'Addresses high garbage accumulation density markers.',
          risk: 'Odor leakage and community protests.',
          mitigation: 'Install carbon-filter air extraction lids.'
        }
      ].filter(p => category === 'All' || p.category === category);

      setResult({
        impactScore,
        allocation: activeAllocation,
        projects,
        totalBeneficiaries: projects.reduce((sum, p) => sum + p.beneficiaries, 0),
        usedBudget: projects.reduce((sum, p) => sum + p.cost, 0),
        risks: [
          'Material supply chain delays in rural sectors due to monsoon paths.',
          'Local contractor capacity limits during peak construction windows.'
        ]
      });

      setGenerating(false);
      setPlanGenerated(true);
    }, 1800);
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 flex flex-col gap-8 bg-dot-pattern">
      
      <div className="flex flex-col">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Strategic Sandbox</span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
          AI Decision Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulate municipal budget allocations and timeline constraints to model the developmental impact on your constituency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SIMULATOR CONTROLS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-6 border-slate-200/50" variant="blue">
            <span className="text-xs font-bold text-slate-900 dark:text-white block mb-5 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-3">
              Simulation Parameters
            </span>

            <div className="space-y-5 text-xs">
              {/* Budget Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Available Budget</span>
                  <span className="text-primary font-bold">{formatCurrency(budget)}</span>
                </div>
                <input
                  type="range"
                  min={1000000} // 10 Lakhs
                  max={100000000} // 10 Crores
                  step={500000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Timeline Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Timeline Target</span>
                  <span className="text-primary font-bold">{timeline} Months</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={24}
                  step={1}
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Priority Focus */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-500 block">Priority Focus</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'balance', label: 'Balanced' },
                    { id: 'safety', label: 'Safety First' },
                    { id: 'cost', label: 'Cost Efficient' },
                    { id: 'beneficiaries', label: 'Max Reach' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFocus(item.id)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${focus === item.id ? 'bg-primary border-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Development Category */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-500 block">Development Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 bg-transparent"
                >
                  <option value="All">All Categories</option>
                  <option value="Roads">Roads & Transport</option>
                  <option value="Water">Water Grid</option>
                  <option value="Waste">Waste Management</option>
                  <option value="Health">Health Centers</option>
                  <option value="Education">Education Facilities</option>
                </select>
              </div>

              {/* Rural / Urban Weighting */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Sector Bias</span>
                  <span className="text-primary font-bold">{ruralWeight}% Rural / {100 - ruralWeight}% Urban</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={ruralWeight}
                  onChange={(e) => setRuralWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Population Target Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Reach Target</span>
                  <span className="text-primary font-bold">{coverageTarget.toLocaleString()} residents</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={coverageTarget}
                  onChange={(e) => setCoverageTarget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Generate Plan
                </>
              )}
            </button>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: SIMULATION RESULTS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {generating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-96 flex flex-col items-center justify-center gap-4 text-center"
              >
                <div className="flex gap-2">
                  <span className="wave-bar h-8 bg-primary"></span>
                  <span className="wave-bar h-8 bg-primary" style={{ animationDelay: '0.1s' }}></span>
                  <span className="wave-bar h-8 bg-primary" style={{ animationDelay: '0.2s' }}></span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Gemini AI modeling optimal budget allocations...</span>
              </motion.div>
            )}

            {!generating && !planGenerated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="p-16 text-center border-slate-200/50 flex flex-col items-center justify-center min-h-[400px]">
                  <Target size={36} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-350">Strategic Engine Ready</span>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    Adjust available budgets, sector weights, and target coverage on the left to simulate municipal development projects.
                  </p>
                </GlassCard>
              </motion.div>
            )}

            {planGenerated && result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Result KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Circular SVG Gauge Card */}
                  <GlassCard className="p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider mb-2">Development Impact</span>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="40" cy="40" r="34" 
                          className="stroke-primary" 
                          strokeWidth="6" fill="transparent" 
                          strokeDasharray={213}
                          strokeDashoffset={213 - (213 * result.impactScore) / 100}
                        />
                      </svg>
                      <span className="absolute text-sm font-extrabold text-slate-900 dark:text-white font-display">{result.impactScore}%</span>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Estimated Reach</span>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-2 font-display">
                        {result.totalBeneficiaries.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-3">
                      <Users size={12} className="text-secondary" /> residents served
                    </span>
                  </GlassCard>

                  <GlassCard className="p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Fund Utilization</span>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white block mt-2 font-display">
                        {formatCurrency(result.usedBudget)}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-3">
                      <DollarSign size={12} className="text-primary" /> out of {formatCurrency(budget)}
                    </span>
                  </GlassCard>
                </div>

                {/* Allocation Chart */}
                <GlassCard className="p-6 border-slate-200/50">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-4">Budget Split Matrix</span>
                  <div className="flex h-4 rounded-full overflow-hidden w-full bg-slate-200 dark:bg-slate-800">
                    {result.allocation.map((item: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`h-full ${item.color}`}
                        style={{ width: `${item.percent}%` }}
                        title={`${item.name}: ${item.percent}%`}
                      ></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-[10px] font-semibold text-slate-500">
                    {result.allocation.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`}></span>
                        <span>{item.name}: <strong className="text-slate-800 dark:text-white">{item.percent}%</strong></span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Recommended Project Details */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Optimal Project Portfolio</span>
                  {result.projects.map((p: any) => (
                    <GlassCard key={p.id} className="p-6 border-slate-200/50 flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</span>
                          <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                            <Layers size={10} className="text-slate-400" /> Category: {p.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GeminiBadge type="ai" value="Active" />
                          <span className="text-sm font-extrabold text-primary font-display">{formatCurrency(p.cost)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">Expected Reach</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Users size={13} className="text-secondary" /> {p.beneficiaries.toLocaleString()} residents
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">Timeline</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Clock size={13} className="text-primary" /> {p.duration} Months
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">Focus Selection Rationale</span>
                          <span className="text-[11px] text-slate-500 leading-relaxed block">{p.reason}</span>
                        </div>
                      </div>

                      {/* Risk and Mitigation Block */}
                      <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        <div>
                          <span><strong className="font-bold uppercase tracking-wider text-[8px] text-amber-500">Risk Analyser:</strong> {p.risk}</span>
                          <span className="block mt-1 font-semibold text-slate-600 dark:text-slate-400"><strong className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">Mitigation Strategy:</strong> {p.mitigation}</span>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Strategy Risk Summary */}
                <GlassCard className="p-6 border-slate-200/50">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-3">Portfolio Risk Index</span>
                  <ul className="space-y-2 text-xs text-slate-550 leading-relaxed list-disc pl-4">
                    {result.risks.map((risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </GlassCard>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
