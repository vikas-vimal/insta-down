const cacheName = 'insta-down-app-cache-v1';
const filesToCache = [
	'/',
	'materialize.min.css',
	'materialize.min.js',
	'icon.png',
	'icon-192.png',
	'index.html',
	'main.js'
 ];
 
 
 self.addEventListener('install', event => {
	console.log('Attempting to install service worker and cache static assets');
	event.waitUntil(
	  caches.open(cacheName).then(cache => {
		 return cache.addAll(filesToCache);
	  })
	);
 });
 
 self.addEventListener('activate', event => {
	console.log('Service worker activate event!');
 });

 self.addEventListener('fetch', event => {
	console.log('Fetching:', event.request.url);
	event.respondWith(caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
 });