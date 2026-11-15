import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gocxmdfphwmcvnuqnvca.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY3htZGZwaHdtY3ZudXFudmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjcwODgsImV4cCI6MjEwOTU0MzA4OH0.75Jq9mSGZx4wn-I6j4iIaRd-24-M5q0ZyA3zjiXsluw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SP-${yy}${mm}-${rand}`;
}

/**
 * Generate a 4-digit PIN code for author ad management
 */
export function generatePinCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
