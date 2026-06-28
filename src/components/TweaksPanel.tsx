import React, { useState, useEffect, useRef, useCallback } from 'react';

const __TWEAKS_STYLE = `
  .twk-panel {
    position: fixed; right: 16px; bottom: 16px; z-index: 50; width: 280px;
    max-height: calc(100vh - 32px); display: flex; flex-direction: column;
    transform: scale(var(--dc-inv-zoom,1)); transform-origin: bottom right;
    background: rgba(250,249,247,.9); color: #29261b;
    -webkit-backdrop-filter: blur(24px) saturate(160%); backdrop-filter: blur(24px) saturate(160%);
    border: .5px solid rgba(255,255,255,.6); border-radius: 14px;
    box-shadow: 0 1px 0 rgba(255,255,255,.5) inset, 0 12px 40px rgba(0,0,0,.18);
    font: 11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif; overflow: hidden;
  }
  .twk-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 8px 10px 14px; cursor: move; user-select: none;
  }
  .twk-hd b { font-size: 12px; font-weight: 600; letter-spacing: .01em; }
  .twk-x {
    appearance: none; border: 0; background: transparent; color: rgba(41,38,27,.55);
    width: 22px; height: 22px; border-radius: 6px; cursor: pointer; font-size: 13px; line-height: 1;
  }
  .twk-x:hover { background: rgba(0,0,0,.06); color: #29261b; }
  .twk-body {
    padding: 2px 14px 14px; display: flex; flex-direction: column; gap: 10px;
    overflow-y: auto; overflow-x: hidden; min-height: 0;
  }
  .twk-sect {
    font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    color: rgba(41,38,27,.45); padding: 10px 0 0;
  }
  .twk-sect:first-child { padding-top: 0; }
  .twk-row { display: flex; flex-direction: column; gap: 5px; }
  .twk-row-h { flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; }
  .twk-lbl { display: flex; justify-content: space-between; align-items: baseline; color: rgba(41,38,27,.72); }
  .twk-lbl > span:first-child { font-weight: 500; }
  .twk-val { color: rgba(41,38,27,.5); font-variant-numeric: tabular-nums; }
  .twk-field {
    appearance: none; box-sizing: border-box; width: 100%; min-width: 0; height: 26px; padding: 0 8px;
    border: .5px solid rgba(0,0,0,.1); border-radius: 7px;
    background: rgba(255,255,255,.6); color: inherit; font: inherit; outline: none;
  }
  .twk-field:focus { border-color: rgba(0,0,0,.25); background: rgba(255,255,255,.85); }
  select.twk-field {
    padding-right: 22px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat: no-repeat; background-position: right 8px center;
  }
  .twk-seg { position: relative; display: flex; padding: 2px; border-radius: 8px; background: rgba(0,0,0,.06); user-select: none; }
  .twk-seg-thumb {
    position: absolute; top: 2px; bottom: 2px; border-radius: 6px;
    background: rgba(255,255,255,.9); box-shadow: 0 1px 2px rgba(0,0,0,.12);
    transition: left .15s cubic-bezier(.3,.7,.4,1), width .15s;
  }
  .twk-seg button {
    appearance: none; position: relative; z-index: 1; flex: 1; border: 0;
    background: transparent; color: inherit; font: inherit; font-weight: 500; min-height: 22px;
    border-radius: 6px; cursor: pointer; padding: 4px 6px; line-height: 1.2;
  }
  .twk-chips { display: flex; gap: 6px; }
  .twk-chip {
    position: relative; appearance: none; flex: 1; min-width: 0; height: 32px;
    padding: 0; border: 0; border-radius: 6px; overflow: hidden; cursor: pointer;
    box-shadow: 0 0 0 .5px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.06);
    transition: transform .12s ease;
  }
  .twk-chip:hover { transform: translateY(-1px); }
  .twk-chip[data-on="1"] { box-shadow: 0 0 0 1.5px rgba(0,0,0,.85), 0 2px 6px rgba(0,0,0,.15); }
  .twk-chip svg { position: absolute; top: 6px; left: 6px; width: 13px; height: 13px; }
`;

export function useTweaks<T>(defaults: T): [T, (key: keyof T, val: any) => void] {
  const [values, setValues] = useState<T>(() => {
    const local = localStorage.getItem("ams_tweaks");
    return local ? JSON.parse(local) : defaults;
  });

  const setTweak = useCallback((key: keyof T, val: any) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem("ams_tweaks", JSON.stringify(next));
      return next;
    });
  }, []);

  return [values, setTweak];
}

interface TweaksPanelProps {
  children: React.ReactNode;
}

export function TweaksPanel({ children }: TweaksPanelProps) {
  const [open, setOpen] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const PAD = 16;

  const clampToViewport = useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    panel.style.right = "16px";
    panel.style.bottom = "16px";
  }, []);

  useEffect(() => {
    if (!open) return;
    clampToViewport();
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [open, clampToViewport]);

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        style={{ 
          position: "fixed", 
          right: 16, 
          bottom: 16, 
          zIndex: 50, 
          width: 36, 
          height: 36, 
          borderRadius: "50%", 
          background: "var(--primary)", 
          color: "#fff", 
          border: "none", 
          cursor: "pointer", 
          display: "grid", 
          placeItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,.15)"
        }}
      >
        ⚙️
      </button>
    );
  }

  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome="">
        <div className="twk-hd">
          <b>⚙️ ปรับแต่งระบบ (Tweaks)</b>
          <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

export function TweakSection({ label }: { label: string }) {
  return <div className="twk-sect">{label}</div>;
}

export function TweakRow({ label, value, children, inline = false }: { label: string; value?: string; children: React.ReactNode; inline?: boolean }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function TweakColor({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o) => {
          const on = o.toLowerCase() === value.toLowerCase();
          return (
            <button key={o} type="button" className="twk-chip" role="radio"
              aria-checked={on} data-on={on ? '1' : '0'}
              style={{ background: o }}
              onClick={() => onChange(o)}
            >
              {on && (
                <svg viewBox="0 0 14 14" aria-hidden="true" style={{ width: 12, height: 12, margin: "auto" }}>
                  <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="#fff" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

export function TweakRadio({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const n = options.length;
  const idx = options.indexOf(value);
  return (
    <TweakRow label={label}>
      <div className="twk-seg">
        <div className="twk-seg-thumb" style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`, width: `calc((100% - 4px) / ${n})` }} />
        {options.map(o => (
          <button key={o} type="button" onClick={() => onChange(o)} style={{ color: value === o ? '#000' : '#666', fontWeight: value === o ? 600 : 500 }}>
            {o}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

export function TweakSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </TweakRow>
  );
}
