import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://bezbnymjcnmazdonfzky.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJueW1qY25tYXpkb25memt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2OTM1NjksImV4cCI6MjExMDI2OTU2OX0.ylsHBAZ1zo1z_aKpHx7hgl-yZu2yt2puFNhR8jBm6S4';

const supabase = createClient(supabaseUrl, supabaseKey);

const PUBLIC_AD_COLUMNS =
  'id, reference_number, title, title_fa, category, country, city, area, price, price_type, description, contact_name, contact_phone, contact_whatsapp, contact_telegram, contact_email, images, is_featured, status, views_count, created_at, updated_at';

function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function generateReferenceNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `SP-${yy}${mm}-${rand}`;
}

function generatePinCode() {
  return String(crypto.randomInt(1000, 10000));
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { action, id } = req.query || {};

      if (action === 'bootstrap') {
        const { data } = await supabase
          .from('swedpersiska_settings')
          .select('key, value')
          .in('key', ['site_branding', 'seo_settings', 'portal_categories', 'stripe_settings', 'turnstile_settings']);

        const settings = {};
        (data || []).forEach((item) => {
          if (item.key === 'stripe_settings' && item.value) {
            settings.stripe_settings = {
              enabled: item.value.enabled,
              mode: item.value.mode,
              publishableKey: item.value.publishableKey,
              vipPrice: item.value.vipPrice,
              currency: item.value.currency,
              vipDurationDays: item.value.vipDurationDays,
              vipBadgeText: item.value.vipBadgeText
            };
          } else if (item.key === 'turnstile_settings' && item.value) {
            settings.turnstile_settings = {
              enabled: item.value.enabled,
              mode: item.value.mode,
              siteKey: item.value.siteKey,
              protectPostAd: item.value.protectPostAd
            };
          } else {
            settings[item.key] = item.value;
          }
        });

        return res.status(200).json({ ok: true, settings });
      }

      if (action === 'ad' && id) {
        const clean = String(id).trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
        let query = supabase.from('swedpersiska_ads').select(PUBLIC_AD_COLUMNS);
        if (isUuid) {
          query = query.eq('id', clean);
        } else {
          const safeRef = clean.replace(/[^a-zA-Z0-9_-]/g, '');
          if (!safeRef) return res.status(400).json({ ok: false, error: 'Invalid ad reference' });
          query = query.eq('reference_number', safeRef);
        }
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return res.status(200).json({ ok: true, ad: data || null });
      }

      // Default GET: list active public ads (without pin_code)
      const { data, error } = await supabase
        .from('swedpersiska_ads')
        .select(PUBLIC_AD_COLUMNS)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ ok: true, ads: data || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { action } = body;

      if (action === 'create_ad') {
        const {
          title,
          category,
          country,
          city,
          area,
          price,
          price_type,
          description,
          contact_name,
          contact_phone,
          contact_whatsapp,
          contact_telegram,
          contact_email,
          images,
          pin_code
        } = body;

        if (!title || !description || !contact_name) {
          return res.status(400).json({ ok: false, error: 'عنوان، توضیحات و نام تماس‌گیرنده الزامی است.' });
        }

        const safeImages = Array.isArray(images) ? images.filter(isSafeHttpUrl) : [];
        const finalImages = safeImages.length > 0
          ? safeImages
          : ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'];

        const refNum = generateReferenceNumber();
        const finalPin = pin_code && /^\d{4,8}$/.test(String(pin_code).trim())
          ? String(pin_code).trim()
          : generatePinCode();

        const { data, error } = await supabase
          .from('swedpersiska_ads')
          .insert([
            {
              reference_number: refNum,
              pin_code: finalPin,
              title: String(title).trim(),
              title_fa: String(title).trim(),
              category: category || 'bostad',
              country: ['se', 'no', 'dk', 'fi'].includes(country) ? country : 'se',
              city: String(city || 'Stockholm').trim(),
              area: area ? String(area).trim() : null,
              price: price ? parseFloat(price) : null,
              price_type: price_type || 'kr',
              description: String(description).trim(),
              contact_name: String(contact_name).trim(),
              contact_phone: contact_phone ? String(contact_phone).trim() : null,
              contact_whatsapp: contact_whatsapp ? String(contact_whatsapp).trim() : null,
              contact_telegram: contact_telegram ? String(contact_telegram).trim() : null,
              contact_email: contact_email ? String(contact_email).trim() : null,
              images: finalImages,
              is_featured: false,
              status: 'active',
              views_count: 1
            }
          ])
          .select(PUBLIC_AD_COLUMNS)
          .single();

        if (error) throw error;
        return res.status(200).json({ ok: true, ad: data, reference_number: refNum, pin_code: finalPin });
      }

      if (action === 'verify_pin') {
        const cleanRef = String(body.reference_number || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        const cleanPin = String(body.pin_code || '').trim();
        if (!cleanRef || !cleanPin) {
          return res.status(400).json({ ok: false, error: 'لطفا کد مرجع و پین را وارد کنید.' });
        }

        const { data, error } = await supabase
          .from('swedpersiska_ads')
          .select(PUBLIC_AD_COLUMNS)
          .eq('reference_number', cleanRef)
          .eq('pin_code', cleanPin)
          .maybeSingle();

        if (error || !data) {
          return res.status(401).json({ ok: false, error: 'شماره مرجع یا پین کد وارد شده صحیح نیست.' });
        }
        return res.status(200).json({ ok: true, ad: data });
      }

      if (action === 'update_ad') {
        const { id, pin_code, title, price, description, status, contact_phone } = body;
        if (!id || !pin_code) {
          return res.status(400).json({ ok: false, error: 'شناسه آگهی و پین الزامی است.' });
        }

        const { data, error } = await supabase
          .from('swedpersiska_ads')
          .update({
            title: String(title || '').trim(),
            price: price ? parseFloat(price) : null,
            description: String(description || '').trim(),
            status: status === 'hidden' ? 'hidden' : 'active',
            contact_phone: contact_phone ? String(contact_phone).trim() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('pin_code', String(pin_code).trim())
          .select(PUBLIC_AD_COLUMNS)
          .single();

        if (error || !data) {
          return res.status(401).json({ ok: false, error: 'عدم دسترسی یا پین نامعتبر.' });
        }
        return res.status(200).json({ ok: true, ad: data });
      }

      if (action === 'delete_ad') {
        const { id, pin_code } = body;
        if (!id || !pin_code) {
          return res.status(400).json({ ok: false, error: 'شناسه آگهی و پین الزامی است.' });
        }

        const { error } = await supabase
          .from('swedpersiska_ads')
          .delete()
          .eq('id', id)
          .eq('pin_code', String(pin_code).trim());

        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      if (action === 'increment_view') {
        const { id, current_views } = body;
        if (id) {
          await supabase
            .from('swedpersiska_ads')
            .update({ views_count: (Number(current_views) || 0) + 1 })
            .eq('id', id);
        }
        return res.status(200).json({ ok: true });
      }

      if (action === 'promote_ad') {
        const { id } = body;
        if (!id) return res.status(400).json({ ok: false, error: 'Missing ad ID' });

        const { data, error } = await supabase
          .from('swedpersiska_ads')
          .update({ is_featured: true })
          .eq('id', id)
          .select(PUBLIC_AD_COLUMNS)
          .single();

        if (error) throw error;
        return res.status(200).json({ ok: true, ad: data });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
