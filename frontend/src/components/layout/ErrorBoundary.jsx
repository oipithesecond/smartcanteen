// frontend/src/components/layout/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fdf8f7] flex items-center justify-center p-6 text-[#1c1b1b]">
          <div className="max-w-md w-full bg-white border border-[#e5e2e1] rounded-3xl p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fff4e5] border border-[#ffdcc3] text-[#c76c00] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h2 className="text-xl font-bold font-space text-[#1c1b1b]">
              Something went wrong
            </h2>
            <p className="text-xs text-[#777771] leading-relaxed">
              An unexpected error occurred while rendering the dashboard. You can reload to restore the interface.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 bg-[#f7f3f2] rounded-xl text-[11px] font-mono text-[#474741] text-left overflow-x-auto border border-[#e5e2e1]">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c1b1b] text-white text-xs font-space font-bold hover:bg-black transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

 return this.props.children;
 }
}

export default ErrorBoundary;
