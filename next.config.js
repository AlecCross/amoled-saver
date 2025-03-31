//next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Вимкнути PWA для девелопменту
  register: true, // Реєстрація сервісного працівника автоматично
  scope: '/', // Права доступу до всього сайту
  // sw: 'service-worker.js', // Ім'я файлу сервісного працівника
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/amoled-saver\.vercel\.app\/.*\.(?:png|jpg|jpeg|svg|gif|webp|css|js)$/, // Шаблон для зображень, CSS, JS
      handler: 'CacheFirst', // Спочатку шукаємо в кеші
      options: {
        cacheName: 'assets-cache',
        expiration: {
          maxEntries: 100, // Обмеження кількості елементів у кеші
          maxAgeSeconds: 60 * 60 * 24 * 7 // Термін життя кешу — 1 тиждень
        },
      },
    },
    {
      urlPattern: /^https:\/\/amoled-saver\.vercel\.app\/api\//, // Шаблон для API-запитів
      handler: 'NetworkFirst', // Спочатку намагаємось завантажити з мережі
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 20, // Обмеження кількості елементів у кеші
          maxAgeSeconds: 60 * 60 * 24, // Кешуємо дані на добу
        },
      },
    },
    {
      urlPattern: '/.*/', // Все інше, що не підпадає під попередні правила
      handler: 'StaleWhileRevalidate', // Повертаємо кешовану версію і перевіряємо на нову
      options: {
        cacheName: 'default-cache',
        expiration: {
          maxEntries: 50, // Обмеження кількості елементів у кеші
          maxAgeSeconds: 60 * 60 * 24 * 30, // Термін життя кешу — 30 днів
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Конфігурація Next.js
});
