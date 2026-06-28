import React, { useState } from 'react';
import { Card, PageHead, Badge, Btn, Select } from './Shared';
import { Icon, I } from './Icons';
import { Asset } from '../types';
import { CATEGORIES, DEPARTMENTS, LOCATIONS, PEOPLE, REPORTS_STRUCTURE, SUPABASE_DDL_SCRIPT, exportToExcel, updateCategories, updateDepartments, updateLocations, updatePeople } from '../data';
import { openMobile } from './MobileScan';

const thc: React.CSSProperties = { padding: "12px 18px", fontWeight: 600, whiteSpace: "nowrap" };
const tdc: React.CSSProperties = { padding: "13px 18px", verticalAlign: "middle" };

// ─────────────────────────────────────────────────────────────
// 1. Reports View
// ─────────────────────────────────────────────────────────────
interface ReportsViewProps {
  assets: Asset[];
  requisitions?: any[];
  disposals?: any[];
}

export function ReportsView({ assets = [], requisitions = [], disposals = [] }: ReportsViewProps) {
  const handleDownloadExcel = (name: string) => {
    let rows: any[] = [];
    let filename = `${name.replace(/\s+/g, '_')}.csv`;
    let headers: Record<string, string> = {};

    if (name === "ทะเบียนคุมทรัพย์สิน (แบบกรมบัญชีกลาง)") {
      rows = assets;
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        dept: "ฝ่าย/แผนก",
        loc: "สถานที่ตั้ง",
        acquired: "วันที่ได้มา",
        price: "ราคาทุน",
        status: "สถานะ",
        method: "วิธีการได้มา"
      };
    } else if (name === "สรุปจำนวน-มูลค่าครุภัณฑ์") {
      const groupedMap: Record<string, { cat: string, count: number, total: number }> = {};
      assets.forEach(a => {
        if (!groupedMap[a.cat]) {
          const cName = CATEGORIES.find(c => c.id === a.cat)?.name || a.cat;
          groupedMap[a.cat] = { cat: cName, count: 0, total: 0 };
        }
        groupedMap[a.cat].count += 1;
        groupedMap[a.cat].total += Number(a.price || 0);
      });
      rows = Object.values(groupedMap);
      headers = {
        cat: "หมวดหมู่ครุภัณฑ์",
        count: "จำนวนรายการ",
        total: "มูลค่ารวม (บาท)"
      };
    } else if (name === "รายงานการคำนวณค่าเสื่อมราคาประจำปี") {
      rows = assets.map(a => {
        const c = CATEGORIES.find(x => x.id === a.cat);
        const rate = c ? c.dep / 100 : 0.2;
        const annual = a.price * rate;
        const diffTime = Math.abs(new Date().getTime() - new Date(a.acquired).getTime());
        const years = Math.min(c ? c.life : 5, diffTime / (365.25 * 24 * 60 * 60 * 1000));
        const accumulated = Math.min(annual * years, a.price - 1);
        const book = Math.max(1, a.price - accumulated);
        return {
          ...a,
          ratePercent: `${(rate * 100).toFixed(1)}%`,
          annualDep: annual.toFixed(2),
          accumulatedDep: accumulated.toFixed(2),
          bookValue: book.toFixed(2)
        };
      });
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        price: "ราคาทุน",
        ratePercent: "อัตราค่าเสื่อม",
        annualDep: "ค่าเสื่อมปีนี้",
        accumulatedDep: "ค่าเสื่อมสะสม",
        bookValue: "มูลค่าสุทธิคงเหลือ"
      };
    } else if (name === "สรุปการเบิกจ่ายประจำเดือน/ปี") {
      rows = requisitions.length ? requisitions : [
        { id: "REQ-2567-0041", date: "2024-06-02", requester: "อรุณี แสงทอง", dept: "ฝ่ายบริการการแพทย์", item: "โทรทัศน์ LED 55 นิ้ว", type: "เบิกขาด", status: "อนุมัติแล้ว" },
        { id: "REQ-2567-0040", date: "2024-05-29", requester: "กนกพร วงศ์ทอง", dept: "ฝ่ายการพยาบาล", item: "เก้าอี้สำนักงานบุนวม", type: "เบิกขาด", status: "จ่ายพัสดุแล้ว" }
      ];
      headers = {
        id: "เลขที่ใบเบิก",
        date: "วันที่เบิก",
        requester: "ผู้ขอเบิก",
        dept: "ฝ่าย/สังกัด",
        item: "รายการพัสดุ",
        type: "ประเภทเบิก",
        status: "สถานะใบเบิก"
      };
    } else if (name === "ทะเบียนผู้ยืม-ครอบครองครุภัณฑ์") {
      rows = assets.filter(a => a.holder && a.holder !== "—");
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        holder: "ผู้ยืม/ถือครอง",
        dept: "ฝ่าย/สังกัด",
        loc: "สถานที่ตั้งวาง"
      };
    } else if (name === "ประวัติการเคลื่อนไหวครุภัณฑ์") {
      rows = assets.map(a => ({
        code: a.code,
        name: a.name,
        action: "ขึ้นทะเบียนคุมพัสดุรับมอบ",
        date: a.acquired,
        holder: a.holder || "กองกลาง"
      }));
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        action: "ความเคลื่อนไหว",
        date: "วันที่ทำรายการ",
        holder: "ผู้บันทึก/ผู้ครอบครอง"
      };
    } else if (name === "ครุภัณฑ์คงเหลือในคลัง") {
      rows = assets.filter(a => a.status === "available");
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        loc: "สถานที่จัดเก็บกลาง",
        price: "มูลค่าประเมิน"
      };
    } else if (name === "สรุปการจำหน่ายพัสดุประจำปี") {
      rows = assets.filter(a => a.status === "disposed");
      headers = {
        code: "รหัสครุภัณฑ์",
        name: "ชื่อครุภัณฑ์",
        dept: "แผนกที่ส่งจำหน่าย",
        price: "มูลค่าที่ซื้อมา"
      };
    } else if (name === "เงินรายได้จากการจำหน่ายพัสดุ") {
      rows = disposals.length ? disposals : [
        { id: "DISP-01", date: "2024-03-14", asset: "ตู้เย็น 2 ประตู 7 คิว", code: "7430-006-0002/62", method: "ขายทอดตลาด", value: 9800, reason: "ชำรุดหมดอายุการใช้งาน" }
      ];
      headers = {
        id: "เลขที่เอกสาร",
        date: "วันที่ทำรายการ",
        asset: "ชื่อครุภัณฑ์",
        code: "รหัสพัสดุ",
        method: "วิธีการแทงจำหน่าย",
        value: "จำนวนเงินที่ได้รับคืน (บาท)",
        reason: "เหตุผลที่จำหน่าย"
      };
    } else {
      rows = assets;
      headers = { code: "รหัสครุภัณฑ์", name: "ชื่อครุภัณฑ์" };
    }

    exportToExcel(rows, filename, headers);
  };

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
                    <Btn size="sm" variant="default" icon={I.printer} onClick={() => window.print()}>ดาวน์โหลด PDF</Btn>
                    <Btn size="sm" variant="default" icon={I.download} onClick={() => handleDownloadExcel(it.name)}>พิมพ์ Excel</Btn>
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
            <Btn icon={I.download} variant="default" onClick={() => {
              const checkedAssets = activeAssets.map(a => ({
                ...a,
                isAudited: auditedCodes.includes(a.code) ? "ตรวจนับสำเร็จ" : "ยังไม่ได้ตรวจสอบ"
              }));
              exportToExcel(checkedAssets, "Audit_Status_Report_2567.csv", {
                code: "รหัสครุภัณฑ์",
                name: "ชื่อพัสดุครุภัณฑ์",
                dept: "ฝ่าย/แผนก",
                loc: "สถานที่ตั้ง",
                isAudited: "สถานะการตรวจนับปี 2567"
              });
            }}>พิมพ์ผลสรุปตรวจสอบ</Btn>
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
  onMasterDataChange: () => void;
}

export function SettingsView({ supabaseStatus, onTriggerSeed, onMasterDataChange }: SettingsViewProps) {
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

  // Local state for interactive editing
  const [categories, setCategories] = useState([...CATEGORIES]);
  const [departments, setDepartments] = useState([...DEPARTMENTS]);
  const [people, setPeople] = useState([...PEOPLE]);
  const [locations, setLocations] = useState([...LOCATIONS]);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Edit buffer values
  const [editCatName, setEditCatName] = useState("");
  const [editCatLife, setEditCatLife] = useState(5);
  const [editCatDep, setEditCatDep] = useState(20);

  const [editDeptName, setEditDeptName] = useState("");

  const [editPersonName, setEditPersonName] = useState("");
  const [editPersonRole, setEditPersonRole] = useState("");
  const [editPersonDept, setEditPersonDept] = useState("");
  const [editPersonTitle, setEditPersonTitle] = useState("");

  const [editLocName, setEditLocName] = useState("");

  // Add states
  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatLife, setNewCatLife] = useState(5);
  const [newCatDep, setNewCatDep] = useState(20);

  const [newDeptName, setNewDeptName] = useState("");

  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("ผู้ใช้งาน");
  const [newPersonDept, setNewPersonDept] = useState("");
  const [newPersonTitle, setNewPersonTitle] = useState("");

  const [newLocName, setNewLocName] = useState("");

  // -- Category Handlers --
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;
    if (categories.some(c => c.id === newCatId)) {
      alert("มีรหัสหมวดหมู่นี้อยู่แล้วในระบบ");
      return;
    }
    const next = [...categories, { id: newCatId, name: newCatName, life: Number(newCatLife), dep: Number(newCatDep) }];
    setCategories(next);
    updateCategories(next);
    setNewCatId("");
    setNewCatName("");
    setNewCatLife(5);
    setNewCatDep(20);
    onMasterDataChange();
  };

  const handleStartEditCat = (c: any) => {
    setEditingId(c.id);
    setEditCatName(c.name);
    setEditCatLife(c.life);
    setEditCatDep(c.dep);
  };

  const handleSaveCat = (id: string) => {
    const next = categories.map(c => c.id === id ? { ...c, name: editCatName, life: Number(editCatLife), dep: Number(editCatDep) } : c);
    setCategories(next);
    updateCategories(next);
    setEditingId(null);
    onMasterDataChange();
  };

  const handleDeleteCat = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?")) return;
    const next = categories.filter(c => c.id !== id);
    setCategories(next);
    updateCategories(next);
    onMasterDataChange();
  };

  // -- Department Handlers --
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    if (departments.includes(newDeptName)) {
      alert("มีแผนกนี้อยู่แล้วในระบบ");
      return;
    }
    const next = [...departments, newDeptName];
    setDepartments(next);
    updateDepartments(next);
    setNewDeptName("");
    onMasterDataChange();
  };

  const handleStartEditDept = (index: number, val: string) => {
    setEditingIndex(index);
    setEditDeptName(val);
  };

  const handleSaveDept = (index: number) => {
    const next = [...departments];
    next[index] = editDeptName;
    setDepartments(next);
    updateDepartments(next);
    setEditingIndex(null);
    onMasterDataChange();
  };

  const handleDeleteDept = (index: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบแผนกนี้?")) return;
    const next = departments.filter((_, idx) => idx !== index);
    setDepartments(next);
    updateDepartments(next);
    onMasterDataChange();
  };

  // -- People Handlers --
  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName) return;
    const pId = "U" + String(people.length + 1).padStart(2, '0');
    const next = [...people, { id: pId, name: newPersonName, role: newPersonRole, dept: newPersonDept, title: newPersonTitle }];
    setPeople(next);
    updatePeople(next);
    setNewPersonName("");
    setNewPersonRole("ผู้ใช้งาน");
    setNewPersonDept("");
    setNewPersonTitle("");
    onMasterDataChange();
  };

  const handleStartEditPerson = (p: any) => {
    setEditingId(p.id);
    setEditPersonName(p.name);
    setEditPersonRole(p.role);
    setEditPersonDept(p.dept);
    setEditPersonTitle(p.title);
  };

  const handleSavePerson = (id: string) => {
    const next = people.map(p => p.id === id ? { ...p, name: editPersonName, role: editPersonRole, dept: editPersonDept, title: editPersonTitle } : p);
    setPeople(next);
    updatePeople(next);
    setEditingId(null);
    onMasterDataChange();
  };

  const handleDeletePerson = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return;
    const next = people.filter(p => p.id !== id);
    setPeople(next);
    updatePeople(next);
    onMasterDataChange();
  };

  // -- Location Handlers --
  const handleAddLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName) return;
    if (locations.includes(newLocName)) {
      alert("มีสถานที่ตั้งนี้อยู่แล้วในระบบ");
      return;
    }
    const next = [...locations, newLocName];
    setLocations(next);
    updateLocations(next);
    setNewLocName("");
    onMasterDataChange();
  };

  const handleStartEditLoc = (index: number, val: string) => {
    setEditingIndex(index);
    setEditLocName(val);
  };

  const handleSaveLoc = (index: number) => {
    const next = [...locations];
    next[index] = editLocName;
    setLocations(next);
    updateLocations(next);
    setEditingIndex(null);
    onMasterDataChange();
  };

  const handleDeleteLoc = (index: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสถานที่นี้?")) return;
    const next = locations.filter((_, idx) => idx !== index);
    setLocations(next);
    updateLocations(next);
    onMasterDataChange();
  };

  return (
    <div className="animate-fadeIn">
      <PageHead title="ตั้งค่าระบบและฐานข้อมูล" subtitle="จัดการ Master Data ของครุภัณฑ์ และเชื่อมสิทธิ์ฐานข้อมูล Supabase แหล่งหลังคุมทรัพย์สิน" />

      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setEditingId(null); setEditingIndex(null); }} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
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
                  <div style={{ marginTop: 14, background: "#fffbeb", border: "1px solid #fef3c7", padding: "12px 14px", borderRadius: 10, display: "flex", gap: 10, backgroundColor: "#fffbeb" }}>
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
                    {copied ? "คัดลอกสำเร็จ!" : "คัดลอกสคริปต์ SQL"}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", padding: "12px 14px", background: "var(--hover)", borderRadius: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 80, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>รหัสหมวดหมู่</span>
                <input type="text" placeholder="เช่น C07" required value={newCatId} onChange={e => setNewCatId(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180, flex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>ชื่อหมวดหมู่กลุ่มครุภัณฑ์</span>
                <input type="text" placeholder="ชื่อหมวดหมู่..." required value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 90, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>อายุการเสื่อม (ปี)</span>
                <input type="number" min={1} required value={newCatLife} onChange={e => setNewCatLife(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 90, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>อัตราค่าเสื่อม (%/ปี)</span>
                <input type="number" step="0.1" required value={newCatDep} onChange={e => setNewCatDep(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <Btn type="submit" variant="primary" size="sm" icon={I.plus}>เพิ่มหมวดหมู่</Btn>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5 }}>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>รหัสหมวดหมู่</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>ชื่อหมวดหมู่กลุ่มพัสดุ</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>อายุการเสื่อมเฉลี่ย</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>อัตราค่าเสื่อมสะสม</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600, width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => {
                  const isEditing = editingId === c.id;
                  return (
                    <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={tdc}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.id}</span></td>
                      <td style={tdc}>
                        {isEditing ? (
                          <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, width: "100%", background: "var(--surface)", color: "var(--text)" }} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        )}
                      </td>
                      <td style={tdc}>
                        {isEditing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input type="number" value={editCatLife} onChange={e => setEditCatLife(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, width: 70, background: "var(--surface)", color: "var(--text)" }} /> ปี
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>{c.life} ปีการใช้งาน</span>
                        )}
                      </td>
                      <td style={tdc}>
                        {isEditing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input type="number" step="0.1" value={editCatDep} onChange={e => setEditCatDep(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, width: 80, background: "var(--surface)", color: "var(--text)" }} /> %
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>{c.dep}% ต่อปีบัญชีคุม</span>
                        )}
                      </td>
                      <td style={tdc}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <Btn size="sm" variant="success" onClick={() => handleSaveCat(c.id)}>บันทึก</Btn>
                              <Btn size="sm" variant="default" onClick={() => setEditingId(null)}>ยกเลิก</Btn>
                            </>
                          ) : (
                            <>
                              <Btn size="sm" variant="default" onClick={() => handleStartEditCat(c)}>แก้ไข</Btn>
                              <Btn size="sm" variant="default" onClick={() => handleDeleteCat(c.id)} style={{ color: "#ef4444" }}>ลบ</Btn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "dept" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <form onSubmit={handleAddDept} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "var(--hover)", borderRadius: 10 }}>
              <input type="text" placeholder="ชื่อแผนก/สังกัดฝ่ายแพทย์ใหม่..." required value={newDeptName} onChange={e => setNewDeptName(e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              <Btn type="submit" variant="primary" size="sm" icon={I.plus}>เพิ่มฝ่าย/แผนก</Btn>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5 }}>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>รายชื่อหน่วยงาน/ฝ่ายงานสนับสนุน</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600, width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, i) => {
                  const isEditing = editingIndex === i;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ ...tdc, padding: 18 }}>
                        {isEditing ? (
                          <input type="text" value={editDeptName} onChange={e => setEditDeptName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, width: "100%", background: "var(--surface)", color: "var(--text)" }} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{d}</span>
                        )}
                      </td>
                      <td style={tdc}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <Btn size="sm" variant="success" onClick={() => handleSaveDept(i)}>บันทึก</Btn>
                              <Btn size="sm" variant="default" onClick={() => setEditingIndex(null)}>ยกเลิก</Btn>
                            </>
                          ) : (
                            <>
                              <Btn size="sm" variant="default" onClick={() => handleStartEditDept(i, d)}>แก้ไข</Btn>
                              <Btn size="sm" variant="default" onClick={() => handleDeleteDept(i)} style={{ color: "#ef4444" }}>ลบ</Btn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "user" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <form onSubmit={handleAddPerson} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", padding: "12px 14px", background: "var(--hover)", borderRadius: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160, flex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>ชื่อ - นามสกุล</span>
                <input type="text" placeholder="ชื่อ นามสกุล..." required value={newPersonName} onChange={e => setNewPersonName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140, flex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>ตำแหน่งงาน</span>
                <input type="text" placeholder="เช่น นักวิชาการพัสดุ..." required value={newPersonTitle} onChange={e => setNewPersonTitle(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140, flex: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>ฝ่ายสังกัดย่อย</span>
                <input type="text" placeholder="เช่น ศูนย์สารสนเทศฯ" required value={newPersonDept} onChange={e => setNewPersonDept(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>ระดับสิทธิ์ระบบ</span>
                <select value={newPersonRole} onChange={e => setNewPersonRole(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)", outline: "none" }}>
                  <option value="เจ้าหน้าที่พัสดุ">เจ้าหน้าที่พัสดุ</option>
                  <option value="หัวหน้างาน">หัวหน้างาน</option>
                  <option value="ผู้ใช้งาน">ผู้ใช้งาน</option>
                  <option value="ผู้บริหาร">ผู้บริหาร</option>
                </select>
              </div>
              <Btn type="submit" variant="primary" size="sm" icon={I.plus}>เพิ่มบุคลากร</Btn>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5 }}>
                  <th style={thc}>ชื่อ - นามสกุลตำแหน่งพัสดุ</th>
                  <th style={thc}>สายคุมงานตำแหน่ง</th>
                  <th style={thc}>ฝ่ายและกลุ่มสังกัดย่อย</th>
                  <th style={thc}>สิทธิ์ในฐานข้อมูล (RBAC)</th>
                  <th style={{ ...thc, width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {people.map(p => { 
                  const toneMap = { 
                    "เจ้าหน้าที่พัสดุ": "blue" as const, 
                    "หัวหน้างาน": "amber" as const, 
                    "ผู้บริหาร": "green" as const 
                  };
                  const tone = toneMap[p.role as 'เจ้าหน้าที่พัสดุ' | 'หัวหน้างาน' | 'ผู้บริหาร'] || "gray" as const;
                  const isEditing = editingId === p.id;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ ...tdc, fontWeight: 600 }}>
                        {isEditing ? (
                          <input type="text" value={editPersonName} onChange={e => setEditPersonName(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
                        ) : p.name}
                      </td>
                      <td style={{ ...tdc, color: "var(--muted)" }}>
                        {isEditing ? (
                          <input type="text" value={editPersonTitle} onChange={e => setEditPersonTitle(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
                        ) : p.title}
                      </td>
                      <td style={{ ...tdc, color: "var(--muted)" }}>
                        {isEditing ? (
                          <input type="text" value={editPersonDept} onChange={e => setEditPersonDept(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
                        ) : p.dept}
                      </td>
                      <td style={tdc}>
                        {isEditing ? (
                          <select value={editPersonRole} onChange={e => setEditPersonRole(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }}>
                            <option value="เจ้าหน้าที่พัสดุ">เจ้าหน้าที่พัสดุ</option>
                            <option value="หัวหน้างาน">หัวหน้างาน</option>
                            <option value="ผู้ใช้งาน">ผู้ใช้งาน</option>
                            <option value="ผู้บริหาร">ผู้บริหาร</option>
                          </select>
                        ) : (
                          <Badge tone={tone}>{p.role}</Badge>
                        )}
                      </td>
                      <td style={tdc}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <Btn size="sm" variant="success" onClick={() => handleSavePerson(p.id)}>บันทึก</Btn>
                              <Btn size="sm" variant="default" onClick={() => setEditingId(null)}>ยกเลิก</Btn>
                            </>
                          ) : (
                            <>
                              <Btn size="sm" variant="default" onClick={() => handleStartEditPerson(p)}>แก้ไข</Btn>
                              <Btn size="sm" variant="default" onClick={() => handleDeletePerson(p.id)} style={{ color: "#ef4444" }}>ลบ</Btn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ); 
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "loc" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <form onSubmit={handleAddLoc} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "var(--hover)", borderRadius: 10 }}>
              <input type="text" placeholder="ชื่อจุดติดตั้ง/ตำแหน่งพิกัดครุภัณฑ์ใหม่..." required value={newLocName} onChange={e => setNewLocName(e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--border)", fontSize: 13.5, background: "var(--surface)", color: "var(--text)" }} />
              <Btn type="submit" variant="primary" size="sm" icon={I.plus}>เพิ่มพิกัดตำแหน่ง</Btn>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5 }}>
                  <th style={{ padding: "12px 18px", fontWeight: 600 }}>จุดติดตั้ง/พิกัดห้องพัสดุที่จดทะเบียน</th>
                  <th style={{ padding: "12px 18px", fontWeight: 600, width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((l, i) => {
                  const isEditing = editingIndex === i;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ ...tdc, padding: 18 }}>
                        {isEditing ? (
                          <input type="text" value={editLocName} onChange={e => setEditLocName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--primary)", fontSize: 13.5, width: "100%", background: "var(--surface)", color: "var(--text)" }} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{l}</span>
                        )}
                      </td>
                      <td style={tdc}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <Btn size="sm" variant="success" onClick={() => handleSaveLoc(i)}>บันทึก</Btn>
                              <Btn size="sm" variant="default" onClick={() => setEditingIndex(null)}>ยกเลิก</Btn>
                            </>
                          ) : (
                            <>
                              <Btn size="sm" variant="default" onClick={() => handleStartEditLoc(i, l)}>แก้ไข</Btn>
                              <Btn size="sm" variant="default" onClick={() => handleDeleteLoc(i)} style={{ color: "#ef4444" }}>ลบ</Btn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
