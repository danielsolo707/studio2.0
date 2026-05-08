"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to an error reporting service
      // like Sentry, Bugsnag, or similar
      this.logErrorToService(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Mock error reporting - replace with actual service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString()
    };
    
    console.log('Reporting error to service:', errorData);
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#030305] flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-4">
              <h2 className="font-headline text-2xl text-[#DFFF00] tracking-wider">
                SOMETHING WENT WRONG
              </h2>
              <p className="font-body text-sm text-white/50">
                {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left bg-black/20 p-4 rounded border border-white/10">
                  <summary className="font-headline text-xs text-[#DFFF00] cursor-pointer">
                    ERROR DETAILS
                  </summary>
                  <pre className="font-mono text-xs text-white/70 mt-2 overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#DFFF00]/80 transition-colors"
              >
                TRY AGAIN
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 border border-white/20 text-white font-headline text-xs tracking-[0.3em] hover:border-white/40 transition-colors"
              >
                RELOAD PAGE
              </button>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="font-body text-xs text-white/30">
                If this persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}