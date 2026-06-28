import React, { useState } from 'react';
import { PageHead, Card, Badge, Btn, Select, InfoRow, QRCode } from './Shared';
import { Icon, I } from './Icons';
import { Asset } from '../types';
import { CATEGORIES, DEPARTMENTS, STATUS_MAP, REPAIR_STATUS, REPAIRS_MOCK, thb, thDate, exportToExcel } from '../data';
import { openPrint } from './FormsPrint';
import { openMobile } from './MobileScan';

export function catName(id: string): string { 
  const c = CATEGORIES.find(x => x.id === id); 
  return c ? c.name : id; 
}

export function deprFn(a: Asset) {
  const c = CATEGORIES.find(x => x.id === a.cat);
  const rate = c ? c.dep / 100 : 0.2;
  const annual = a.price * rate;
  const diffTime = Math.abs(new Date().getTime() - new Date(a.acquired).getTime());
  const years = Math.min(c ? c.life : 5, diffTime / (365.25 * 24 * 60 * 60 * 1000));
  const accumulated = Math.min(annual * years, a.price - 1);
  return { 
    rate, 
    annual, 
    accumulated, 
    book: Math.max(1, a.price - accumulated), 
    life: c ? c.life : 5, 
    used: years 
  };
}

interface RegisterViewProps {
  query: string;
  assets: Asset[];
  openAsset: (asset: Asset) => void;
  openForm: () => void;
}

const thc: React.CSSProperties = { padding: "12px 18px", fontWeight: 600, whiteSpace: "nowrap" };
const tdc: React.CSSProperties = { padding: "13px 18px", verticalAlign: "middle" };

export function RegisterView({ query, assets, openAsset, openForm }: RegisterViewProps) {
  const [cat, setCat] = useState("");
  const [dept, setDept] = useState("");
  const [st, setSt] = useState("");

  const rows = assets.filter(a =>
    (!query || (a.name + a.code + (a.holder || '')).toLowerCase().includes(query.toLowerCase())) &&
    (!cat || a.cat === cat) && 
    (!dept || a.dept === dept) && 
    (!st || a.status === st)
  );

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="ทะเบียนครุภัณฑ์" 
        subtitle={`ทะเบียนคุมทรัพย์สินภาครัฐ · ${rows.length} จาก ${assets.length} รายการ`}
        actions={
          <>
            <Btn icon={I.printer} variant="default" onClick={() => window.print()}>PDF</Btn>
            <Btn icon={I.download} variant="default" onClick={() => {
              const headers = {
                code: "รหัสครุภัณฑ์",
                name: "ชื่อครุภัณฑ์",
                cat: "หมวดหมู่",
                dept: "ฝ่าย/แผนก",
                holder: "ผู้ถือครอง",
                loc: "สถานที่ตั้ง",
                acquired: "วันที่ได้มา",
                price: "ราคาทุน (บาท)",
                vendor: "ผู้ขาย/บริษัท",
                status: "สถานะ",
                method: "วิธีการได้มา"
              };
              const exportRows = rows.map(r => ({
                ...r,
                cat: catName(r.cat),
                status: STATUS_MAP[r.status as keyof typeof STATUS_MAP]?.label || r.status
              }));
              exportToExcel(exportRows, "Register_Assets.csv", headers);
            }}>Excel</Btn>
            <Btn icon={I.plus} variant="primary" onClick={openForm}>ขึ้นทะเบียนครุภัณฑ์</Btn>
          </>
        } 
      />

      <Card pad={false}>
        <div style={{ display: "flex", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--muted)", fontSize: 13.5, fontWeight: 600 }}>
            <Icon d={I.filter} size={17} /> กรอง
          </span>
          <div style={{ width: 210 }}>
            <Select value={cat} onChange={e => setCat(e.target.value)}>
              <option value="">ทุกหมวดหมู่</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div style={{ width: 200 }}>
            <Select value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">ทุกแผนก</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <div style={{ width: 170 }}>
            <Select value={st} onChange={e => setSt(e.target.value)}>
              <option value="">ทุกสถานะ</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".03em" }}>
                <th style={thc}>รหัสครุภัณฑ์</th>
                <th style={thc}>ชื่อครุภัณฑ์</th>
                <th style={thc}>หมวดหมู่</th>
                <th style={thc}>ผู้ครอบครอง</th>
                <th style={thc}>สถานที่</th>
                <th style={{ ...thc, textAlign: "right" }}>มูลค่า (บาท)</th>
                <th style={thc}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.code} onClick={() => openAsset(a)} style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={tdc}><span style={{ fontFamily: "monospace", fontSize: 12.8, color: "var(--text)", fontWeight: 600 }}>{a.code}</span></td>
                  <td style={{ ...tdc, fontWeight: 600, color: "var(--text)" }}>{a.name}</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{catName(a.cat).replace("ครุภัณฑ์", "")}</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{a.holder || "—"}</td>
                  <td style={{ ...tdc, color: "var(--muted)", fontSize: 13 }}>{a.loc}</td>
                  <td style={{ ...tdc, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{thb(a.price)}</td>
                  <td style={tdc}><Badge tone={(STATUS_MAP[a.status]?.tone ?? "gray")}>{STATUS_MAP[a.status]?.label ?? "พร้อมใช้งาน"}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>ไม่พบรายการครุภัณฑ์ที่ตรงเงื่อนไข</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface AssetDetailProps {
  asset: Asset;
  back: () => void;
  onEdit?: (asset: Asset) => void;
}

export function AssetDetail({ asset, back }: AssetDetailProps) {
  const dep = deprFn(asset);
  
  const moves = [
    { date: asset.acquired, event: "ขึ้นทะเบียนครุภัณฑ์", by: "เจ้าหน้าที่พัสดุ", note: `รับเข้าจาก ${asset.vendor} ภายใต้สิทธิ์ ${asset.method}`, tone: "green" as const },
  ];

  const repairs = REPAIRS_MOCK.filter(r => r.code === asset.code);

  const tonesStyle = {
    orange: { fg: "#c2410c" },
    green: { fg: "#15803d" },
  };

  return (
    <div className="animate-fadeIn">
      <PageHead 
        back={back} 
        title={asset.name} 
        subtitle={<span style={{ fontFamily: "monospace" }}>{asset.code}</span>}
        actions={
          <>
            <Btn icon={I.printer} variant="default" onClick={() => openPrint("registration", asset)}>พิมพ์ใบประวัติ</Btn>
            <Btn icon={I.register} variant="primary">แก้ไขข้อมูล</Btn>
          </>
        } 
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>ข้อมูลทั่วไป</h3>
          <InfoRow label="หมวดหมู่">{catName(asset.cat)}</InfoRow>
          <InfoRow label="แผนก/ฝ่าย">{asset.dept}</InfoRow>
          <InfoRow label="ผู้ครอบครอง">{asset.holder || "—"}</InfoRow>
          <InfoRow label="ลักษณะการถือครอง">{asset.method || "—"}</InfoRow>
          <InfoRow label="สถานที่ตั้ง">{asset.loc}</InfoRow>
          <InfoRow label="วันที่ได้มา">{thDate(asset.acquired)}</InfoRow>
          <InfoRow label="ผู้จัดจำหน่าย">{asset.vendor}</InfoRow>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "10px 0" }}>
            <span style={{ fontSize: 13.5, color: "var(--muted)" }}>สถานะปัจจุบัน</span>
            <span><Badge tone={(STATUS_MAP[asset.status]?.tone ?? "gray")}>{STATUS_MAP[asset.status]?.label ?? "พร้อมใช้งาน"}</Badge></span>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ padding: 12, background: "#fff", borderRadius: 12, border: "1px solid var(--border)" }}>
            <QRCode value={asset.code} size={132} />
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{asset.code}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>สแกนเพื่อดูประวัติครุภัณฑ์</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" icon={I.printer} variant="default" onClick={() => openPrint("registration", asset)}>พิมพ์ป้าย QR</Btn>
            <Btn size="sm" icon={I.qr} variant="default" onClick={() => openMobile(asset)}>เปิดบนมือถือ</Btn>
          </div>
        </Card>
      </div>

      {/* depreciation */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>การคำนวณค่าเสื่อมราคา (วิธีเส้นตรง)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 }}>
          {[
            { l: "ราคาทุน", v: thb(asset.price) + " ฿" },
            { l: "อัตราค่าเสื่อม/ปี", v: (dep.rate * 100) + "%" },
            { l: "ค่าเสื่อมสะสม", v: thb(dep.accumulated) + " ฿", tone: "orange" as const },
            { l: "มูลค่าคงเหลือสุทธิ", v: thb(dep.book) + " ฿", tone: "green" as const },
          ].map((x, i) => (
            <div key={i} style={{ padding: "14px 16px", background: "var(--hover)", borderRadius: 10 }}>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 5 }}>{x.l}</div>
              <div style={{ 
                fontSize: 19, 
                fontWeight: 700, 
                color: x.tone ? (tonesStyle[x.tone]?.fg || "var(--text)") : "var(--text)", 
                fontVariantNumeric: "tabular-nums" 
              }}>
                {x.v}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--muted)" }}>
          <span>อายุการใช้งาน {dep.life} ปี · ใช้งานแล้ว {dep.used.toFixed(1)} ปี</span>
          <div style={{ flex: 1, height: 8, background: "var(--hover)", borderRadius: 99, overflow: "hidden", maxWidth: 320 }}>
            <div style={{ width: `${Math.min(100, (dep.used / dep.life) * 100)}%`, height: "100%", background: "var(--primary)" }} />
          </div>
        </div>
      </Card>

      {/* movement history */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>ประวัติการเคลื่อนไหว</h3>
          {moves.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 13, paddingBottom: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 11, height: 11, borderRadius: 99, background: "#22a35a", marginTop: 4, boxShadow: `0 0 0 3px #e8f5ee` }} />
              </div>
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.event}</div>
                <div style={{ fontSize: 12.8, color: "var(--muted)" }}>{thDate(m.date)} · {m.by}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{m.note}</div>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>ประวัติการซ่อมบำรุง</h3>
          {repairs.length ? repairs.map((r, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--hover)", borderRadius: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 600 }}>{r.id}</span>
                <Badge tone={(REPAIR_STATUS[r.status]?.tone ?? "gray")}>{REPAIR_STATUS[r.status]?.label ?? "รอซ่อม"}</Badge>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text)" }}>{r.problem}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{thDate(r.date)} · แจ้งโดย {r.reporter}</div>
            </div>
          )) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 0", color: "var(--muted)", gap: 10 }}>
              <Icon d={I.check} size={32} stroke="var(--success)" />
              <span style={{ fontSize: 14 }}>ไม่มีประวัติการแจ้งซ่อม</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
