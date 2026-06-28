import React from 'react';

interface IconProps {
  d: React.ReactNode;
  size?: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  style?: React.CSSProperties;
}

export function Icon({ d, size = 20, fill = "none", stroke = "currentColor", sw = 1.6, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {d}
    </svg>
  );
}

export const I = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1"/>
      <rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3" y="16" width="7" height="5" rx="1"/>
    </>
  ),
  register: (
    <>
      <path d="M9 3h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 1-1Z"/>
      <path d="M9 12h6M9 16h4"/>
    </>
  ),
  requisition: (
    <>
      <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/>
      <path d="M9 13l2 2 4-4"/>
    </>
  ),
  return: (
    <>
      <path d="M3 9l4-4 4 4"/>
      <path d="M7 5v9a4 4 0 0 0 4 4h8"/>
    </>
  ),
  repair: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8 7.2 20l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.3-2.3 2.5-2.5Z"/>
    </>
  ),
  disposal: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
    </>
  ),
  reports: (
    <>
      <path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/>
      <path d="M14 3v5h5"/>
      <path d="M8 13v4M12 11v6M16 14v3"/>
    </>
  ),
  audit: (
    <>
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-3.5-3.5"/>
      <path d="m8.5 11 2 2 3-3.5"/>
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-3.5-3.5"/>
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14"/>
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/>
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5"/>
      <path d="M5 21h14"/>
    </>
  ),
  printer: (
    <>
      <path d="M6 9V3h12v6"/>
      <rect x="4" y="9" width="16" height="8" rx="1"/>
      <path d="M8 17h8v4H8z"/>
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3M21 14v7M14 21h3"/>
    </>
  ),
  chevron: (
    <>
      <path d="m9 6 6 6-6 6"/>
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5M11 18l-6-6 6-6"/>
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5"/>
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18M6 6l12 12"/>
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/>
      <path d="m3 8 9 5 9-5M12 13v8"/>
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="7" rx="6" ry="3"/>
      <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/>
      <path d="M15 11.5c2.5.2 6 1.3 6 3.5 0 1.7-2.7 3-6 3-1.3 0-2.5-.2-3.5-.5"/>
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z"/>
      <path d="M12 10v4M12 17h.01"/>
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 0 0 3-3"/>
      <path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-1.6 1.6a2 2 0 0 1-2.8 0l-1-1a2 2 0 0 1 0-2.8L9 5"/>
      <path d="M3 13.5 8 9"/>
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </>
  ),
};
export type IconName = keyof typeof I;
