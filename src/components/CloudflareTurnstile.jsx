import React, { useEffect, useRef, useState } from 'react';

// Official Cloudflare Turnstile Test Sitekeys:
// 1x00000000000000000000AA -> Always passes (non-interactive)
// 2x00000000000000000000AB -> Always blocks
// 3x00000000000000000000FF -> Interactive challenge (click checkbox to verify)
export const CLOUDFLARE_TEST_SITEKEY = '3x00000000000000000000FF';

/**
 * CloudflareTurnstile Component
 * Provides bot protection using Cloudflare Turnstile API
 * 
 * @param {string} siteKey - Optional explicit site key
 * @param {string} theme - 'auto' | 'light' | 'dark'
 * @param {function} onVerify - Callback receiving verification token
 * @param {function} onExpire - Callback when token expires
 * @param {function} onError - Callback on error
 * @param {string} className - Extra classes for wrapper
 */
export default function CloudflareTurnstile({
  siteKey,
  theme = 'auto',
  onVerify,
  onExpire,
  onError,
  className = ''
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  // Determine effective sitekey
  const effectiveKey = (() => {
    if (siteKey && siteKey.trim()) return siteKey.trim();
    try {
      const saved = localStorage.getItem('swedpersiska_turnstile_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode === 'live' && parsed.siteKey) {
          return parsed.siteKey;
        }
        if (parsed.siteKey && parsed.siteKey.trim()) {
          return parsed.siteKey.trim();
        }
      }
    } catch {}
    return CLOUDFLARE_TEST_SITEKEY;
  })();

  // 1. Ensure Cloudflare Turnstile script is loaded in document
  useEffect(() => {
    if (window.turnstile) {
      setLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          setLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setLoaded(true);
    };
    script.onerror = () => {
      setError('خطا در بارگذاری سامانه امنیتی کلودفلر');
      onError?.('Script load error');
    };
    document.head.appendChild(script);
  }, [onError]);

  // 2. Render Turnstile widget once script and container are ready
  useEffect(() => {
    if (!loaded || !window.turnstile || !containerRef.current) return;

    // Remove existing widget if already mounted
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: effectiveKey,
        theme: theme,
        callback: (token) => {
          setError('');
          onVerify?.(token);
        },
        'expired-callback': () => {
          onExpire?.();
        },
        'error-callback': (err) => {
          console.warn('Cloudflare Turnstile error:', err);
          setError('خطا در احراز هویت امنیتی');
          onError?.(err);
        }
      });

      widgetIdRef.current = widgetId;
    } catch (e) {
      console.error('Failed to render Cloudflare Turnstile widget:', e);
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [loaded, effectiveKey, theme, onVerify, onExpire, onError]);

  return (
    <div className={`cloudflare-turnstile-container flex flex-col items-center justify-center min-h-[68px] ${className}`} dir="ltr">
      <div ref={containerRef} className="inline-block" />
      {error && (
        <span className="text-[11px] text-rose-500 mt-1 font-medium font-vazir" dir="rtl">
          {error}
        </span>
      )}
    </div>
  );
}
