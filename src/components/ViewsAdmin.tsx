import React, { useState } from 'react';
import { Card, PageHead, Badge, Btn, Select } from './Shared';
import { Icon, I } from './Icons';
import { Asset } from '../types';
import { CATEGORIES, DEPARTMENTS, LOCATIONS, PEOPLE, REPORTS_STRUCTURE, SUPABASE_DDL_SCRIPT } from '../data';
import { openMobile } from './MobileScan';

const thc: React.CSSProperties = { padding: "12px 18px", fontWeight: 600, whiteSpace: "nowrap" };
const tdc: React.CSSProperties = { padding: "13px 18px", verticalAlign: "middle" };

// ─────────────────────────────────────────────────────────────
// 1. Reports View
// ─────────────────────────────────────────────────────────────
export function ReportsView() {
  return (
    <div className="animate-fadeIn">
      <PageHead title="รายงานคุมครุภัณฑ์พัสดุ (Reports)" subtitle="ระบบสถิติและรายงาน ทะเบียน ดึงไฟล์ PDF และ Excel เพื่อเสนอส่วนงานผู้ตรวจเงินแผ่นดิน (สตง.)" />
      {REPORTS_STRUCTURE.map(g => (
        <div key={g.group} style={{ marginBottom: 26 }}>
          <h3 style={{ margin: "0 0 13px", fontSize: 15, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 16, background: "var(--primary)", borderRadius: 2 }} />รายงานคุมหมวดหมู่ — {g.group}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 14 }}>
            {g.items.map(it => (
              <Card key={it.name} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon d={I.reports} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.8, fontWeight: 600, color: "var(--text)", lineHeight: 1.35 }}>{it.name}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 12px", lineHeight: 1.4 }}>{it.desc}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn size="sm" variant="default" icon={I.printer}>ดาวน์โหลด PDF</Btn>
                    <Btn size="sm" variant="default" icon={I.download}>พิมพ์ Excel</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Audit View (ตรวจนับพัสดุประจำปี)
// ─────────────────────────────────────────────────────────────
interface AuditViewProps {
  assets: Asset[];
  onAuditAsset: (code: string) => void;
}

export function AuditView({ assets, onAuditAsset }: AuditViewProps) {
  // Let's filter out previously disposed items
  const activeAssets = assets.filter(a => a.status !== "disposed");
  
  // Track auditted status locally in localstorage
  const [auditedCodes, setAuditedCodes] = useState<string[]>(() => {
    const l = localStorage.getItem("ams_audited_codes");
    return l ? JSON.parse(l) : [assets[0]?.code, assets[1]?.code].filter(Boolean);
  });

  const handleAudit = (code: string) => {
    const updated = [...auditedCodes, code];
    setAuditedCodes(updated);
    localStorage.setItem("ams_audited_codes", JSON.stringify(updated));
    onAuditAsset(code);
  };

  const total = activeAssets.length;
  const checked = auditedCodes.filter(c => activeAssets.some(a => a.code === c)).length;
  const pct = Math.round((checked / (total || 1)) * 100);

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="ตรวจนับพัสดุประจำปีงบประมาณ" 
        subtitle="ตรวจสอบความสมบูรณ์และสถานที่ตั้งของพัสดุครุภัณฑ์ตามระเบียบตรงกรมบัญชีกลางประจำปี"
        actions={
          <>
            <Btn icon={I.download} variant="default">พิมพ์ผลสรุปตรวจสอบ</Btn>
            <Btn icon={I.qr} variant="primary" onClick={() => openMobile(activeAssets[2] || activeAssets[0])}>เปิดสแกนตรวจนับกล้องมือถือ</Btn>
          </>
        } 
      />

      <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e8f5ee", color: "#15803d", display: "grid", placeItems: "center" }}>
            <Icon d={I.audit} size={26} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>ตรวจสอบพัสดุประจำงวดปี 2567</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)" }}>เปิดคิวสำรวจ: 1 ก.ค. 2567 · กำหนดสิ้นสุดตรวจสอบ: 30 ก.ย. 2567</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 7 }}>
            <span style={{ color: "var(--muted)" }}>ความคืบหน้าระบบตรวจนับพัสดุ</span>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{checked}/{total} รายการ ({pct}%)</span>
          </div>
          <div style={{ height: 12, background: "var(--hover)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#22a35a", borderRadius: 99 }} />
          </div>
        </div>
      </Card>

      <Card pad={false}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase" }}>
              <th style={thc}>รหัสคุ้มพัสดุ</th>
              <th style={thc}>รายการพัสดุ</th>
              <th style={thc}>สถานที่จัดวางตรวจพบล่าสุด</th>
              <th style={thc}>ผลลัพธ์ตรวจนับ</th>
              <th style={{ ...thc, textAlign: "right" }}>เครื่องมือตรวจนับ</th>
            </tr>
          </thead>
          <tbody>
            {activeAssets.map(a => {
              const ok = auditedCodes.includes(a.code);
              return (
                <tr key={a.code} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdc}><span style={{ fontFamily: "monospace", fontSize: 12.8, fontWeight: 600 }}>{a.code}</span></td>
                  <td style={{ ...tdc, fontWeight: 600 }}>{a.name}</td>
                  <td style={{ ...tdc, color: "var(--muted)", fontSize: 13 }}>{a.loc}</td>
                  <td style={tdc}>
                    {ok ? <Badge tone="green">ตรวจนับสำเร็จ - ปี 2567</Badge> : <Badge tone="gray">ยังไม่ได้ตรวจสอบ</Badge>}
                  </td>
                  <td style={{ ...tdc, textAlign: "right" }}>
                    {!ok ? (
                      <Btn size="sm" variant="default" icon={I.qr} onClick={() => handleAudit(a.code)}>เช็คผ่านพัสดุ</Btn>
                    ) : (
                      <span style={{ color: "green", fontSize: 13, fontWeight: 600 }}>✓ ได้ตรวจสอบแล้ว</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Settings View (รวม Supabase Integration Guide)
// ─────────────────────────────────────────────────────────────
interface SettingsViewProps {
  supabaseStatus: {
    connected: boolean;
    tablesExist: Record<string, boolean>;
    isEmpty: boolean;
  };
  onTriggerSeed: () => void;
}

export function SettingsView({ supabaseStatus, onTriggerSeed }: SettingsViewProps) {
  const [tab, setTab] = useState("supabase");
  
  const tabs = [
    { id: "supabase", label: "เชื่อมต่อฐานข้อมูล Supabase" },
    { id: "cat", label: "หมวดหมู่หลักครุภัณฑ์" },
    { id: "dept", label: "แผนก/ประเภทรองรับ" },
    { id: "user", label: "คณะสิทธิ์จัดคุม" },
    { id: "loc", label: "รหัสสถานที่ในหน่วย" },
  ];

  const [copied, setCopied] = useState(false);
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_DDL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fadeIn">
      <PageHead title="ตั้งค่าระบบและฐานข้อมูล" subtitle="จัดการ Master Data ของครุภัณฑ์ และเชื่อมสิทธิ์ฐานข้อมูล Supabase แหล่งหลังคุมทรัพย์สิน" />

      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            color: tab === t.id ? "var(--primary)" : "var(--muted)", borderBottom: tab === t.id ? "2px solid var(--primary)" : "2px solid transparent", marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      <Card pad={tab !== "supabase"}>
        {tab === "supabase" && (
          <div style={{ padding: "14px 22px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              สถานะการเชื่อมต่อ Supabase
              {supabaseStatus.connected ? (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                  <span style={{ width: 8, height: 8, background: "green", borderRadius: 99, display: "inline-block" }} /> Online & Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <span style={{ width: 8, height: 8, background: "#d97706", borderRadius: 99, display: "inline-block" }} /> Local Storage (Fallback)
                </span>
              )}
            </h3>

            <p style={{ margin: "6px 0 18px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5 }}>
              รหัสโครงการ Supabase ของท่าน: <b style={{ fontFamily: "monospace", color: "var(--primary)" }}>rduvaovnnrifdgrfeumr</b><br />
              ระบบเชื่อมต่อโดยอัตโนมัติด้วย Anon Public Key ที่ท่านให้ สามารถส่งสิทธิ์เขียน/อ่านได้โดยผ่าน REST API โดยตรง
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: 14.5, fontWeight: 700 }}>ตารางในระบบ Supabase:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(supabaseStatus.tablesExist).map(([tableName, exists]) => (
                    <div key={tableName} style={{ display: "flex", justifyBetween: "space-between" as any, alignItems: "center", fontSize: 13.5, justifyContent: "space-between", padding: "8px 12px", background: "var(--hover)", borderRadius: 8 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{tableName}</span>
                      {exists ? (
                        <span style={{ color: "green", fontWeight: 600 }}>✓ พร้อมใช้งาน</span>
                      ) : (
                        <span style={{ color: "#d97706", fontWeight: 600 }}>✕ ไม่พบตาราง</span>
                      )}
                    </div>
                  ))}
                </div>

                {!Object.values(supabaseStatus.tablesExist).every(Boolean) ? (
                  <div style={{ marginTop: 14, background: "/#fffbeb", border: "1px solid #fef3c7", padding: "12px 14px", borderRadius: 10, display: "flex", gap: 10, backgroundColor: "#fffbeb" }}>
                    <Icon d={I.alert} stroke="#b45309" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 12.8, color: "#92400e", lineHeight: 1.45 }}>
                      <b>คำแนะนำ:</b> เนื่องจากท่านกำลังเซ็ตอัป Supabase เป็นครั้งแรก บางตารางอาจยังไม่ได้สร้างบน Dashboard ของท่าน โปรดคัดลอก SQL Script ทางด้านขวา ไปวางในแถบ <b>SQL Editor</b> ของ Supabase และกด Run จากนั้นกดปุ่มรีเฟรชระบบ!
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 14px", borderRadius: 10, display: "flex", gap: 10 }}>
                    <Icon d={I.check} stroke="#15803d" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 12.8, color: "#166534", lineHeight: 1.45 }}>
                      โครงสร้างตารางอ้างอิงของท่านติดตั้งอย่างถูกต้องเรียบร้อยแล้วใน Supabase!
                      {supabaseStatus.isEmpty ? (
                        <div style={{ marginTop: 10 }}>
                          <Btn variant="success" size="sm" onClick={onTriggerSeed}>นำเข้าข้อมูลจำลองลง Supabase ต้นแบบ</Btn>
                        </div>
                      ) : " ข้อมูลในระบบซิงค์อย่างเป็นทางการผ่านพอร์ต"}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>SQL DDL สร้างตาราง:</span>
                  <Btn size="sm" variant="default" onClick={handleCopySql}>
                    {copied ? "คัดลอกสำเร็จ!" : "คัดลอกรูปสัญลักษณ์"}
                  </Btn>
                </div>
                <textarea 
                  value={SUPABASE_DDL_SCRIPT} 
                  readOnly 
                  rows={11} 
                  style={{ 
                    width: "100%", 
                    fontFamily: "monospace", 
                    fontSize: 11.5, 
                    padding: 10, 
                    background: "#1e293b", 
                    color: "#f8fafc", 
                    border: "none", 
                    borderRadius: 8, 
                    resize: "none" 
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {tab === "cat" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase" }}>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>รหัสสิทธิ์บัญชีตรวจ</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>ชื่อหมวดหมู่กลุ่มผลการเสื่อม</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>อายุการเสื่อมเฉลี่ย (ปี)</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>อัตราค่าเสื่อมสะสมประจำปี</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdc}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.id}</span></td>
                  <td style={{ ...tdc, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{c.life} ปีการใช้งาน</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{c.dep}% ต่อปีบัญชีคุม</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "dept" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {DEPARTMENTS.map((d, i) => (
                <tr key={d} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                  <td style={{ ...tdc, fontWeight: 600, padding: 18 }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "user" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase" }}>
                <th style={thc}>ชื่อ - นามสกุลตำแหน่งพัสดุ</th>
                <th style={thc}>ฝ่ายและกลุ่มสังกัดย่อย</th>
                <th style={thc}>สายคุมงาน</th>
                <th style={thc}>สิทธิ์ในฐานข้อมูล (RBAC)</th>
              </tr>
            </thead>
            <tbody>
              {PEOPLE.map(p => { 
                const toneMap = { 
                  "เจ้าหน้าที่พัสดุ": "blue" as const, 
                  "หัวหน้างาน": "amber" as const, 
                  "ผู้บริหาร": "green" as const 
                };
                const tone = toneMap[p.role as 'เจ้าหน้าที่พัสดุ' | 'หัวหน้างาน' | 'ผู้บริหาร'] || "gray" as const;
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ ...tdc, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...tdc, color: "var(--muted)" }}>{p.title}</td>
                    <td style={{ ...tdc, color: "var(--muted)" }}>{p.dept}</td>
                    <td style={tdc}><Badge tone={tone}>{p.role}</Badge></td>
                  </tr>
                ); 
              })}
            </tbody>
          </table>
        )}

        {tab === "loc" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {LOCATIONS.map((l, i) => (
                <tr key={l} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                  <td style={{ ...tdc, fontWeight: 600, padding: 18 }}>{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
