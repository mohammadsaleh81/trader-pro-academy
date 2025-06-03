
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you can send error to monitoring service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-lg text-red-600">
                خطایی رخ داده است
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                متأسفانه مشکلی در نمایش این بخش به وجود آمده است.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  تلاش مجدد
                </Button>
                <Button 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  بارگیری مجدد
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer">جزئیات خطا (حالت توسعه)</summary>
                  <pre className="mt-2 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
