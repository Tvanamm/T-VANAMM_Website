
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { FranchiseCartProvider } from './contexts/FranchiseCartContext'

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Enhanced error boundary component with better debugging
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h1>
                <p className="text-gray-600 mb-4">Something went wrong. Please try refreshing the page.</p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                
                <button 
                  onClick={() => window.location.href = '/login'} 
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Login
                </button>
                
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Error Details (for debugging)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-64">
                    {this.state.error && (
                      <div className="mb-4">
                        <strong>Error:</strong> {this.state.error.message}
                        <br />
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add global error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Add global error handling for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <FranchiseCartProvider>
        <App />
      </FranchiseCartProvider>
    </AuthProvider>
  </ErrorBoundary>
);
