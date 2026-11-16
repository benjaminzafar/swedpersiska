import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bezbnymjcnmazdonfzky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemJueW1qY25tYXpkb25memt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2OTM1NjksImV4cCI6MjExMDI2OTU2OX0.ylsHBAZ1zo1z_aKpHx7hgl-yZu2yt2puFNhR8jBm6S4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Safe public columns for swedpersiska_ads (excludes secret pin_code from public queries)
 */
export const PUBLIC_AD_COLUMNS =
  'id, reference_number, title, title_fa, category, country, city, area, price, price_type, description, contact_name, contact_phone, contact_whatsapp, contact_telegram, contact_email, images, is_featured, status, views_count, created_at, updated_at';

/**
 * Validate that a URL uses a safe http/https scheme (or relative path)
 */
export function isSafeHttpUrl(url) {
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

/**
 * Cryptographically strong random integer in [0, max)
 */
function secureRandomInt(max) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Generate a unique reference number for Swedish-Persian ads
 * Format: SP-YYMM-XXXX (e.g. SP-2611-F82A)
 */
export function generateReferenceNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(secureRandomInt(chars.length));
  }
  return `SP-${yy}${mm}-${rand}`;
}

/**
 * Generate a cryptographically strong 4-digit PIN code for author ad management
 */
export function generatePinCode() {
  return String(1000 + secureRandomInt(9000));
}
