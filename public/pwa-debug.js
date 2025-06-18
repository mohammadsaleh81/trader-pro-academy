// PWA Debug Script
console.log('🔍 PWA Debug Script Started');

// Check Service Worker
if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker is supported');
  
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📋 Service Worker Registrations:', registrations.length);
    registrations.forEach((registration, index) => {
      console.log(`📝 Registration ${index + 1}:`, {
        scope: registration.scope,
        state: registration.active?.state,
        updatefound: registration.updatefound
      });
    });
  });
} else {
  console.log('❌ Service Worker is NOT supported');
}

// Check Manifest
fetch('/manifest.json')
  .then(response => {
    if (response.ok) {
      console.log('✅ Manifest.json is accessible');
      return response.json();
    } else {
      console.log('❌ Manifest.json is NOT accessible:', response.status);
    }
  })
  .then(manifest => {
    if (manifest) {
      console.log('📄 Manifest content:', manifest);
    }
  })
  .catch(error => {
    console.log('❌ Error fetching manifest:', error);
  });

// Check PWA Install Criteria
const checkPWACriteria = () => {
  const criteria = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: document.querySelector('link[rel="manifest"]') !== null,
    serviceWorker: 'serviceWorker' in navigator,
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    beforeInstallPrompt: false
  };
  
  console.log('📊 PWA Install Criteria:', criteria);
  
  // Check for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎯 beforeinstallprompt event fired!');
    criteria.beforeInstallPrompt = true;
  });
  
  return criteria;
};

checkPWACriteria();

// Device Detection
const deviceInfo = {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  isMobile: /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent),
  isIOS: /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()),
  isAndroid: /android/.test(navigator.userAgent.toLowerCase()),
  isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
};

console.log('📱 Device Info:', deviceInfo);

// Check localStorage
const pwaStorage = {
  promptSeen: localStorage.getItem('pwa-prompt-seen'),
  promptDismissed: localStorage.getItem('pwa-prompt-dismissed')
};

console.log('💾 PWA Storage:', pwaStorage);

// Export for global access
window.PWADebug = {
  checkPWACriteria,
  deviceInfo,
  pwaStorage,
  clearStorage: () => {
    localStorage.removeItem('pwa-prompt-seen');
    localStorage.removeItem('pwa-prompt-dismissed');
    console.log('🗑️ PWA storage cleared');
  }
}; 