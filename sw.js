<<<<<<< HEAD
const CACHE_NAME = 'calcnova-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).catch(
                    () => new Response("You are offline from CalcNova", { status: 503 })
                );
            })
    );
});
=======
const CACHE_NAME = 'calcnova-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).catch(
                    () => new Response("You are offline from CalcNova", { status: 503 })
                );
            })
    );
});
>>>>>>> dfceefb2557c05eb2d9a1b1afb016aa870f7cffb
