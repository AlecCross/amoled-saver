// src/pages/index.js

import { useEffect, useState, useCallback, useRef } from 'react';

export default function Home() {
  const wakeLockRef = useRef(null);
  const [showHint, setShowHint] = useState(true);

  const requestFullScreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  }, []);

  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLockRef.current) return; // Якщо вже є — не робимо новий запит
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        lock.addEventListener?.('release', () => {
          wakeLockRef.current = null;
        });
        lock.addEventListener?.('release', () => {
          wakeLockRef.current = null;
        });        
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    }
  }, []);

  const handleActivate = useCallback(() => {
    if (!document.fullscreenElement) {
      requestFullScreen();
    }
    requestWakeLock();
    setShowHint(false);
  }, [requestFullScreen, requestWakeLock]);

  const handleDoubleClick = useCallback(() => {
    exitFullScreen();
  }, [exitFullScreen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      wakeLockRef.current?.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

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
    opacity: showHint ? 1 : 0, // тут
    transition: 'opacity 0.5s ease-in-out', // і тут
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
