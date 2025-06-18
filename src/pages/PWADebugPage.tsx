import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface PWAStatus {
  serviceWorker: boolean;
  manifest: boolean;
  https: boolean;
  beforeInstallPrompt: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

const PWADebugPage: React.FC = () => {
  const [status, setStatus] = useState<PWAStatus>({
    serviceWorker: false,
    manifest: false,
    https: false,
    beforeInstallPrompt: false,
    isStandalone: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    checkPWAStatus();
  }, []);

  const checkPWAStatus = async () => {
    addLog('شروع بررسی وضعیت PWA...');

    // Check HTTPS
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    addLog(`HTTPS: ${isHTTPS ? '✅' : '❌'}`);

    // Check Service Worker
    const hasSW = 'serviceWorker' in navigator;
    addLog(`Service Worker Support: ${hasSW ? '✅' : '❌'}`);

    // Check Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const hasManifest = !!manifestLink;
    addLog(`Manifest Link: ${hasManifest ? '✅' : '❌'}`);

    // Test manifest fetch
    try {
      const manifestResponse = await fetch('/manifest.json');
      const manifestAccessible = manifestResponse.ok;
      addLog(`Manifest Accessible: ${manifestAccessible ? '✅' : '❌'}`);
    } catch (error) {
      addLog(`Manifest Fetch Error: ❌ ${error}`);
    }

    // Device detection
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    addLog(`iOS: ${isIOS ? '✅' : '❌'}`);
    addLog(`Android: ${isAndroid ? '✅' : '❌'}`);
    addLog(`Mobile: ${isMobile ? '✅' : '❌'}`);
    addLog(`Standalone: ${isStandalone ? '✅' : '❌'}`);

    // Check localStorage
    const promptSeen = localStorage.getItem('pwa-prompt-seen');
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    addLog(`Prompt Seen: ${promptSeen || 'null'}`);
    addLog(`Prompt Dismissed: ${promptDismissed || 'null'}`);

    setStatus({
      serviceWorker: hasSW,
      manifest: hasManifest,
      https: isHTTPS,
      beforeInstallPrompt: false, // Will be updated by event
      isStandalone,
      isMobile,
      isIOS,
      isAndroid
    });

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      addLog('🎯 beforeinstallprompt event fired!');
      setStatus(prev => ({ ...prev, beforeInstallPrompt: true }));
    });

    addLog('بررسی وضعیت PWA تکمیل شد');
  };

  const clearPWAData = () => {
    localStorage.removeItem('pwa-prompt-seen');
    localStorage.removeItem('pwa-prompt-dismissed');
    addLog('🗑️ PWA localStorage data cleared');
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getOverallStatus = () => {
    const requiredForPWA = status.serviceWorker && status.manifest && status.https;
    const canShowPrompt = status.isMobile && !status.isStandalone;
    
    if (requiredForPWA && canShowPrompt) {
      return { status: 'ready', message: 'PWA آماده نمایش است', color: 'green' };
    } else if (requiredForPWA) {
      return { status: 'partial', message: 'PWA آماده است اما شرایط نمایش فراهم نیست', color: 'yellow' };
    } else {
      return { status: 'not-ready', message: 'PWA آماده نیست', color: 'red' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PWA Debug Panel
        </h1>
        <p className="text-gray-600">
          بررسی وضعیت و تشخیص مشکلات سیستم PWA
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 text-${overallStatus.color}-500`} />
            وضعیت کلی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg bg-${overallStatus.color}-50 border border-${overallStatus.color}-200`}>
            <p className={`text-${overallStatus.color}-800 font-medium`}>
              {overallStatus.message}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PWA Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>الزامات PWA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>HTTPS</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.https)}
                <Badge variant={status.https ? "default" : "destructive"}>
                  {status.https ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Service Worker</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.serviceWorker)}
                <Badge variant={status.serviceWorker ? "default" : "destructive"}>
                  {status.serviceWorker ? "پشتیبانی" : "عدم پشتیبانی"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Manifest</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.manifest)}
                <Badge variant={status.manifest ? "default" : "destructive"}>
                  {status.manifest ? "موجود" : "ناموجود"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Install Prompt</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.beforeInstallPrompt)}
                <Badge variant={status.beforeInstallPrompt ? "default" : "secondary"}>
                  {status.beforeInstallPrompt ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات دستگاه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>موبایل</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.isMobile)}
                <Badge variant={status.isMobile ? "default" : "secondary"}>
                  {status.isMobile ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>iOS</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.isIOS)}
                <Badge variant={status.isIOS ? "default" : "secondary"}>
                  {status.isIOS ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Android</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.isAndroid)}
                <Badge variant={status.isAndroid ? "default" : "secondary"}>
                  {status.isAndroid ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Standalone</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.isStandalone)}
                <Badge variant={status.isStandalone ? "default" : "secondary"}>
                  {status.isStandalone ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>عملیات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={checkPWAStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              بررسی مجدد
            </Button>
            <Button onClick={clearPWAData} variant="outline">
              پاک کردن داده‌ها
            </Button>
            <Button onClick={reloadPage} variant="outline">
              بارگیری مجدد صفحه
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>لاگ‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWADebugPage; 