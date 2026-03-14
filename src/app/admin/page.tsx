'use client';
import { useState } from 'react';
import { Phone, PhoneCall, ExternalLink, LogIn, RefreshCw } from 'lucide-react';

type Inquiry = { id: string; category: string; description: string; timeline: string; contact_name: string; contact_company: string; contact_phone: string; callback_requested: boolean; file_urls: string[]; status: string; created_at: string };

const SL: Record<string, { l: string; c: string }> = { neu: { l: 'Neu', c: 'bg-amber-100 text-amber-800' }, kontaktiert: { l: 'Kontaktiert', c: 'bg-blue-100 text-blue-800' }, angebot: { l: 'Angebot', c: 'bg-purple-100 text-purple-800' }, gewonnen: { l: 'Gewonnen', c: 'bg-green-100 text-green-800' }, verloren: { l: 'Verloren', c: 'bg-gray-100 text-gray-500' } };
const CL: Record<string, string> = { wohnen: 'Wohnen', arbeiten: 'Arbeiten', empfangen: 'Empfangen' };
const TL: Record<string, string> = { sofort: 'Sofort', '1-3m': '1–3 Mon.', '3-6m': '3–6 Mon.', offen: 'Offen' };

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin', { headers: { 'x-admin-pw': pw } });
      if (r.status === 401) { setAuthed(false); alert('Falsches Passwort'); return; }
      setItems(await r.json()); setAuthed(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-pw': pw }, body: JSON.stringify({ id, status }) });
    setItems(p => p.map(i => i.id === id ? { ...i, status } : i));
  };

  if (!authed) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F9F8F6] px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl text-[#1C1C1E] mb-6 text-center">IMS Admin</h1>
        <input type="password" placeholder="Passwort" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
          className="w-full px-4 py-3.5 bg-white border-2 border-[#E5E5EA] rounded-2xl text-[15px] placeholder:text-[#6E6E73]/40 focus:outline-none focus:border-[#A07850] transition-colors mb-3" />
        <button onClick={load} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C1C1E] text-white rounded-2xl text-[15px] font-medium hover:bg-[#1C1C1E]/90 active:scale-[0.98] transition-all">
          <LogIn size={16} /> Anmelden
        </button>
      </div>
    </div>
  );

  const si = items.find(i => i.id === sel);

  return (
    <div className="min-h-dvh bg-[#F9F8F6]">
      <header className="sticky top-0 z-50 bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E5E5EA]/60">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div><h1 className="font-serif text-lg text-[#1C1C1E]">Projektanfragen</h1><p className="text-xs text-[#6E6E73]">{items.length} Anfragen</p></div>
          <button onClick={load} disabled={loading} className="p-2 hover:bg-[#F0EAE0] rounded-xl transition-colors">
            <RefreshCw size={18} className={`text-[#6E6E73] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-5 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {Object.entries(SL).map(([k, { l }]) => {
            const n = items.filter(i => i.status === k).length;
            return <div key={k} className="bg-white border border-[#E5E5EA] rounded-2xl p-4"><p className="text-[24px] font-serif text-[#1C1C1E]">{n}</p><p className="text-xs text-[#6E6E73] font-light">{l}</p></div>;
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-2">
            {items.map(inq => {
              const st = SL[inq.status] || SL.neu;
              return (
                <button key={inq.id} onClick={() => setSel(inq.id)}
                  className={`w-full text-left px-4 py-4 bg-white border-2 rounded-2xl transition-all ${sel === inq.id ? 'border-[#A07850] bg-[#F0EAE0]/20' : 'border-[#E5E5EA] hover:border-[#C49A6C]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[15px]">{inq.contact_name}</span>
                        {inq.callback_requested && <PhoneCall size={14} className="text-[#A07850]" />}
                      </div>
                      <p className="text-sm text-[#6E6E73] font-light truncate">{CL[inq.category]} · {inq.contact_company || '–'} · {TL[inq.timeline] || '–'}</p>
                      {inq.description && <p className="text-sm text-[#6E6E73]/70 font-light mt-1 truncate">{inq.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.c}`}>{st.l}</span>
                      <span className="text-[11px] text-[#6E6E73]/50">{new Date(inq.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {items.length === 0 && <p className="text-center text-[#6E6E73] font-light py-12">Noch keine Anfragen.</p>}
          </div>
          {si && (
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 h-fit sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl">{si.contact_name}</h2>
                <a href={`tel:${si.contact_phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1E] text-white text-sm rounded-xl hover:bg-[#1C1C1E]/90 transition-colors"><Phone size={14} /> Anrufen</a>
              </div>
              <div className="space-y-3 text-sm">
                <R l="Kategorie" v={CL[si.category]} /><R l="Firma" v={si.contact_company || '–'} /><R l="Telefon" v={si.contact_phone} /><R l="Zeitrahmen" v={TL[si.timeline] || '–'} /><R l="Rückruf" v={si.callback_requested ? '✓ Ja' : 'Nein'} />
                {si.description && <div className="pt-3 border-t border-[#E5E5EA]"><p className="text-[#6E6E73] text-xs mb-1">Projektbeschreibung</p><p className="text-[#1C1C1E] whitespace-pre-wrap">{si.description}</p></div>}
                {si.file_urls.length > 0 && <div className="pt-3 border-t border-[#E5E5EA]"><p className="text-[#6E6E73] text-xs mb-2">Anhänge</p><div className="flex flex-wrap gap-2">{si.file_urls.map((u, i) => <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-[#F0EAE0] rounded-lg text-xs hover:bg-[#C49A6C]/20 transition-colors">Datei {i + 1} <ExternalLink size={10} /></a>)}</div></div>}
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5EA]">
                <p className="text-xs text-[#6E6E73] mb-2">Status ändern</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SL).map(([k, { l, c }]) => (
                    <button key={k} onClick={() => updateStatus(si.id, k)} className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-all ${si.status === k ? `${c} ring-2 ring-offset-1 ring-[#A07850]` : `${c} opacity-50 hover:opacity-100`}`}>{l}</button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#6E6E73]/40 mt-4">Eingegangen: {new Date(si.created_at).toLocaleString('de-DE')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function R({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-[#6E6E73] font-light">{l}</span><span className="text-[#1C1C1E] font-medium text-right">{v}</span></div>;
}
