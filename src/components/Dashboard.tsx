import { ChevronRight, ShieldCheck, Trash2 } from 'lucide-react';
import type { LegalPlan } from '../services/legal';

export type StoredAssistance = LegalPlan & { id: string; createdAt: string; input: string };

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface DashboardProps {
  items: StoredAssistance[];
  onOpen: (item: StoredAssistance) => void;
  onClear: () => void;
}

export function Dashboard({ items, onOpen, onClear }: DashboardProps) {
  return (
    <aside aria-label="My previous assistance" className="mx-auto w-full min-w-0 max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-950">My previous assistance</h2>
          <button
            type="button"
            onClick={onClear}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Delete all legal assistance history"
          >
            <Trash2 aria-hidden="true" size={15} />
            Clear
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Stored in this browser for this account. Delete it anytime.</p>

        {items.length ? (
          <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onOpen(item)}
                className="group flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-slate-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="inline-flex max-w-full break-words rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {item.issue}
                  </span>
                  <span className="mt-1.5 block break-words text-sm text-slate-700 line-clamp-2">{item.input}</span>
                  <span className="mt-1 block text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                </span>
                <ChevronRight aria-hidden="true" size={16} className="mt-1 shrink-0 text-slate-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Your saved action plans will appear here.</p>
        )}

        <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <ShieldCheck aria-hidden="true" className="shrink-0" size={18} />
          <span>No legal conclusion or citation is generated unless a source is verified.</span>
        </div>
      </div>
    </aside>
  );
}