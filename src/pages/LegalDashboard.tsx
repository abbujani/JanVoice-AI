import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Landmark,
  LoaderCircle,
  Mic,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { analyzeDocument, analyzeQuestion, LEGAL_CATEGORIES, type LegalPlan, validateDocument } from '../services/legal';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition {
  lang: string;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
}

type Stored = LegalPlan & { id: string; createdAt: string; input: string };

const speech = window.SpeechRecognition || window.webkitSpeechRecognition;
const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function loadHistory(key: string): Stored[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Stored[]) : [];
  } catch {
    return [];
  }
}

function List({ title, values }: { title: string; values: string[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
        {values.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PlanView({ plan }: { plan: LegalPlan }) {
  return (
    <div className="mt-6 space-y-4" aria-live="polite" aria-atomic="true" lang={plan.language === 'Hindi' ? 'hi' : 'en'}>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Issue identified</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">{plan.issue}</h2>
        <p className="mt-2 text-sm text-slate-700">{plan.what_i_understood}</p>
      </div>
      <List title="Facts you supplied" values={plan.key_facts} />
      <List title="Possible considerations" values={plan.possible_legal_considerations} />
      <List title="Documents or evidence to collect" values={plan.documents_to_collect} />
      <List title="Suggested next steps" values={plan.suggested_next_steps} />
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <b>When to seek a lawyer:</b> {plan.professional_help_advisable}
      </section>
      <section className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800">
        <h3 className="font-semibold">Source transparency</h3>
        <p className="mt-1 font-medium">{plan.source_status}</p>
        {plan.verified_sources.length ? (
          <ul className="mt-2 list-disc pl-5">
            {plan.verified_sources.map((source) => (
              <li key={source.url}>
                <a className="text-blue-700 underline" href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
                {' — '}
                {source.publisher}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs">No authoritative source was retrieved or verified for this response.</p>
        )}
      </section>
      <p className="text-xs text-slate-500">{plan.disclaimer}</p>
    </div>
  );
}

export function LegalDashboard() {
  const { user } = useAuth();
  const storageKey = `janvoice_legal_history_${user?.uid || 'guest'}`;
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [question, setQuestion] = useState('');
  const [plan, setPlan] = useState<LegalPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Stored[]>(() => loadHistory(storageKey));
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (answer: LegalPlan, input: string) => {
    const next = [{ ...answer, id: newId(), createdAt: new Date().toISOString(), input }, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setPlan(answer);
  };

  const run = async () => {
    if (busy) return;
    setError('');
    if (question.trim().length < 8) {
      setError('Please describe your situation in at least a sentence.');
      return;
    }
    setBusy(true);
    try {
      save(await analyzeQuestion(question, language), question);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const record = () => {
    if (busy || recording) return;
    if (!speech) {
      setError('Voice input is not supported by this browser.');
      return;
    }
    const recognition = new speech();
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    setRecording(true);
    recognition.onresult = (e) => {
      setQuestion(e.results[0][0].transcript);
      setRecording(false);
    };
    recognition.onerror = () => {
      setRecording(false);
      setError('We could not capture your voice. Please type your question.');
    };
    recognition.onend = () => setRecording(false);
    recognition.start();
  };

  const upload = async (file: File) => {
    if (busy) return;
    const invalid = validateDocument(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    setBusy(true);
    try {
      save(await analyzeDocument(file, language), `Document: ${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Document analysis failed.');
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-10">
        <div className="flex items-center gap-3 text-blue-300">
          <Landmark aria-hidden="true" />
          <span className="font-semibold">JanVoice Legal Access</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Understand your legal situation, in plain language.</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Ask by text, voice, or document. We separate the facts you provide from general AI guidance.
        </p>
        <p className="mt-5 flex gap-2 rounded-lg bg-amber-400/15 p-3 text-sm text-amber-100">
          <AlertTriangle aria-hidden="true" className="shrink-0" size={20} />
          This tool provides general information only. It is not a lawyer and cannot replace qualified legal advice.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Ask a legal question</h2>
              <label className="text-sm font-medium">
                Language
                <select
                  className="ml-2 rounded border p-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi')}
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="question">
              What happened?
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-2 min-h-36 w-full rounded-xl border border-slate-300 p-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Describe what happened, who was involved, and any dates or documents you have."
            />

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              {LEGAL_CATEGORIES.map((c) => (
                <span className="rounded-full bg-slate-100 px-2 py-1" key={c}>
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={run}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                <Send aria-hidden="true" size={17} /> {busy ? 'Analyzing…' : 'Get action plan'}
              </button>
              <button
                type="button"
                onClick={record}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-800 disabled:opacity-60"
              >
                <Mic aria-hidden="true" size={17} /> Speak question
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-800 disabled:opacity-60"
              >
                <Upload aria-hidden="true" size={17} /> Analyze document
              </button>
              <input
                ref={fileRef}
                className="sr-only"
                type="file"
                aria-label="Upload a legal document in PDF, image, or text format"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) upload(file);
                }}
              />
            </div>

            {busy && (
              <p role="status" className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> Creating a structured action plan…
              </p>
            )}
            {recording && (
              <p role="status" className="mt-3 text-sm text-slate-600">
                Listening… speak clearly and wait for the transcript to appear.
              </p>
            )}
            {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          </div>

          {plan && <PlanView plan={plan} />}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">My previous assistance</h2>
            <button
              type="button"
              onClick={clear}
              className="rounded p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Delete all legal assistance history"
            >
              <Trash2 aria-hidden="true" size={17} />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Stored in this browser for this account. Delete it anytime.</p>
          <div className="mt-4 space-y-3">
            {history.length ? (
              history.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setPlan(item)}
                  className="w-full rounded-lg border p-3 text-left hover:border-blue-400"
                >
                  <b className="block text-sm text-slate-900">{item.issue}</b>
                  <span className="block truncate text-xs text-slate-500">{item.input}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">Your saved action plans will appear here.</p>
            )}
          </div>
          <div className="mt-6 flex gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
            <ShieldCheck aria-hidden="true" className="shrink-0" size={18} />
            No legal conclusion or citation is generated unless a source is verified.
          </div>
        </aside>
      </div>
    </main>
  );
}