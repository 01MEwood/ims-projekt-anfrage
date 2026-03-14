import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const timeline = formData.get('timeline') as string;
    const contactName = formData.get('contactName') as string;
    const contactCompany = formData.get('contactCompany') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const callbackRequested = formData.get('callbackRequested') === 'true';

    const fileUrls: string[] = [];
    const files = formData.getAll('files') as File[];

    for (const file of files) {
      if (file.size === 0) continue;
      const ts = Date.now();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `anfragen/${ts}_${safe}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from('projekt-uploads')
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (error) { console.error('Upload error:', error); continue; }

      const { data: urlData } = supabase.storage.from('projekt-uploads').getPublicUrl(path);
      if (urlData?.publicUrl) fileUrls.push(urlData.publicUrl);
    }

    const { data: inquiry, error: dbError } = await supabase
      .from('projekt_anfragen')
      .insert({
        category, description, timeline,
        contact_name: contactName,
        contact_company: contactCompany,
        contact_phone: contactPhone,
        callback_requested: callbackRequested,
        file_urls: fileUrls,
        status: 'neu',
      })
      .select().single();

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Email notification
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resendKey !== 're_placeholder') {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: 'IMS Projektanfrage <anfrage@projekt.ihr-moebel-schreiner.de>',
            to: [process.env.NOTIFY_EMAIL || 'mario@marioesch.de'],
            subject: `Neue Projektanfrage: ${category} – ${contactName}`,
            html: buildEmailHtml({ category, description, timeline, contactName, contactCompany, contactPhone, callbackRequested, fileUrls }),
          }),
        });
      } catch (e) { console.error('Email error:', e); }
    }

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function buildEmailHtml(d: { category: string; description: string; timeline: string; contactName: string; contactCompany: string; contactPhone: string; callbackRequested: boolean; fileUrls: string[] }) {
  const cat: Record<string, string> = { wohnen: 'Wohnen', arbeiten: 'Arbeiten', empfangen: 'Empfangen' };
  const time: Record<string, string> = { sofort: 'Sofort', '1-3m': '1–3 Monate', '3-6m': '3–6 Monate', offen: 'Offen' };
  return `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;color:#1C1C1E">
    <h1 style="font-size:22px;font-weight:600;margin:0 0 4px">Neue Projektanfrage</h1>
    <p style="font-size:14px;color:#6E6E73;margin:0 0 24px">projekt.ihr-moebel-schreiner.de</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#6E6E73;width:120px">Kategorie</td><td style="padding:8px 0;font-weight:500">${cat[d.category]||d.category}</td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73;vertical-align:top">Vorhaben</td><td style="padding:8px 0">${d.description||'–'}</td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73">Zeitrahmen</td><td style="padding:8px 0">${time[d.timeline]||d.timeline||'–'}</td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73">Name</td><td style="padding:8px 0;font-weight:500">${d.contactName}</td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73">Firma</td><td style="padding:8px 0">${d.contactCompany||'–'}</td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73">Telefon</td><td style="padding:8px 0"><a href="tel:${d.contactPhone}" style="color:#A07850;font-weight:500">${d.contactPhone}</a></td></tr>
      <tr><td style="padding:8px 0;color:#6E6E73">Rückruf</td><td style="padding:8px 0">${d.callbackRequested?'✓ Ja':'Nein'}</td></tr>
    </table>
    ${d.fileUrls.length>0?`<div style="padding:16px 0;border-top:1px solid #E5E5EA"><p style="font-size:13px;color:#6E6E73;margin:0 0 8px">Anhänge:</p>${d.fileUrls.map((u,i)=>`<a href="${u}" style="display:inline-block;margin:4px;padding:6px 12px;background:#F0EAE0;border-radius:8px;font-size:13px;color:#1C1C1E;text-decoration:none">Datei ${i+1} ↗</a>`).join('')}</div>`:''}
  </div>`;
}
