"use client";
import { useEffect, useState, useCallback, useRef } from 'react';

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
};

export default function Page() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [showHint, setShowHint] = useState<boolean>(true);

  const requestFullScreen = useCallback((): void => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  }, []);

  const exitFullScreen = useCallback((): void => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const requestWakeLock = useCallback(async (): Promise<void> => {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLockRef.current) return;
        // @ts-ignore
        const lock: WakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        lock.addEventListener?.('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    }
  }, []);

  const handleActivate = useCallback((): void => {
    if (!document.fullscreenElement) {
      requestFullScreen();
    }
    requestWakeLock();
    setShowHint(false);
  }, [requestFullScreen, requestWakeLock]);

  const handleDoubleClick = useCallback((): void => {
    exitFullScreen();
  }, [exitFullScreen]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
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
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={handleActivate}
      onDoubleClick={handleDoubleClick}
    >
      <video
        src="/hidden.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
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
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}>
          Press to run FullScreen.
          <br />
          Double tap — Exit Full Screen.
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
