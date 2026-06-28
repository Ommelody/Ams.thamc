import React from 'react';
import { Icon, I } from './Icons';

export const TONES = {
  green:  { bg: "#e8f5ee", fg: "#15803d", dot: "#22a35a" },
  blue:   { bg: "#e8f0fe", fg: "#1d4ed8", dot: "#2d6cdf" },
  amber:  { bg: "#fdf3e0", fg: "#b45309", dot: "#d99022" },
  orange: { bg: "#fdeee2", fg: "#c2410c", dot: "#ea7338" },
  red:    { bg: "#fdeaea", fg: "#b91c1c", dot: "#e23b3b" },
  gray:   { bg: "#eef1f5", fg: "#576274", dot: "#8a96a8" },
};

interface BadgeProps {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = "gray", children, dot = true }: BadgeProps) {
  const c = TONES[tone] || TONES.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px",
      borderRadius: 999, background: c.bg, color: c.fg, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: 99, background: c.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: boolean;
  className?: string;
  onClick?: () => void;
  key?: React.Key;
}

export function Card({ children, style, pad = true, className, onClick }: CardProps) {
  return (
    <div className={className} onClick={onClick} style={{ background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, boxShadow: "0 1px 2px rgba(20,35,58,.04)", padding: pad ? "var(--card-pad)" : 0, ...style }}>
      {children}
    </div>
  );
}

interface BtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'default' | 'ghost' | 'danger' | 'success';
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md';
}

export function Btn({ children, variant = "default", icon, onClick, style, type = "button", size = "md" }: BtnProps) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
    fontFamily: "inherit", fontWeight: 600, cursor: "pointer", borderRadius: 9,
    fontSize: size === "sm" ? 13 : 14.5, padding: size === "sm" ? "6px 12px" : "9px 16px",
    border: "1px solid transparent", transition: "filter .12s, background .12s",
    whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "#fff", boxShadow: "0 1px 2px rgba(20,35,58,.12)" },
    default: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost:   { background: "transparent", color: "var(--muted)" },
    danger:  { background: "#fdeaea", color: "#b91c1c", border: "1px solid #f4cfcf" },
    success: { background: "var(--success)", color: "#fff" },
  };
  return (
    <button type={type} onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(.96)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon d={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

interface QRCodeProps {
  value: string;
  size?: number;
  fg?: string;
  bg?: string;
}

export function QRCode({ value, size = 120, fg = "#14233a", bg = "#fff" }: QRCodeProps) {
  const n = 21;
  // deterministic hash → bit grid
  function rng(seed: number) { 
    let s = seed; 
    return () => { 
      s = (s * 1103515245 + 12345) & 0x7fffffff; 
      return s / 0x7fffffff; 
    }; 
  }
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff;
  const rand = rng(seed || 7);
  const cells: [number, number][] = [];
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (isFinder(r, c)) continue;
    if (rand() > 0.5) cells.push([r, c]);
  }
  const finder = (br: number, bc: number) => (
    <>
      <rect x={bc} y={br} width="7" height="7" fill={fg} />
      <rect x={bc + 1} y={br + 1} width="5" height="5" fill={bg} />
      <rect x={bc + 2} y={br + 2} width="3" height="3" fill={fg} />
    </>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} style={{ display: "block", borderRadius: 6 }} shapeRendering="crispEdges">
      <rect width={n} height={n} fill={bg} />
      {cells.map(([r, c], i) => <rect key={i} x={c} y={r} width="1" height="1" fill={fg} />)}
      {finder(0, 0)}{finder(0, n - 7)}{finder(n - 7, 0)}
    </svg>
  );
}

interface PageHeadProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  back?: () => void;
}

export function PageHead({ title, subtitle, actions, back }: PageHeadProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {back && (
          <button onClick={back} style={{ marginTop: 4, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 9, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text)", flexShrink: 0 }}>
            <Icon d={I.arrowLeft} size={18} />
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 700, color: "var(--text)", letterSpacing: "-.01em" }}>{title}</h1>
          {subtitle && <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 15 }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{actions}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  span?: number;
}

export function Field({ label, children, required, hint, span }: FieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: span ? `span ${span}` : "auto" }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
        {label} {required && <span style={{ color: "#e23b3b" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{hint}</span>}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9,
  border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box",
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { 
  return <input {...props} style={{ ...inputStyle, ...props.style }} />; 
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select {...props} style={{ ...inputStyle, ...props.style, appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%235b6b80' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center", paddingRight: 34 }}>
        {children}
      </select>
    </div>
  );
}

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: number;
}

export function SearchBox({ placeholder = "ค้นหา...", value, onChange, width = 280 }: SearchBoxProps) {
  return (
    <div style={{ position: "relative", width }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }}>
        <Icon d={I.search} size={17} />
      </span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: 36 }} />
    </div>
  );
}

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

export function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
      <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{children}</span>
    </div>
  );
}

