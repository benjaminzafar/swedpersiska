import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      localStorage.removeItem('swedpersiska_admin_auth');
      window.location.href = window.location.origin;
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16] text-white font-vazir" dir="rtl">
          <div className="max-w-md w-full bg-[#0f1626] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle size={28} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-white">مشکلی در بارگذاری رخ داد</h2>
              <p className="text-xs text-slate-400">
                سیستم با موفقیت از بروز اختلال جلوگیری کرد. می‌توانید صفحه را مجدداً لود کنید.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <RefreshCw size={15} />
                <span>بارگذاری مجدد صفحه</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Home size={15} />
                <span>صفحه اصلی</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
