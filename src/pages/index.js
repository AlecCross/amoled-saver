// src/pages/index.js

import { useEffect, useState } from 'react';

export default function Home() {
  const [wakeLock, setWakeLock] = useState(null);

  // Функція для запиту на повний екран
  const requestFullScreen = () => {
    const element = document.documentElement;
    
    // Перевіряємо, чи підтримує браузер full-screen API
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // Internet Explorer
      element.msRequestFullscreen();
    }
  };

  // Функція для звільнення екрану
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // Internet Explorer
      document.msExitFullscreen();
    }
  };

  // Функція для запиту WakeLock
  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLock !== null) {
          console.log('Wake Lock is already active');
          return;
        }
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        lock.addEventListener('release', () => setWakeLock(null));
        console.log('Wake Lock requested');
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    } else {
      console.log('Wake Lock API is not supported');
    }
  }

  useEffect(() => {
    requestWakeLock(); // Запит wake lock при монтуванні компонента
    
    // Очищення при демонтовані компонента
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: 'black' }}
      onClick={() => {
        // Перевірка, чи застосунок у повному екрані і необхідність повторного запуску
        if (!document.fullscreenElement) {
          requestFullScreen();
        }
        requestWakeLock(); // Викликаємо wake lock
      }}
    >
      <video id="hiddenVideo" loop muted playsInline autoPlay style={{ display: 'none' }}>
        <source src="/hidden.webm" type="video/webm" />
      </video>
    </div>
  );
}

