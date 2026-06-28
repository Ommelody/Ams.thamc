import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { IOSDevice } from './IosFrame';
import { QRCode } from './Shared';
import { Icon, I } from './Icons';
import { Asset } from '../types';
import { STATUS_MAP, REPAIRS_MOCK, thb, thDate } from '../data';
import { deprFn } from './ViewsRegister'; // We will define this utility in register view

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export function CameraScanner({ onScanSuccess, onScanError }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const scannerId = "real-camera-scanner";

    const timer = setTimeout(() => {
      try {
        html5QrCode = new Html5Qrcode(scannerId);
        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const minDim = Math.min(width, height);
              return { width: minDim * 0.75, height: minDim * 0.75 };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (html5QrCode) {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(e => {
                console.error("Stop scanner error:", e);
                onScanSuccess(decodedText);
              });
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // silent diagnostic failures
          }
        ).catch(err => {
          console.error("Camera access permission error:", err);
          setError("ไม่สามารถเปิดใช้งานกล้องถ่ายภาพได้โปรดอนุญาตสิทธิ์กล้อง หรือสลับใช้แท็บแบบจำลองแทน");
          if (onScanError) onScanError(err.toString());
        });
      } catch (e: any) {
        console.error("HTML5 Qrcode initialization failed:", e);
        setError(e.message || "เกิดข้อผิดพลาดในการเริ่มต้นกล้อง");
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (html5QrCode) {
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(e => console.warn("Unmount scanner cleanup warnings:", e));
          }
        } catch (e) {
          console.warn("Scanner unmount exception:", e);
        }
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>
      {error ? (
        <div style={{ padding: "30px 20px", color: "#f87171", fontSize: 13.5, textAlign: "center", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", alignItems: "center", height: "100%", boxSizing: "border-box" }}>
          <div style={{ fontSize: 36 }}>📷⚠️</div>
          <div style={{ fontWeight: 600, lineHeight: 1.5 }}>{error}</div>
        </div>
      ) : (
        <div id="real-camera-scanner" style={{ width: "100%", height: "100%", overflow: "hidden", display: "block" }}></div>
      )}
    </div>
  );
}

interface ScanScreenProps {
  onDone: (scannedText: string) => void;
  mockAssetCode: string;
}

function ScanScreen({ onDone, mockAssetCode }: ScanScreenProps) {
  const [scanMode, setScanMode] = useState<"camera" | "simulator">("camera");
  const [secLeft, setSecLeft] = useState(2);

  useEffect(() => {
    if (scanMode !== "simulator") return;
    setSecLeft(2);
    const interval = setInterval(() => {
      setSecLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDone(mockAssetCode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [scanMode, mockAssetCode, onDone]);

  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const base: React.CSSProperties = { position: "absolute", width: 34, height: 34, borderColor: "#fff", borderStyle: "solid", borderWidth: 0, zIndex: 12 };
    const m = { 
      tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
      tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
      bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
      br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 } 
    }[pos];
    return <span style={{ ...base, ...m }} />;
  };

  return (
    <div style={{ height: "100%", background: "#0d1622", display: "flex", flexDirection: "column", color: "#fff", position: "relative" }}>
      {/* OS status padding spacer */}
      <div style={{ height: 44, background: "#16233a", zIndex: 30 }} />
      
      {/* Scan Mode Switcher Tabs inside mock frame */}
      <div style={{ display: "flex", width: "100%", borderBottom: "1px solid rgba(255,255,255,.1)", position: "relative", zIndex: 30, background: "#16233a" }}>
        {[
          { id: "camera" as const, label: "เปิดกล้องจริง 📷" },
          { id: "simulator" as const, label: "จำลองอัตโนมัติ 🤖" }
        ].map(t => (
          <button key={t.id} onClick={() => setScanMode(t.id)} style={{
            flex: 1, padding: "14px 6px", border: "none", background: scanMode === t.id ? "rgba(255,255,255,.12)" : "transparent",
            color: scanMode === t.id ? "#fff" : "rgba(255,255,255,.55)", fontFamily: "inherit", fontWeight: 700, fontSize: 13.8, cursor: "pointer", borderBottom: scanMode === t.id ? "3.5px solid var(--primary, #2d6cdf)" : "3px solid transparent", transition: "all .15s"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative" }}>
        {scanMode === "camera" ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 5, overflow: "hidden" }}>
            <CameraScanner onScanSuccess={(code) => onDone(code)} />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, #2a3850, #0d1622 70%)", zIndex: 5 }} />
        )}

        <div style={{ position: "absolute", top: 22, zIndex: 12, textAlign: "center", fontSize: 16, fontWeight: 700, width: "100%", left: 0, textShadow: "0 2px 4px rgba(0,0,0,.6)" }}>
          {scanMode === "camera" ? "เล็งกล้องสแกนคิวอาร์จริง" : "ระฆังสแกนระบบจำลอง"}
        </div>

        {/* Scan box frame overlay */}
        <div style={{ position: "relative", zIndex: 10, width: 220, height: 220, borderRadius: 14 }}>
          {corner("tl")}{corner("tr")}{corner("bl")}{corner("br")}
          <div style={{ position: "absolute", inset: 22, opacity: .11, display: "grid", placeItems: "center" }}>
            <QRCode value="scan-target" size={144} fg="#fff" bg="transparent" />
          </div>
          <div style={{ position: "absolute", left: 6, right: 6, height: 3, borderRadius: 2, background: "linear-gradient(90deg, transparent, #4fd1ff, transparent)", boxShadow: "0 0 12px #4fd1ff", animation: "scanLine 1.5s ease-in-out infinite", zIndex: 12 }} />
        </div>

        <div style={{ marginTop: 28, fontSize: 14, color: "#aebccd", textAlign: "center", lineHeight: 1.5, opacity: .95, zIndex: 10, textShadow: "0 2px 4px rgba(0,0,0,.6)" }}>
          {scanMode === "camera" 
            ? "คว่ำเล็งหน้ากล้องไปที่รูปคิวอาร์\nระบบจะตรวจจับพัสดุครุภัณฑ์ทันที" 
            : `จำลองการสำเร็จค่าในระบบคุม...\nหลังจากผ่านไปอีก ${secLeft} วินาที`}
        </div>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "#7fe0a3", zIndex: 10, background: "rgba(0,0,0,.5)", padding: "5px 12px", borderRadius: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "#7fe0a3", animation: "pulse 1s infinite" }} />
          {scanMode === "camera" ? "ระบบกล้องเปิดใช้งานแล้ว" : "รันโปรแกรมทวนสัญญาณ..."}
        </div>
      </div>
    </div>
  );
}

interface NotFoundScreenProps {
  code: string;
  onRescan: () => void;
  onRegister: () => void;
}

function NotFoundScreen({ code, onRescan, onRegister }: NotFoundScreenProps) {
  return (
    <div style={{ height: "100%", background: "#f2f2f7", display: "flex", flexDirection: "column", fontFamily: "inherit" }}>
      <div style={{ background: "linear-gradient(150deg, #9a3a2a, #5c1c11)", color: "#fff", padding: "75px 22px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>ไม่พบครุภัณฑ์พัสดุ</div>
            <div style={{ fontFamily: "monospace", fontSize: 12.8, color: "#fbd5d0", marginTop: 4 }}>{code}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", border: "1px solid #e1e1e6" }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: "#fef2f2", display: "grid", placeItems: "center", color: "#ef4444", marginBottom: 16 }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16.5, fontWeight: 700, color: "#1c1c1e" }}>รหัสนี้ไม่ได้ลงทะเบียน</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: "#8e8e93", lineHeight: 1.5 }}>
            คิวอาร์ที่สแกนไม่พบบันทึกครυภัณฑ์ในฐานข้อมูลพัสดุคุมของท้องถิ่นในขณะนี้
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onRegister} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: "#10b981", color: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon d={I.plus} size={18} stroke="#fff" /> แนบป้ายสแกนขึ้นทะเบียนใหม่
          </button>
          
          <button onClick={onRescan} style={{ width: "100%", padding: "13px", borderRadius: 13, border: "1.5px solid #2d6cdf", background: "none", color: "#2d6cdf", fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon d={I.qr} size={17} stroke="#2d6cdf" /> สแกนใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
}

function mInfo(label: string, value: string) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #ececf0", gap: 16 }}>
      <span style={{ fontSize: 14.5, color: "#8a8a90" }}>{label}</span>
      <span style={{ fontSize: 15, color: "#1c1c1e", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

interface HistoryScreenProps {
  asset: Asset;
  onRescan: () => void;
}

function HistoryScreen({ asset, onRescan }: HistoryScreenProps) {
  const st = STATUS_MAP[asset.status] || STATUS_MAP.available;
  const dep = deprFn(asset);
  const repairs = REPAIRS_MOCK.filter(r => r.code === asset.code);
  
  const moves = [
    { date: asset.acquired, event: "ขึ้นทะเบียนครุภัณฑ์", by: "เจ้าหน้าที่พัสดุ", note: `รับเข้าจาก ${asset.vendor}`, tone: "green" }
  ];

  const toneColorMap = { 
    green: "#22a35a", 
    blue: "#2d6cdf", 
    amber: "#d99022", 
    orange: "#ea7338", 
    red: "#e23b3b", 
    gray: "#8a96a8" 
  };
  const tColor = toneColorMap[st.tone] || "#2d6cdf";

  return (
    <div style={{ height: "100%", overflow: "auto", background: "#f2f2f7" }}>
      {/* header band */}
      <div style={{ background: "linear-gradient(150deg, #1e3a5f, #16233a)", color: "#fff", padding: "70px 22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.16)", borderRadius: 99, padding: "3px 10px", fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: tColor }} />{st.label}
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}>{asset.name}</div>
            <div style={{ fontFamily: "monospace", fontSize: 12.5, color: "#aebccd", marginTop: 5 }}>{asset.code}</div>
          </div>
          <div style={{ background: "#fff", padding: 5, borderRadius: 9 }}><QRCode value={asset.code} size={58} /></div>
        </div>
      </div>

      <div style={{ padding: "16px 18px 30px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: "#fff", borderRadius: 13, padding: "13px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1c1c1e" }}>{dep.used.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: "#8a8a90", marginTop: 2 }}>ปีที่ใช้งาน</div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 13, padding: "13px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: repairs.length ? "#ea7338" : "#1c1c1e" }}>{repairs.length}</div>
            <div style={{ fontSize: 12, color: "#8a8a90", marginTop: 2 }}>ครั้งที่ซ่อม</div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 13, padding: "13px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1c1c1e" }}>{(dep.book / 1000).toFixed(1)}k</div>
            <div style={{ fontSize: 12, color: "#8a8a90", marginTop: 2 }}>มูลค่าคงเหลือ</div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 13, padding: "4px 16px 8px", marginBottom: 14 }}>
          {mInfo("ผู้ครอบครอง", asset.holder)}
          {mInfo("แผนก/ฝ่าย", asset.dept)}
          {mInfo("สถานที่ตั้ง", asset.loc)}
          {mInfo("การถือครอง", asset.method)}
          {mInfo("วันที่ได้มา", thDate(asset.acquired))}
          {mInfo("ราคาทุน", thb(asset.price) + " ฿")}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#8a8a90", margin: "0 0 9px 4px", textTransform: "uppercase", letterSpacing: ".03em" }}>ประวัติการเคลื่อนไหว</div>
        <div style={{ background: "#fff", borderRadius: 13, padding: "16px 16px 8px" }}>
          {moves.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i === moves.length - 1 ? 8 : 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22a35a", marginTop: 3 }} />
                {i < moves.length - 1 && <span style={{ width: 2, flex: 1, background: "#ececf0", marginTop: 3 }} />}
              </div>
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1c1c1e" }}>{m.event}</div>
                <div style={{ fontSize: 12.5, color: "#8a8a90" }}>{thDate(m.date)} · {m.by}</div>
                <div style={{ fontSize: 13, color: "#6a6a70", marginTop: 1 }}>{m.note}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onRescan} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 13, border: "none", background: "#2d6cdf", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon d={I.qr} size={20} stroke="#fff" />สแกนชิ้นถัดไป
        </button>
      </div>
    </div>
  );
}

export interface MobileHostProps {
  assets: Asset[];
  onRegisterCode?: (code: string) => void;
}

export function MobileHost({ assets, onRegisterCode }: MobileHostProps) {
  const [mockAsset, setMockAsset] = useState<Asset | null>(null);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [phase, setPhase] = useState<"scan" | "history" | "not_found">("scan");

  useEffect(() => {
    const handleMobileEvent = (e: any) => { 
      const selected = e.detail.asset;
      setMockAsset(selected);
      setActiveAsset(selected); // default to selected for easy mock-scenarios
      setPhase("scan"); 
    };
    window.addEventListener("amsmobile", handleMobileEvent);
    return () => window.removeEventListener("amsmobile", handleMobileEvent);
  }, []);

  if (!mockAsset) return null;

  const handleScanDone = (code: string) => {
    const trimmedCode = code.trim();
    setScannedCode(trimmedCode);

    // Look up in assets list
    const matched = assets.find(a => 
      a.code.trim() === trimmedCode || 
      a.code.toLowerCase().replace(/\s/g, "") === trimmedCode.toLowerCase().replace(/\s/g, "")
    );

    if (matched) {
      setActiveAsset(matched);
      setPhase("history");
    } else {
      setPhase("not_found");
    }
  };

  const handleRegisterCode = () => {
    setMockAsset(null); // Close the scanner modal
    if (onRegisterCode && scannedCode) {
      onRegisterCode(scannedCode);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(13,22,34,.62)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) setMockAsset(null); }}>
      <div style={{ color: "#fff", maxWidth: 280, display: "none" }} className="mobile-hint" />
      <div style={{ transform: "scale(.86)", transformOrigin: "center" }}>
        <IOSDevice dark>
          {phase === "scan" && (
            <ScanScreen 
              mockAssetCode={mockAsset.code} 
              onDone={handleScanDone} 
            />
          )}
          {phase === "history" && activeAsset && (
            <HistoryScreen 
              asset={activeAsset} 
              onRescan={() => setPhase("scan")} 
            />
          )}
          {phase === "not_found" && (
            <NotFoundScreen 
              code={scannedCode} 
              onRescan={() => setPhase("scan")} 
              onRegister={handleRegisterCode} 
            />
          )}
        </IOSDevice>
      </div>
      <button onClick={() => setMockAsset(null)} style={{ position: "absolute", top: 24, right: 24, width: 44, height: 44, borderRadius: 12, border: "none", background: "rgba(255,255,255,.16)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
        <Icon d={I.close} size={22} stroke="#fff" />
      </button>
    </div>
  );
}

export function openMobile(asset: Asset) {
  window.dispatchEvent(new CustomEvent("amsmobile", { detail: { asset } }));
}
