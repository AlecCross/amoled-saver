// src/pages/index.js

import { useEffect, useState } from 'react';

export default function Home() {
  const [wakeLock, setWakeLock] = useState(null);
  const [showHint, setShowHint] = useState(true);

  const requestFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLock !== null) return;
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        lock.addEventListener?.('release', () => setWakeLock(null));
        lock.addEventListener?.('resume', requestWakeLock); // <- тут
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    }
  }  

  const handleActivate = () => {
    if (!document.fullscreenElement) {
      requestFullScreen();
    }
    requestWakeLock();
    setShowHint(false); // Підказку забираємо
  };

  const handleDoubleClick = () => {
    exitFullScreen();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
  
    requestWakeLock(); // Перший виклик при монтуванні
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleActivate}
      onDoubleClick={handleDoubleClick}
    >
      {showHint && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'lime',
          fontSize: '1.5rem',
          textAlign: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
          animation: 'move 10s infinite alternate ease-in-out',
        }}>
          Натисніть будь-де для запуску.  
          <br />
          Подвійний тап — вихід.
        </div>
      )}
      <style jsx>{`
        @keyframes move {
          0% { transform: translate(-50%, -50%) translateX(0) translateY(0); }
          100% { transform: translate(-50%, -50%) translateX(30px) translateY(30px); }
        }
      `}</style>
    </div>
  );
}
