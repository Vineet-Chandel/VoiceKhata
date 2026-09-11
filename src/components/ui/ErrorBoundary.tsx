import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center text-rose-300 max-w-lg mx-auto my-8">
          <h3 className="text-lg font-bold mb-2">Something went wrong in this section</h3>
          <p className="text-xs text-rose-200/80 mb-4">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
