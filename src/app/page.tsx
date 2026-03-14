'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowRight, Phone, Check, Camera, Paperclip, X, FileText, Send, Loader2 } from 'lucide-react';
import { CATEGORIES, TIMELINES } from '@/lib/constants';

type FormState = {
  category: string;
  description: string;
  timeline: string;
  files: File[];
  name: string;
  company: string;
  phone: string;
  callback: boolean;
};

type Phase = 'hero' | 'briefing' | 'contact' | 'success';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('hero');
  const [form, setForm] = useState<FormState>({
    category: '',
    description: '',
    timeline: '',
    files: [],
    name: '',
    company: '',
    phone: '',
    callback: false,
  });
  const [sending, setSending] = useState(false);
  const [briefingVisible, setBriefingVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  const briefingRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  // Smooth scroll helper
  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // Phase transitions
  const selectCategory = (id: string) => {
    setForm(f => ({ ...f, category: id }));
    setPhase('briefing');
    setBriefingVisible(true);
    scrollTo(briefingRef);
  };

  const advanceToContact = () => {
    setPhase('contact');
    setContactVisible(true);
    scrollTo(contactRef);
  };

  const canSubmit = form.name.trim() !== '' && form.phone.trim() !== '';

  const submit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);

    try {
      const payload = new FormData();
      payload.append('category', form.category);
      payload.append('description', form.description);
      payload.append('timeline', form.timeline);
      payload.append('contactName', form.name);
      payload.append('contactCompany', form.company);
      payload.append('contactPhone', form.phone);
      payload.append('callbackRequested', String(form.callback));
      form.files.forEach(f => payload.append('files', f));

      const res = await fetch('/api/submit', { method: 'POST', body: payload });
      if (!res.ok) throw new Error('Submit failed');
      setPhase('success');
    } catch {
      alert('Fehler beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setSending(false);
    }
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).filter(f => f.size < 20 * 1024 * 1024);
    setForm(f => ({ ...f, files: [...f.files, ...arr] }));
  };

  const removeFile = (i: number) => {
    setForm(f => ({ ...f, files: f.files.filter((_, idx) => idx !== i) }));
  };

  // ─── SUCCESS STATE ────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="min-h-dvh flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm animate-[fadeIn_0.5s_ease]">
            <div className="w-16 h-16 rounded-full bg-[#A07850]/10 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#A07850]">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="animate-[draw_0.4s_ease_0.3s_forwards]"
                  style={{ strokeDasharray: 24, strokeDashoffset: 24 }} />
              </svg>
            </div>
            <h1 className="font-serif text-[28px] text-[#1C1C1E] mb-3">Projekt erhalten.</h1>
            <p className="text-[#6E6E73] font-light text-[15px] leading-relaxed">
              Mario Esch prüft Ihr Vorhaben persönlich.<br />
              Ersteinschätzung innerhalb von 24 Stunden.*
              {form.callback && <><br />Rückruf ist notiert.</>}
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-[#6E6E73]">
              <Phone size={14} />
              <a href="tel:+4971929357200" className="text-sm font-light hover:text-[#A07850] transition-colors">
                07192 – 935 72 00
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── MAIN FLOW ────────────────────────────────────────────────
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1">

        {/* ── HERO + FIRST TAP ─────────────────────────────── */}
        <section className="min-h-dvh flex flex-col justify-center px-5 max-w-lg mx-auto w-full">
          <div className="animate-[fadeIn_0.6s_ease]">
            <span className="text-xs font-medium tracking-[0.15em] text-[#A07850] uppercase block mb-3">
              Für Architekten & Planer
            </span>

            <h1 className="font-serif text-[32px] sm:text-[38px] leading-[1.12] text-[#1C1C1E] mb-4">
              Damit gebaut wird,<br />was Sie gezeichnet haben.
            </h1>

            <p className="text-[#6E6E73] font-light text-[15px] leading-relaxed max-w-[340px] mb-10">
              Ihr Entwurf. Unsere Einschätzung. 24&nbsp;Stunden.*<br />
              Machbarkeit, Zeitrahmen, Kostenrahmen&nbsp;— unverbindlich.
            </p>

            {/* Category cards */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                  className={`
                    opacity-0 animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]
                    relative px-4 py-5 rounded-2xl text-center transition-all duration-200
                    active:scale-[0.96]
                    ${form.category === cat.id
                      ? 'bg-[#1C1C1E] text-white shadow-lg shadow-[#1C1C1E]/10'
                      : 'bg-white border-2 border-[#E5E5EA] text-[#1C1C1E] hover:border-[#C49A6C] hover:bg-[#F0EAE0]/30'
                    }
                  `}
                >
                  <span className="text-[15px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Trust banner */}
            <div className="space-y-2">
              <p className="text-[13px] text-[#6E6E73] font-light">
                Gebaut wie gezeichnet&ensp;·&ensp;Zugesagt ist zugesagt&ensp;·&ensp;Einzelstück bis Gesamtprojekt
              </p>
              <p className="text-[13px] text-[#6E6E73]/60 font-light">
                Werkstatt für Innenausbau. Murrhardt bei Stuttgart.
              </p>
            </div>
          </div>
        </section>

        {/* ── BRIEFING (Progressive Disclosure) ─────────────── */}
        {briefingVisible && (
          <section
            ref={briefingRef}
            className="px-5 max-w-lg mx-auto w-full pb-8 animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* Selected pill */}
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1E] text-white text-[13px] font-medium rounded-full">
                {selectedCat?.label}
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            <h2 className="font-serif text-[24px] text-[#1C1C1E] mb-1">Beschreiben Sie Ihr Vorhaben.</h2>
            <p className="text-[#6E6E73] font-light text-sm mb-6">Wir melden uns mit einer Einschätzung.</p>

            {/* Free text */}
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={selectedCat?.placeholder}
              rows={4}
              className="w-full px-4 py-3.5 bg-white border-2 border-[#E5E5EA] rounded-2xl text-[15px] font-light
                         placeholder:text-[#6E6E73]/40 focus:outline-none focus:border-[#A07850] transition-colors
                         resize-none leading-relaxed"
            />

            {/* Upload */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#E5E5EA] rounded-xl text-sm
                           text-[#1C1C1E] hover:border-[#C49A6C] hover:bg-[#F0EAE0]/30 active:scale-[0.97] transition-all"
              >
                <Camera size={16} className="text-[#6E6E73]" />
                Kamera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#E5E5EA] rounded-xl text-sm
                           text-[#1C1C1E] hover:border-[#C49A6C] hover:bg-[#F0EAE0]/30 active:scale-[0.97] transition-all"
              >
                <Paperclip size={16} className="text-[#6E6E73]" />
                Datei wählen
              </button>
            </div>
            <p className="text-[12px] text-[#6E6E73]/50 font-light mt-2">Grundriss, Foto oder Skizze</p>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => addFiles(e.target.files)} />
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.dwg,.dxf" multiple className="hidden"
              onChange={e => addFiles(e.target.files)} />

            {/* File list */}
            {form.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[#E5E5EA] rounded-xl
                              animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                    {file.type.startsWith('image/') ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#F0EAE0] flex-shrink-0">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#F0EAE0] flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[#A07850]" />
                      </div>
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="p-1 hover:bg-[#F0EAE0] rounded-lg transition-colors">
                      <X size={14} className="text-[#6E6E73]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline pills */}
            <div className="mt-6">
              <p className="text-sm text-[#6E6E73] font-light mb-3">Zeitrahmen</p>
              <div className="flex gap-2 flex-wrap">
                {TIMELINES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setForm(f => ({ ...f, timeline: t.id }))}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 active:scale-[0.96]
                      ${form.timeline === t.id
                        ? 'bg-[#1C1C1E] text-white'
                        : 'bg-white border border-[#E5E5EA] text-[#1C1C1E] hover:border-[#C49A6C]'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advance button */}
            <button
              onClick={advanceToContact}
              className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1C1C1E] text-white
                         rounded-2xl text-[15px] font-medium hover:bg-[#1C1C1E]/90 active:scale-[0.98] transition-all"
            >
              Weiter
              <ArrowRight size={16} />
            </button>
          </section>
        )}

        {/* ── CONTACT (Progressive Disclosure) ──────────────── */}
        {contactVisible && (
          <section
            ref={contactRef}
            className="px-5 max-w-lg mx-auto w-full pb-12 animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* Summary pills */}
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1E] text-white text-[13px] font-medium rounded-full">
                {selectedCat?.label} <Check size={12} strokeWidth={3} />
              </span>
              {form.description && (
                <span className="inline-flex items-center px-3 py-1.5 bg-[#F0EAE0] text-[#1C1C1E] text-[13px] rounded-full max-w-[200px] truncate">
                  {form.description.slice(0, 40)}{form.description.length > 40 ? '…' : ''}
                </span>
              )}
              {form.timeline && (
                <span className="inline-flex items-center px-3 py-1.5 bg-[#F0EAE0] text-[#1C1C1E] text-[13px] rounded-full">
                  {TIMELINES.find(t => t.id === form.timeline)?.label}
                </span>
              )}
              {form.files.length > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-[#F0EAE0] text-[#1C1C1E] text-[13px] rounded-full">
                  {form.files.length} {form.files.length === 1 ? 'Datei' : 'Dateien'}
                </span>
              )}
            </div>

            <h2 className="font-serif text-[24px] text-[#1C1C1E] mb-6">Wie erreichen wir Sie?</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3.5 bg-white border-2 border-[#E5E5EA] rounded-2xl text-[15px]
                           placeholder:text-[#6E6E73]/40 focus:outline-none focus:border-[#A07850] transition-colors"
              />
              <input
                type="text"
                placeholder="Büro / Firma"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full px-4 py-3.5 bg-white border-2 border-[#E5E5EA] rounded-2xl text-[15px]
                           placeholder:text-[#6E6E73]/40 focus:outline-none focus:border-[#A07850] transition-colors"
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3.5 bg-white border-2 border-[#E5E5EA] rounded-2xl text-[15px]
                           placeholder:text-[#6E6E73]/40 focus:outline-none focus:border-[#A07850] transition-colors"
              />
            </div>

            {/* Callback toggle */}
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, callback: !f.callback }))}
              className={`mt-4 w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                ${form.callback
                  ? 'border-[#A07850] bg-[#F0EAE0]'
                  : 'border-[#E5E5EA] bg-white hover:border-[#C49A6C]'
                }`}
            >
              <Phone size={16} className={form.callback ? 'text-[#A07850]' : 'text-[#6E6E73]'} />
              <span className="text-[15px]">Rückruf gewünscht</span>
              {form.callback && <Check size={16} className="text-[#A07850] ml-auto" />}
            </button>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!canSubmit || sending}
              className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.97]
                ${!canSubmit
                  ? 'bg-[#E5E5EA] text-[#6E6E73] cursor-not-allowed'
                  : sending
                    ? 'bg-[#6E6E73] text-white cursor-wait'
                    : 'bg-[#1C1C1E] text-white hover:bg-[#1C1C1E]/90'
                }`}
            >
              {sending ? (
                <><Loader2 size={16} className="animate-spin" /> Wird gesendet…</>
              ) : (
                <><Send size={16} /> Projekt einreichen</>
              )}
            </button>

            <p className="text-[12px] text-[#6E6E73]/50 font-light mt-3 text-center">
              * Ersteinschätzung innerhalb 24h an Werktagen.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-5 py-8 max-w-lg mx-auto w-full border-t border-[#E5E5EA]/60">
      <div className="text-[12px] text-[#6E6E73]/60 font-light space-y-1">
        <p>IMS — Ihr Möbel Schreiner</p>
        <p>Lindenstraße 9–15 · 71540 Murrhardt</p>
        <p>* Werktags. Anfragen am Wochenende werden am nächsten Werktag bearbeitet.</p>
        <div className="flex gap-4 mt-3">
          <a href="/impressum" className="hover:text-[#A07850] transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-[#A07850] transition-colors">Datenschutz</a>
        </div>
      </div>
    </footer>
  );
}
