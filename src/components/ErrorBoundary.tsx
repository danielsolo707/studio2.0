'use client';

import React, { Component, ReactNode, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  webglSupported: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      webglSupported: this.checkWebGLSupport()
    };
  }

  checkWebGLSupport(): boolean {
    // SSR safe check
    if (typeof document === 'undefined') {
      return true; // Assume WebGL is supported on server
    }
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Detect WebGL-related errors
    if (error.message?.includes('WebGL') || error.message?.includes('webgl')) {
      console.warn('WebGL context error detected');
    }
  }

  componentDidMount() {
    // Setup WebGL context loss detection
    if (typeof window !== 'undefined') {
      window.addEventListener('webglcontextlost', this.handleWebGLContextLoss);
      window.addEventListener('webglcontextrestored', this.handleWebGLContextRestored);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('webglcontextlost', this.handleWebGLContextLoss);
      window.removeEventListener('webglcontextrestored', this.handleWebGLContextRestored);
    }
  }

  handleWebGLContextLoss = () => {
    console.warn('WebGL context lost');
  };

  handleWebGLContextRestored = () => {
    console.info('WebGL context restored');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isWebGLError = (this.state.webglSupported === false) || 
        this.state.error?.message?.includes('WebGL');

      return (
        <div className="flex items-center justify-center min-h-screen bg-[#030305] text-white p-8">
          <div className="max-w-md text-center space-y-4">
            <h2 className="font-headline text-2xl text-[#DFFF00]">
              {isWebGLError ? 'GRAPHICS ERROR' : 'SOMETHING WENT WRONG'}
            </h2>
            <p className="font-body text-sm text-white/60">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <p className="font-body text-xs text-white/40">
              {isWebGLError 
                ? 'WebGL/3D graphics are not supported or have encountered an issue. Try a different browser or device with GPU acceleration.'
                : 'An unexpected error occurred. Try refreshing the page or using a different browser.'}
            </p>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-[#DFFF00] text-black font-headline text-xs tracking-wider hover:bg-[#DFFF00]/80 transition-colors"
              >
                RELOAD
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-6 py-3 border border-[#DFFF00]/50 text-[#DFFF00] font-headline text-xs tracking-wider hover:bg-[#DFFF00]/10 transition-colors"
              >
                GO BACK
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
