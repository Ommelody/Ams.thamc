import React from 'react';
import { Card, PageHead, Btn, Badge, TONES } from './Shared';
import { Icon, I } from './Icons';
import { Asset, Requisition, Activity } from '../types';
import { CATEGORIES, REQ_STATUS, ROLES, thb, exportToExcel } from '../data';

interface StatCardProps {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon, tone, label, value, sub }: StatCardProps) {
  const c = TONES[tone] || TONES.gray;
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, color: c.fg, display: "grid", placeItems: "center" }}>
          <Icon d={icon} size={22} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-.01em", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: c.fg, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
      </div>
    </Card>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
}

function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 140px", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
          <div style={{ height: 12, background: "var(--hover)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: "var(--primary)", borderRadius: 99, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
          </div>
          <span style={{ fontSize: 13, color: "var(--muted)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{thb(d.value).replace(".00", "")} ฿</span>
        </div>
      ))}
    </div>
  );
}

interface DonutProps {
  segments: Array<{ label: string; tone: keyof typeof TONES; value: number }>;
  total: number;
}

function Donut({ segments, total }: DonutProps) {
  const R = 54, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--hover)" strokeWidth="18" />
        {segments.map((s, i) => {
          const len = (s.value / (total || 1)) * C;
          const el = (
            <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={(TONES[s.tone]?.dot || "#000")} strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="65" textAnchor="middle" style={{ fontSize: 26, fontWeight: 700, fill: "var(--text)", fontFamily: "inherit" }}>{total}</text>
        <text x="70" y="84" textAnchor="middle" style={{ fontSize: 12, fill: "var(--muted)", fontFamily: "inherit" }}>รายการ</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 150 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: (TONES[s.tone]?.dot || "#000") }} />
            <span style={{ fontSize: 13.5, color: "var(--text)", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardProps {
  role: string;
  setView: (v: string) => void;
  openAsset: (a: Asset) => void;
  assets: Asset[];
  requisitions: Requisition[];
  activities: Activity[];
}

export function Dashboard({ role, setView, openAsset, assets, requisitions, activities }: DashboardProps) {
  const activeValue = assets.filter(a => a.status !== "disposed").reduce((s, a) => s + (a.price || 0), 0);
  const totalAssetsCount = assets.filter(a => a.status !== "disposed").length;
  const inUseCount = assets.filter(a => a.status === "in_use" || a.status === "borrowed").length;
  const borrowedCount = assets.filter(a => a.status === "borrowed").length;
  const repairCount = assets.filter(a => a.status === "repair").length;
  const pendingRequestsCount = requisitions.filter(r => r.status === "pending").length;

  const byCat = CATEGORIES.map(c => ({
    label: c.name.replace("ครุภัณฑ์", ""),
    value: assets.filter(a => a.cat === c.id && a.status !== "disposed").reduce((s, a) => s + (a.price || 0), 0),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const statusSegs = [
    { label: "ใช้งานอยู่", tone: "blue" as const, value: assets.filter(a => a.status === "in_use").length },
    { label: "พร้อมใช้งาน", tone: "green" as const, value: assets.filter(a => a.status === "available").length },
    { label: "ถูกยืม", tone: "amber" as const, value: borrowedCount },
    { label: "รอ/กำลังซ่อม", tone: "orange" as const, value: repairCount },
    { label: "สูญหาย", tone: "red" as const, value: assets.filter(a => a.status === "lost").length },
  ].filter(s => s.value > 0);

  const currentRoleObj = ROLES.find(x => x.id === role) || ROLES[0];
  const greetingText = role === "exec" 
    ? "ภาพรวมทรัพย์สินของหน่วยงาน" 
    : role === "approver" 
      ? "รายการที่รอการอนุมัติจากท่าน" 
      : "สรุปภาพรวมการทำงานวันนี้";

  return (
    <div className="animate-fadeIn">
      <PageHead title={`สวัสดี, ${currentRoleObj.name.split(" ")[0]}`} subtitle={greetingText} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 18 }}>
        <StatCard icon={I.box} tone="blue" label="ครุภัณฑ์ทั้งหมด" value={totalAssetsCount} sub={`${assets.length} รายการรวมจำหน่าย`} />
        <StatCard icon={I.coins} tone="green" label="มูลค่าทรัพย์สินรวม" value={`${(activeValue / 1e6).toFixed(2)} ล.`} sub={`${thb(activeValue).replace(".00","")} บาท`} />
        <StatCard icon={I.handshake} tone="amber" label="กำลังถูกยืม/ครอบครอง" value={inUseCount} sub={`ยืมใช้งาน ${borrowedCount} รายการ`} />
        <StatCard icon={I.repair} tone="orange" label="รอ/กำลังซ่อม" value={repairCount} sub="ต้องติดตามซ่อมบำรุง" />
        <StatCard icon={I.clock} tone="red" label="คำขอเบิกรออนุมัติ" value={pendingRequestsCount} sub="Pending actions" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 18 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between" as any, marginBottom: 20, justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>มูลค่าครุภัณฑ์ตามหมวดหมู่</h3>
            <Btn size="sm" variant="ghost" icon={I.download} onClick={() => {
              exportToExcel(byCat, "Dashboard_Category_Summary.csv", {
                name: "หมวดหมู่ครุภัณฑ์",
                count: "จำนวนครุภัณฑ์ (รายการ)",
                value: "มูลค่าครุภัณฑ์สะสม (บาท)"
              });
            }}>Excel</Btn>
          </div>
          <BarChart data={byCat} />
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 20px", fontSize: 16.5, fontWeight: 700 }}>สถานการณ์ถือครองสภาพ</h3>
          <Donut segments={statusSegs} total={totalAssetsCount} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Card pad={false}>
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between" as any, padding: "18px 22px 14px", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>รายการร้องขอรอดำเนินการ</h3>
            <button onClick={() => setView("requisition")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>ดูทั้งหมด →</button>
          </div>
          <div>
            {requisitions.filter(r => r.status === "pending" || r.status === "approved").slice(0, 5).map(req => (
              <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderTop: "1px solid var(--border)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: (TONES[REQ_STATUS[req.status]?.tone ?? 'gray']?.bg), color: (TONES[REQ_STATUS[req.status]?.tone ?? 'gray']?.fg), display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon d={I.requisition} size={19} />
                </div>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: 0 }}>
                  <div style={{ fontSize: 14.2, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.item}</div>
                  <div style={{ fontSize: 12.8, color: "var(--muted)" }}>{req.id} · {req.requester} · {req.type}</div>
                </div>
                <Badge tone={(REQ_STATUS[req.status]?.tone ?? "gray")}>{REQ_STATUS[req.status]?.label ?? "รออนุมัติ"}</Badge>
              </div>
            ))}
            {requisitions.filter(r => r.status === "pending" || r.status === "approved").length === 0 && (
              <div style={{ padding: 34, textAlign: "center", color: "var(--muted)", fontSize: 14.5 }}>ไม่มีคำขอเบิกรอดำเนินการในขณะนี้</div>
            )}
          </div>
        </Card>

        <Card pad={false}>
          <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, padding: "18px 22px 6px" }}>ความเคลื่อนไหวล่าสุด</h3>
          <div style={{ padding: "8px 22px 18px" }}>
            {activities.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 13, paddingBottom: i === activities.length - 1 ? 0 : 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ 
                    width: 11, 
                    height: 11, 
                    borderRadius: 99, 
                    background: (TONES[a.tone]?.dot || "#000"), 
                    marginTop: 4, 
                    flexShrink: 0, 
                    boxShadow: `0 0 0 3px ${(TONES[a.tone]?.bg || "#fff")}` 
                  }} />
                  {i < activities.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />}
                </div>
                <div style={{ lineHeight: 1.4, paddingBottom: 2 }}>
                  <div style={{ fontSize: 13.8, color: "var(--text)" }}><b style={{ fontWeight: 600 }}>{a.who}</b> {a.action}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{a.target} · {a.t.split(" ")[1] ?? ""} น.</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default Dashboard;
