import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/use-pwa';
import InstallButton from '@/components/ui/install-button';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PWATestPage: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isStandalone,
    deferredPrompt,
    installApp,
    canShowPrompt 
  } = usePWA();
  
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const testInstallPrompt = async () => {
    try {
      await installApp();
      addTestResult('✅ Install prompt triggered successfully');
      toast({
        title: "تست موفق",
        description: "Install prompt با موفقیت اجرا شد",
        variant: "default",
      });
    } catch (error) {
      addTestResult(`❌ Install prompt failed: ${error}`);
      toast({
        title: "تست ناموفق",
        description: `خطا: ${error}`,
        variant: "destructive",
      });
    }
  };

  const clearPWAData = () => {
    localStorage.removeItem('pwa-prompt-seen');
    localStorage.removeItem('pwa-prompt-dismissed');
    addTestResult('🗑️ PWA localStorage data cleared');
    toast({
      title: "داده‌ها پاک شد",
      description: "اطلاعات PWA از localStorage حذف شد",
    });
  };

  const triggerPWAPrompt = () => {
    // Clear localStorage to allow popup to show again
    localStorage.removeItem('pwa-prompt-seen');
    localStorage.removeItem('pwa-prompt-dismissed');
    
    // Reload page to trigger popup
    window.location.reload();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    
    return {
      userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
      platform,
      language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  const deviceInfo = getDeviceInfo();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تست سیستم PWA
        </h1>
        <p className="text-gray-600">
          این صفحه برای تست و بررسی عملکرد سیستم Progressive Web App طراحی شده است.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PWA Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              وضعیت PWA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>قابل نصب</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isInstallable)}
                <Badge variant={isInstallable ? "default" : "secondary"}>
                  {isInstallable ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>نصب شده</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isInstalled)}
                <Badge variant={isInstalled ? "default" : "secondary"}>
                  {isInstalled ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>حالت Standalone</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isStandalone)}
                <Badge variant={isStandalone ? "default" : "secondary"}>
                  {isStandalone ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>امکان نمایش پاپ‌آپ</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(canShowPrompt)}
                <Badge variant={canShowPrompt ? "default" : "secondary"}>
                  {canShowPrompt ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              تشخیص دستگاه
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>iOS</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isIOS)}
                <Badge variant={isIOS ? "default" : "secondary"}>
                  {isIOS ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Android</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isAndroid)}
                <Badge variant={isAndroid ? "default" : "secondary"}>
                  {isAndroid ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Deferred Prompt</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(!!deferredPrompt)}
                <Badge variant={deferredPrompt ? "default" : "secondary"}>
                  {deferredPrompt ? "موجود" : "ناموجود"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>اقدامات تست</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={testInstallPrompt}
              disabled={!isInstallable}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تست نصب
            </Button>
            
            <Button
              onClick={triggerPWAPrompt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              نمایش پاپ‌آپ
            </Button>
            
            <Button
              onClick={clearPWAData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              پاک کردن داده‌ها
            </Button>
            
            <InstallButton 
              variant="default"
              showText={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>اطلاعات دستگاه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>User Agent:</strong>
            <p className="text-sm text-gray-600 mt-1 break-all">
              {deviceInfo.userAgent}
            </p>
          </div>
          <div>
            <strong>Platform:</strong> {deviceInfo.platform}
          </div>
          <div>
            <strong>Language:</strong> {deviceInfo.language}
          </div>
          <div>
            <strong>Cookies Enabled:</strong> {deviceInfo.cookieEnabled ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Online:</strong> {deviceInfo.onLine ? 'Yes' : 'No'}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>نتایج تست</CardTitle>
          <Button
            onClick={clearTestResults}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            پاک کردن
          </Button>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              هنوز تستی انجام نشده است
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-gray-50 rounded border-r-4 border-trader-500"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWATestPage; 