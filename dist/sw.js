const CACHE_NAME = 'mr-trader-academy-v5';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
  '/install',
  '/offline.html',
  // Add font URLs to cache
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap'
];

// Install event - با try-catch برای مدیریت خطا
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(error => {
        console.error('Cache failed to open:', error);
      })
  );
  // فورا فعال شدن service worker جدید
  self.skipWaiting();
});

// Fetch event - با error handling بهتر و font caching
self.addEventListener('fetch', event => {
  // فقط GET request ها را handle کن
  if (event.request.method !== 'GET') {
    return;
  }

  // Special handling for font files
  if (event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('fonts.gstatic.com') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          // Cache font files for longer periods
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        }).catch(error => {
          console.error('Font fetch failed:', error);
        });
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.error('Fetch failed:', error);
          // در صورت عدم دسترسی به شبکه، صفحه offline ساده برگردان
          if (event.request.destination === 'document') {
            return new Response(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>آفلاین</title>
  <style>
    body { 
      font-family: Tahoma, Arial, sans-serif; 
      text-align: center; 
      padding: 50px; 
      direction: rtl; 
    }
  </style>
</head>
<body>
  <h1>اتصال شما قطع است</h1>
  <p>لطفا اتصال اینترنت خود را بررسی کنید</p>
</body>
</html>`, {
              headers: { 
                'Content-Type': 'text/html; charset=utf-8' 
              }
            });
          }
        });
      })
  );
});

// Activate event - با error handling
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // همه کلاینت ها را کنترل کن
      return self.clients.claim();
    })
  );
});

// Message event برای handling پیام ها از main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push event - دریافت push notification
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'مسترتریدر آکادمی',
    body: 'پیام جدیدی دریافت کردید',
    icon: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
    badge: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
    tag: 'master-trader-notification',
    requireInteraction: false,
    renotify: true,
    silent: false,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // اگر push event شامل data است، آن را parse کن
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      // استفاده از متن خام اگر JSON parse ناموفق باشد
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // نمایش notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .catch(error => {
        console.error('Error showing notification:', error);
      })
  );
});

// Notification click event - کلیک روی notification
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  // Handle action buttons if clicked
  if (event.action === 'view-course') {
    const courseUrl = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(clientList => {
        // Try to find existing window and navigate to course
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              // Navigate to course page
              return client.navigate(courseUrl);
            });
          }
        }
        
        // If no window found, open new one
        if (clients.openWindow) {
          return clients.openWindow(courseUrl);
        }
      }).catch(error => {
        console.error('Error handling course view action:', error);
      })
    );
    return;
  }

  if (event.action === 'view-certificate') {
    const certificateUrl = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              return client.navigate(certificateUrl);
            });
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(certificateUrl);
        }
      }).catch(error => {
        console.error('Error handling certificate view action:', error);
      })
    );
    return;
  }
  
  // Default notification click behavior
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // اگر پنجره‌ای از سایت باز است، آن را فوکوس کن
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // اگر URL متفاوت است، navigate کن
            if (urlToOpen !== '/' && client.url !== self.location.origin + urlToOpen) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }
      
      // اگر پنجره‌ای باز نیست، پنجره جدید باز کن
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }).catch(error => {
      console.error('Error handling notification click:', error);
    })
  );
});

// Notification close event - بستن notification
self.addEventListener('notificationclose', event => {
  console.log('Notification was closed:', event);
  
  // می‌توانید analytics یا tracking اضافه کنید
  // مثلاً ارسال event به Google Analytics
  
  event.waitUntil(
    // اگر نیاز به انجام کاری هنگام بستن notification دارید
    Promise.resolve()
  );
});

// Background sync event - برای ارسال پیام‌های offline
self.addEventListener('sync', event => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // عملیات sync را انجام دهید
      Promise.resolve()
    );
  }
}); 