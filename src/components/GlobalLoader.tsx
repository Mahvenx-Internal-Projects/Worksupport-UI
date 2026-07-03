import React, { useEffect, useState } from 'react';

export const GlobalLoader: React.FC = () => {
  const [count, setCount] = useState(0);
  const loading = count > 0;

  useEffect(() => {
    const up   = () => setCount(c => c + 1);
    const down = () => setCount(c => Math.max(0, c - 1));
    window.addEventListener('ws360:loading:start', up);
    window.addEventListener('ws360:loading:done',  down);
    return () => {
      window.removeEventListener('ws360:loading:start', up);
      window.removeEventListener('ws360:loading:done',  down);
    };
  }, []);

  if (!loading) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
      background: 'linear-gradient(90deg,#f97316,#ef4444,#f97316)',
      backgroundSize: '300% 100%',
      animation: 'barAnim 1.2s linear infinite',
      boxShadow: '0 0 8px rgba(249,115,22,0.5)',
    }}>
      <style>{`@keyframes barAnim{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
};

export default GlobalLoader;
