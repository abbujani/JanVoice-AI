export const LEGAL_CATEGORIES = ['Employment', 'Rental/Housing', 'Consumer', 'Family', 'Contract', 'Cybercrime', 'Property', 'Government services', 'Criminal complaint information', 'Civil dispute', 'Other'] as const;
export type VerifiedSource = { title: string; url: string; publisher: string; verified_at: string };
export type LegalPlan = { issue: string; what_i_understood: string; key_facts: string[]; possible_legal_considerations: string[]; documents_to_collect: string[]; suggested_next_steps: string[]; professional_help_advisable: string; verified_sources: VerifiedSource[]; source_status: 'Unverified AI Guidance' | 'Verified Official Sources'; disclaimer: string; language: string };
const api = import.meta.env.VITE_API_URL || '';
async function request(path: string, init: RequestInit): Promise<LegalPlan> {
  const response = await fetch(`${api}${path}`, init);
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || 'The legal assistance service is unavailable. Please try again.'); }
  return response.json();
}
export function analyzeQuestion(message: string, language: 'English' | 'Hindi') { return request('/api/legal/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, language }) }); }
export function analyzeDocument(file: File, language: 'English' | 'Hindi') { const form = new FormData(); form.append('file', file); return request(`/api/legal/document?language=${language}`, { method: 'POST', body: form }); }
export function validateDocument(file: File): string | undefined { const types = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain']; if (!types.includes(file.type)) return 'Choose a PDF, PNG, JPEG, WebP, or text file.'; if (file.size > 8 * 1024 * 1024) return 'Document must be 8 MB or smaller.'; }
