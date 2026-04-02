import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, Wrench } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HammerIt Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
          <div className="max-w-xl w-full text-center space-y-8 animate-fade-in">
            {/* Visual Header */}
            <div className="relative inline-block">
                <div className="w-24 h-24 bg-coral-50 dark:bg-coral-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-coral-500 animate-pulse">
                    <Wrench className="w-12 h-12" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-red-500 border border-red-50 dark:border-red-900/20">
                    <AlertCircle className="w-6 h-6" />
                </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Ups, niečo <span className="gradient-text">zlyhalo</span></h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                Vyskytla sa nečakaná chyba v systéme. Naši majstri na tom už pracujú, aby sme všetko dali do poriadku.
              </p>
            </div>

            {/* Error Detail (only visible in development mode) */}
            {import.meta.env.DEV && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 text-left overflow-auto max-h-48 shadow-inner">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 font-mono leading-none">Technické detaily chyby:</p>
                    <code className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                        {this.state.error?.toString()}
                    </code>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto bg-gradient-to-tr from-coral-500 to-coral-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-coral-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                <Home className="w-5 h-5" />
                Návrat domov
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-black px-10 py-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCcw className="w-5 h-5" />
                Skúsiť znova
              </button>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest pt-8 opacity-60">
              HammerIT Production Safety System v1.0
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
