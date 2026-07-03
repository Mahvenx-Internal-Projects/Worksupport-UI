import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

/**
 * Drop this component at the TOP of your existing RegisterPage JSX.
 * It shows a blocking modal when no role is selected yet.
 *
 * Usage inside your RegisterPage:
 *   import RolePickerModal from './RolePickerModal';
 *
 *   // inside component, before your return:
 *   const [sp] = useSearchParams();
 *   const [roleReady, setRoleReady] = useState(!!sp.get('role'));
 *
 *   // inside return, as first child:
 *   {!roleReady && <RolePickerModal onPick={(r) => { setRole(r); setRoleReady(true); }} />}
 */

interface Props {
  onPick: (role: 'Client' | 'Freelancer') => void;
}

export default function RolePickerModal({ onPick }: Props) {
  const [visible, setVisible] = useState(false);

  // Fade in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const pick = (role: 'Client' | 'Freelancer') => {
    setVisible(false);
    setTimeout(() => onPick(role), 200);
  };

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform: scale(.95) translateY(12px) }
          to   { opacity:1; transform: scale(1)  translateY(0) }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        opacity: visible ? 1 : 0,
        transition: 'opacity .2s ease',
      }}>
        {/* Modal card */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '40px 36px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          animation: 'modalIn .3s cubic-bezier(.16,1,.3,1) both',
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>👋</div>
            <h2 style={{
              fontWeight: 900, fontSize: 24, color: '#0f172a',
              margin: '0 0 7px', letterSpacing: '-0.03em',
            }}>
              Before we start…
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
              How do you want to use WorkSupport 360?
            </p>
          </div>

          {/* Client option */}
          <button onClick={() => pick('Client')}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              width: '100%', padding: '18px 20px', borderRadius: 18, marginBottom: 12,
              border: '2px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all .18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#f97316';
              e.currentTarget.style.background = '#fff7ed';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.14)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg,#f97316,#ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: '0 3px 12px rgba(249,115,22,0.3)',
            }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>
                I'm a Client / Business
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 9 }}>
                I want to hire IT experts and post requirements.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Post requirements', 'Hire by the hour', 'DevOps help'].map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 6,
                    background: '#fff7ed', color: '#f97316', fontWeight: 600,
                    border: '1px solid #fed7aa',
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowRight size={17} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
          </button>

          {/* Freelancer option */}
          <button onClick={() => pick('Freelancer')}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              width: '100%', padding: '18px 20px', borderRadius: 18,
              border: '2px solid #e2e8f0', background: '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all .18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.background = '#f5f3ff';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: '0 3px 12px rgba(124,58,237,0.25)',
            }}>👨‍💻</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>
                I'm an IT Freelancer
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 9 }}>
                I work at an MNC and want to earn extra income on my free hours.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {['Earn extra income', 'Identity protected', 'Work freely'].map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 6,
                    background: '#f5f3ff', color: '#7c3aed', fontWeight: 600,
                    border: '1px solid #ddd6fe',
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowRight size={17} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
          </button>
        </div>
      </div>
    </>
  );
}
