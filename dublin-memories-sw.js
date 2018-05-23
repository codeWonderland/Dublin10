const DUBLIN_CACHE = 'champ-cache-v1';

const dublinUrls = [
  '/dublin-10th-anniversary.html'
];

const cacheOptions = {
    ignoreMethod: true,
    ignoreVary: true,
    ignoreSearch: true
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(DUBLIN_CACHE)
            .then(cache => cache.addAll(dublinUrls))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', () => {
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, cacheOptions).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }


            return caches.open(DUBLIN_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                //    put a copy of the response in the runtime cache
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    })
                })
            })
        })
    )
});