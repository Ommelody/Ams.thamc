import React, { useState } from 'react';
import { Card, PageHead, Badge, Btn, Select, Input, Field, TONES, InfoRow } from './Shared';
import { SlideOver } from './FormsRegister';
import { Icon, I } from './Icons';
import { Asset, Repair, Disposal } from '../types';
import { DEPARTMENTS, LOCATIONS, STATUS_MAP, REPAIR_STATUS, DISPOSAL_METHODS, thb, thDate } from '../data';
import { openPrint } from './FormsPrint';
import { openMobile } from './MobileScan';

// MiniCard layout
interface MiniCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  key?: React.Key;
}

export function MiniCard({ children, style, onClick }: MiniCardProps) {
  return (
    <div onClick={onClick} style={{ 
      background: "var(--surface)", 
      border: "1px solid var(--border)", 
      borderRadius: 11, 
      padding: 16, 
      boxShadow: "0 1px 2px rgba(20,35,58,.04)",
      ...style 
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Repair View (รายงานชำรุดและแจ้งซ่อม)
// ─────────────────────────────────────────────────────────────
interface RepairViewProps {
  repairs: Repair[];
  assets: Asset[];
  onAddRepair: (r: Repair) => void;
}

export function RepairView({ repairs, assets, onAddRepair }: RepairViewProps) {
  const [open, setOpen] = useState(false);
  const [targetAssetCode, setTargetAssetCode] = useState(assets[0]?.code || "");
  const [problem, setProblem] = useState("");
  const [reporter, setReporter] = useState("กนกพร วงศ์ทอง");
  const [repairVendor, setRepairVendor] = useState("ศูนย์บริการคอมพิวเตอร์หลัก");

  const stages = [
    { id: "waiting" as const, label: "รอซ่อม", tone: "amber" as const },
    { id: "repairing" as const, label: "กำลังซ่อม", tone: "blue" as const },
    { id: "done" as const, label: "ซ่อมเสร็จ", tone: "green" as const },
  ];

  const handleCreateRepair = () => {
    if (!problem) {
      alert("โปรดระบุปัญหาอาการชำรุด");
      return;
    }
    const matchingAsset = assets.find(a => a.code === targetAssetCode);
    const newRep: Repair = {
      id: "RP-2567-0" + Math.floor(10 + Math.random() * 89),
      date: new Date().toISOString().split('T')[0],
      asset: matchingAsset ? matchingAsset.name : "ครุภัณฑ์ที่พบชำรุด",
      code: targetAssetCode,
      reporter,
      problem,
      status: "waiting",
      vendor: repairVendor,
    };
    onAddRepair(newRep);
    setOpen(false);
    setProblem("");
  };

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="ใบแจ้งซ่อม / ประวัติซ่อมบำรุง" 
        subtitle="บันทึกชำรุดของครุภัณฑ์ ส่งซ่อม อัปเดตติดตามสภาพพัสดุและต่ออายุใช้งานพัสดุกองกลาง"
        actions={<Btn icon={I.plus} variant="primary" onClick={() => setOpen(true)}>แจ้งซ่อมครุภัณฑ์</Btn>} 
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {stages.map(stage => {
          const items = repairs.filter(r => r.status === stage.id);
          return (
            <div key={stage.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: TONES[stage.tone].dot }} />
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{stage.label}</span>
                <span style={{ fontSize: 12.5, color: "var(--muted)", background: "var(--hover)", borderRadius: 99, padding: "1px 9px", fontWeight: 600 }}>{items.length}</span>
              </div>
              
              {items.map(r => (
                <MiniCard key={r.id} onClick={() => openPrint("repair", r)} style={{ cursor: "pointer", borderTop: `3px solid ${TONES[stage.tone].dot}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{r.id}</span>
                    <Icon d={I.printer} size={16} stroke="var(--primary)" />
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{r.asset}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--muted)", marginBottom: 9 }}>{r.code}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45, marginBottom: 10 }}>{r.problem}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.3, color: "var(--muted)", paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                    <span>{r.reporter}</span><span>{thDate(r.date)}</span>
                  </div>
                  {r.vendor !== "—" && <div style={{ fontSize: 12.3, color: "var(--muted)", marginTop: 6 }}>ผู้รับซ่อมบำรุง: {r.vendor}</div>}
                </MiniCard>
              ))}
              
              {!items.length && (
                <div style={{ padding: "34px 0", textAlign: "center", color: "var(--muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 11 }}>
                  ไม่มีรายการชำรุดในขั้นนี้
                </div>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <SlideOver title="แบบใบแจ้งซ่อมพัสดุชำรุด" subtitle="กรอกรายละเอียดสำหรับประกอบการส่งคลังซ่อม" onClose={() => setOpen(false)}
          footer={
            <>
              <Btn variant="default" onClick={() => setOpen(false)}>ยกเลิก</Btn>
              <Btn variant="primary" icon={I.check} onClick={handleCreateRepair}>ยืนยันและออกใบแจ้งซ่อม</Btn>
            </>
          }>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="เลือกครุภัณฑ์พัสดุที่ชำรุด" required>
              <Select value={targetAssetCode} onChange={e => setTargetAssetCode(e.target.value)}>
                {assets.filter(a => a.status !== 'disposed').map(a => (
                  <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
                ))}
              </Select>
            </Field>
            <Field label="ผู้รายงานเรื่องชำรุด" required>
              <Input value={reporter} onChange={e => setReporter(e.target.value)} placeholder="ชื่อสกุลผู้แจ้งชำรุด" />
            </Field>
            <Field label="ศูนย์พัสดุรับซ่อมแซม" required>
              <Input value={repairVendor} onChange={e => setRepairVendor(e.target.value)} placeholder="เช่น ออฟฟิศเซอร์วิสแอป" />
            </Field>
            <Field label="อาการชำรุด / เสียหายผิดปกติ" required>
              <textarea rows={3} value={problem} onChange={e => setProblem(e.target.value)} placeholder="ระบุอาการชำรุดอย่างละเอียด เช่น เสียบไฟไม่ติด จอกระพริบลาย..." 
                style={{ fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box", resize: "vertical" }} />
            </Field>
          </div>
        </SlideOver>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Disposal View (จำหน่ายครุภัณฑ์หมดอายุ/สูญหาย)
// ─────────────────────────────────────────────────────────────
interface DisposalViewProps {
  disposals: Disposal[];
  assets: Asset[];
  onAddDisposal: (d: Disposal) => void;
}

export function DisposalView({ disposals, assets, onAddDisposal }: DisposalViewProps) {
  const [open, setOpen] = useState(false);
  const [targetCode, setTargetCode] = useState(assets[0]?.code || "");
  const [method, setMethod] = useState("ขายทอดตลาด");
  const [reason, setReason] = useState("");
  const [committee, setCommittee] = useState("คณะกรรมการตรวจสอบพัสดุประจำปี 2567");
  const [value, setValue] = useState("");

  const handleCreateDisposal = () => {
    if (!reason) {
      alert("โปรดระบุสาเหตุข้อเท็จจริงประกอบจำหน่าย");
      return;
    }
    const matchingAsset = assets.find(a => a.code === targetCode);
    const newDisp: Disposal = {
      id: "DP-2567-0" + Math.floor(10 + Math.random() * 89),
      date: new Date().toISOString().split('T')[0],
      asset: matchingAsset ? matchingAsset.name : "ครุภัณฑ์จำหน่าย",
      code: targetCode,
      method,
      reason,
      value: parseFloat(value) || 0,
      committee,
    };
    onAddDisposal(newDisp);
    setOpen(false);
    setReason("");
  };

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="จำหน่ายพัสดุ (Disposal)" 
        subtitle="ตัดแถบสิทธิ์ครุภัณฑ์หมดอายุใช้งาน คณะกรรมการจัดพัสดุรับรองเอกสารรายงานจำหน่ายพัสดุชำรุด"
        actions={
          <>
            <Btn icon={I.download} variant="default">รายงานคุมประจำปี</Btn>
            <Btn icon={I.plus} variant="primary" onClick={() => setOpen(true)}>เสนอแทงจำหน่ายพัสดุ</Btn>
          </>
        } 
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 18 }}>
        <MiniCard>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>จำหน่ายพัสดุรวมสะสม</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{disposals.length} รายการพัสดุ</div>
        </MiniCard>
        <MiniCard>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>รายรับจำหน่ายขายทอดตลาด</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: TONES.green.fg }}>{thb(disposals.reduce((s,d)=>s+(d.value||0),0))} ฿</div>
        </MiniCard>
        <MiniCard>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>จำนวนคำร้องพิจารณารออนุมัติ</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: TONES.amber.fg }}>0 คำขอคงค้าง</div>
        </MiniCard>
      </div>

      <Card pad={false}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".03em" }}>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>เลขที่อ้างอิง</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>รายการพัสดุ</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>วิธีการจำหน่าย</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>สาเหตุผล</th>
                <th style={{ padding: "12px 18px", fontWeight: 600, textAlign: "right" }}>มูลค่าจำหน่ายคืนได้</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}>วันที่พัสดุตัดสิทธิ์</th>
                <th style={{ padding: "12px 18px", fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {disposals.map(d => (
                <tr key={d.id} onClick={() => openPrint("disposal", d)} style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "13px 18px" }}><span style={{ fontFamily: "monospace", fontSize: 12.8, fontWeight: 600 }}>{d.id}</span></td>
                  <td style={{ padding: "13px 18px", fontWeight: 600 }}>{d.asset}<div style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--muted)", fontWeight: 400 }}>{d.code}</div></td>
                  <td style={{ padding: "13px 18px" }}><Badge tone={d.method === "สูญหาย" ? "red" : "gray"}>{d.method}</Badge></td>
                  <td style={{ padding: "13px 18px", color: "var(--muted)", fontSize: 13, maxWidth: 280 }}>{d.reason}</td>
                  <td style={{ padding: "13px 18px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{d.value ? thb(d.value) : "—"}</td>
                  <td style={{ padding: "13px 18px", color: "var(--muted)" }}>{thDate(d.date)}</td>
                  <td style={{ padding: "13px 18px", textAlign: "right", color: "var(--primary)" }}><Icon d={I.printer} size={18} /></td>
                </tr>
              ))}
              {disposals.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>ไม่มีประวัติการส่งเรื่องครุภัณฑ์พัสดุจำหน่าย</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <SlideOver title="เสนอจำหน่ายครุภัณฑ์ชำรุด" subtitle="กรอกข้อมูลเพื่อส่งเรื่องของสิทธิ์ตัดครุภัณฑ์" onClose={() => setOpen(false)}
          footer={
            <>
              <Btn variant="default" onClick={() => setOpen(false)}>ยกเลิก</Btn>
              <Btn variant="primary" icon={I.check} onClick={handleCreateDisposal}>บันทึกเสนอแทงจำหน่าย</Btn>
            </>
          }>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="เลือกครุภัณฑ์พัสดุที่จะออกจำหน่าย" required>
              <Select value={targetCode} onChange={e => setTargetCode(e.target.value)}>
                {assets.filter(a => a.status !== 'disposed').map(a => (
                  <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
                ))}
              </Select>
            </Field>
            <Field label="ระบุวิธีจัดจำหน่ายชำแหละพัสดุ" required hint="กำหนดเกณฑ์สอดคล้องกับระเบียบราชการ">
              <Select value={method} onChange={e => setMethod(e.target.value)}>
                {DISPOSAL_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="สาเหตุหลักประกอบความจำเป็น" required>
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="เช่น เกินอายุกำหนด ชำรุดซ่อมลำบาก ซ่อมอุปกรณ์บอร์ดจ่ายแล้วไม่สเถียร" 
                style={{ fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box", resize: "vertical" }} />
            </Field>
            <Field label="คณะกรรมการพัสดุประจำงวดปีรับรอง" required>
              <Input value={committee} onChange={e => setCommittee(e.target.value)} />
            </Field>
            <Field label="มูลค่าขายทอดคืนได้ (บาท)">
              <Input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0.00" />
            </Field>
            {method === "สูญหาย" && (
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: TONES.red.bg, borderRadius: 10, color: TONES.red.fg, fontSize: 13, alignItems: "flex-start" }}>
                <Icon d={I.alert} size={19} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>จำหน่ายตามเกณฑ์ 'สูญหาย' จะต้องทำเรื่องสรุปสารเลขาแนบรายงานผลสอบสวนข้อความจริงแนบไฟล์ทุกครั้ง</span>
              </div>
            )}
          </div>
        </SlideOver>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Return & Transfer View (ส่งคืนและโอนย้าย)
// ─────────────────────────────────────────────────────────────
interface ReturnViewProps {
  assets: Asset[];
  onMutateAssetStatus: (assetCode: string, fields: Partial<Asset>) => void;
}

export function ReturnView({ assets, onMutateAssetStatus }: ReturnViewProps) {
  const [tab, setTab] = useState("return");
  const [retForm, setRetForm] = useState<Asset | null>(null);   
  const [contForm, setContForm] = useState<Asset | null>(null);  
  const [trForm, setTrForm] = useState<Asset | null>(null);      

  const baseHeld = assets.filter(a => a.status === "in_use" || a.status === "borrowed");
  const stock = assets.filter(a => a.status === "available");

  const tabs = [
    { id: "return", label: "พัสดุส่งคืนเข้าคลัง", icon: I.return },
    { id: "continue", label: "ขอเบิกพัสดุต่อจากคลัง (Re-assign)", icon: I.requisition },
    { id: "transfer", label: "จัดทำโอนย้ายความรับผิดชอบ", icon: I.handshake },
  ];

  const handleReturnSave = (a: Asset, condition: string, note: string) => {
    // usable status -> available. otherwise -> custom status
    const targetStatus = condition === "usable" ? "available" : "repair";
    onMutateAssetStatus(a.code, {
      status: targetStatus,
      holder: "คลังพัสดุกลาง",
      loc: "คลังพัสดุกลาง",
    });
    openPrint("return", { ...a, condition, note });
    setRetForm(null);
  };

  const handleContinueSave = (a: Asset, newHolder: string, newDept: string) => {
    onMutateAssetStatus(a.code, {
      status: "in_use",
      holder: newHolder,
      dept: newDept,
    });
    setContForm(null);
  };

  const handleTransferSave = (a: Asset, targetName: string, targetDept: string, reason: string) => {
    onMutateAssetStatus(a.code, {
      holder: targetName,
      dept: targetDept,
    });
    openPrint("transfer", { ...a, toName: targetName, toDept: targetDept, reason });
    setTrForm(null);
  };

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="ส่งคืน - เบิกต่อ - โอนย้าย" 
        subtitle="จัดคลังครุภัณฑ์หมุนเวียนพัสดุภาครัฐ หมุนเวียนผู้ครอบครองเปลี่ยนฝ่ายและแผนกผู้รับมอบ" 
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "var(--surface)", padding: 5, borderRadius: 11, border: "1px solid var(--border)", width: "fit-content", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.8, fontWeight: 600,
            background: tab === t.id ? "var(--primary)" : "transparent", color: tab === t.id ? "#fff" : "var(--muted)" }}>
            <Icon d={t.icon} size={17} stroke={tab === t.id ? "#fff" : "var(--muted)"} />{t.label}
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start", background: "var(--primary-soft)", border: "none" }}>
        <Icon d={tab === "return" ? I.return : tab === "continue" ? I.requisition : I.handshake} size={22} stroke="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13.8, color: "var(--text)", lineHeight: 1.55 }}>
          {tab === "return" && <span><b>ส่งคืนพัสดุเข้าคลัง:</b> จัดทำงานเอกสารและ 'ยืนยันส่งคืนพัสดุออนไลน์' ปรับสมดุลพัสดุเข้ากองกลางเพื่อเตรียมส่งมอบต่อตามงวดงาน</span>}
          {tab === "continue" && <span><b>ขอรับเบิกต่อ (Re-assign):</b> จัดทำเรื่องการครอบครองต่อสำหรับพัสดุสภาพดีในคลัง ยื่นประเมินสิทธิ์ส่งมอบคนถัดไป</span>}
          {tab === "transfer" && <span><b>โอนย้ายข้ามส่วนงาน:</b> จัดการย้ายพัสดุจากความดูแลของเจ้าของเดิมตรงไปยังข้าราชการ/ส่วนงานปลายทางคุมดูแลแทน</span>}
        </div>
      </Card>

      {tab === "return" && (
        <Card pad={false}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 15 }}>รายการครุภัณฑ์พัสดุที่ข้าราชการยืม/ถือครองอยู่ ({baseHeld.length})</div>
          <RowTable rows={baseHeld} action={a => <Btn size="sm" variant="default" icon={I.return} onClick={() => setRetForm(a)}>ทำใบส่งคืน</Btn>} empty="ส่งคืนครบเรียบร้อยแล้วในคลังคุม" />
        </Card>
      )}

      {tab === "continue" && (
        <Card pad={false}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
            รายการพัสดุพร้อมจัดจ่ายหมุนเวียนคลัง ({stock.length})
            <Badge tone="green" dot={false}>กองเจ้าของสิทธิ์: พัสดุกลาง</Badge>
          </div>
          <RowTable rows={stock} showOwner action={a => <Btn size="sm" variant="primary" icon={I.requisition} onClick={() => setContForm(a)}>ทำใบเบิกต่อ</Btn>} empty="ไม่มีพัสดุว่างพร้อมจัดสรรเบิกต่อในกองคลัง" />
        </Card>
      )}

      {tab === "transfer" && (
        <Card pad={false}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 15 }}>รายการครุภัณฑ์ที่ถือครองรับผิดชอบ — จัดงานโอนย้าย ({baseHeld.length})</div>
          <RowTable rows={baseHeld} action={a => <Btn size="sm" variant="default" icon={I.handshake} onClick={() => setTrForm(a)}>ทำใบโอนย้าย</Btn>} empty="ไม่มีครุภัณฑ์ถือหน่วยในสิทธิ์ผู้ถือครองขณะนี้" />
        </Card>
      )}

      {retForm && <ReturnForm asset={retForm} onClose={() => setRetForm(null)} onSubmit={handleReturnSave} />}
      {contForm && <ContinueForm asset={contForm} onClose={() => setContForm(null)} onSubmit={handleContinueSave} />}
      {trForm && <TransferForm asset={trForm} onClose={() => setTrForm(null)} onSubmit={handleTransferSave} />}
    </div>
  );
}

// Subordinate Ops Table
interface RowTableProps {
  rows: Asset[];
  action: (a: Asset) => React.ReactNode;
  showOwner?: boolean;
  empty: string;
}

function RowTable({ rows, action, showOwner, empty }: RowTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase" }}>
          <th style={{ padding: "12px 18px", fontWeight: 600 }}>รหัสสิทธิ์พัสดุ</th>
          <th style={{ padding: "12px 18px", fontWeight: 600 }}>ครุภัณฑ์พัสดุ</th>
          <th style={{ padding: "12px 18px", fontWeight: 600 }}>{showOwner ? "เจ้าของ / ที่เก็บคุม" : "ผู้ถือครองส่วนบุคคล"}</th>
          <th style={{ padding: "12px 18px", fontWeight: 600 }}>สถานภาพ</th>
          <th style={{ padding: "12px 18px", fontWeight: 600, textAlign: "right" }}>เครื่องมือกรรมสิทธิ์</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map(a => (
          <tr key={a.code} style={{ borderTop: "1px solid var(--border)" }}>
            <td style={{ padding: "13px 18px" }}><span style={{ fontFamily: "monospace", fontSize: 12.8, fontWeight: 600 }}>{a.code}</span></td>
            <td style={{ padding: "13px 18px", fontWeight: 600 }}>{a.name}</td>
            <td style={{ padding: "13px 18px", color: "var(--muted)" }}>{showOwner ? "คลังพัสดุกลาง" : (a.holder || "พัสดุกลาง")}</td>
            <td style={{ padding: "13px 18px" }}><Badge tone={(STATUS_MAP[a.status]?.tone ?? "gray")}>{STATUS_MAP[a.status]?.label ?? "พร้อมใช้"}</Badge></td>
            <td style={{ padding: "13px 18px", textAlign: "right" }}>{action(a)}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan={5} style={{ padding: "34px", textAlign: "center", color: "var(--muted)" }}>{empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Return form slide-over
interface ReturnFormProps {
  asset: Asset;
  onClose: () => void;
  onSubmit: (a: Asset, condition: string, note: string) => void;
}

function ReturnForm({ asset, onClose, onSubmit }: ReturnFormProps) {
  const [cond, setCond] = useState("usable");
  const [note, setNote] = useState("");

  const opt = (val: string, title: string, desc: string, tone: keyof typeof TONES) => (
    <button onClick={() => setCond(val)} style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", padding: "14px 16px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", width: "100%",
      border: `1.5px solid ${cond === val ? TONES[tone].dot : "var(--border)"}`, background: cond === val ? TONES[tone].bg : "var(--surface)" }}>
      <span style={{ width: 20, height: 20, borderRadius: 99, border: `2px solid ${cond === val ? TONES[tone].dot : "#c3ccd9"}`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
        {cond === val && <span style={{ width: 10, height: 10, borderRadius: 99, background: TONES[tone].dot }} />}
      </span>
      <span>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", display: "block" }}>{title}</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{desc}</span>
      </span>
    </button>
  );

  return (
    <SlideOver title="บันทึกส่งคืนเข้าคลังกลาง (ใบรับคืน)" subtitle={`${asset.name} · ${asset.code}`} onClose={onClose}
      footer={
        <>
          <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
          <Btn variant="primary" icon={I.printer} onClick={() => onSubmit(asset, cond, note)}>บันทึกพิมพ์ใบส่งคืน</Btn>
        </>
      }>
      <div style={{ display: "grid", gap: 14 }}>
        <Card style={{ background: "var(--hover)", border: "none" }}>
          <InfoRow label="ผู้ครอบครองส่งกลับ">{asset.holder}</InfoRow>
          <InfoRow label="แผนกเดิมสังกัด">{asset.dept}</InfoRow>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "10px 0" }}>
            <span style={{ fontSize: 13.5, color: "var(--muted)" }}>การได้ความเดิม</span><span style={{ fontSize: 14, fontWeight: 500 }}>{asset.method}</span>
          </div>
        </Card>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>สภาพคุณสมบัติความสมบูรณ์ ณ วันที่คืน <span style={{ color: "#e23b3b" }}>*</span></div>
          <div style={{ display: "grid", gap: 10 }}>
            {opt("usable", "สภาพสมบูรณ์ (พร้อมหมุนเวียนเบิกต่อ)", "พร้อมนำเข้าสู่สารระบบกองกลาง เพื่อ assign ข้าราชการท่านถัดไป", "green")}
            {opt("unusable", "สภาพชำรุดเสียหาย (ต้องการซ่อมบำรุง/แทงจำหน่าย)", "ย้ายพัสดุออกเพื่อคิวเช็คช่างหรือพิจารณาจำหน่ายตามความเหมาะสม", "orange")}
          </div>
        </div>
        <Field label="รายละเอียดเพิ่มเติมการรับพัสดุ">
          <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น เครื่องสภาพสมบูรณ์ดีมาก มีรอยขนแมวขอบจอภายนอกเพียงเล็กน้อย..." 
            style={{ fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box", resize: "vertical" }} />
        </Field>
      </div>
    </SlideOver>
  );
}

// Re-assign handover form
interface ContinueFormProps {
  asset: Asset;
  onClose: () => void;
  onSubmit: (a: Asset, holder: string, dept: string) => void;
}

function ContinueForm({ asset, onClose, onSubmit }: ContinueFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientDept, setRecipientDept] = useState(DEPARTMENTS[0]);

  const handleSave = () => {
    if (!recipientName) {
      alert("โปรดระบุผู้รับเบิกครอบครองครุภัณฑ์คนใหม่");
      return;
    }
    onSubmit(asset, recipientName, recipientDept);
  };

  return (
    <SlideOver title="เบิกจ่ายครุภัณฑ์กองหมุนเวียนคลัง" subtitle={`${asset.name} · ${asset.code}`} onClose={onClose}
      footer={
        <>
          <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
          <Btn variant="primary" icon={I.check} onClick={handleSave}>มอบสิทธิ์และย้ายการครอบครอง</Btn>
        </>
      }>
      <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: TONES.green.bg, borderRadius: 10, color: TONES.green.fg, fontSize: 13, marginBottom: 16, alignItems: "flex-start" }}>
        <Icon d={I.check} size={19} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>ครุภัณฑ์ในกรรมสิทธิ์กองพัสดุคลังกลาง สภาพพร้อมจัดสรร 'สมบูรณ์ดี' — สามารถมอบกรรมสิทธิ์ต่อข้าราชการทันที</span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="ระบุชื่อผู้เบิกคนใหม่" required>
          <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="ชื่อ นามสกุล ข้าราชการยื่นรับพัสดุ" />
        </Field>
        <Field label="แผนก/สังกัดผู้รับคนใหม่" required>
          <Select value={recipientDept} onChange={e => setRecipientDept(e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
      </div>
    </SlideOver>
  );
}

// Direct Transfer form slide-over
interface TransferFormProps {
  asset: Asset;
  onClose: () => void;
  onSubmit: (a: Asset, targetName: string, targetDept: string, reason: string) => void;
}

function TransferForm({ asset, onClose, onSubmit }: TransferFormProps) {
  const [toName, setToName] = useState("");
  const [toDept, setToDept] = useState(DEPARTMENTS[0]);
  const [reason, setReason] = useState("");
  const [isAppr, setIsAppr] = useState(false);

  const handleSave = () => {
    if (!toName) {
      alert("โปรดกรอกผู้รับโอนย้ายปลายทาง");
      return;
    }
    onSubmit(asset, toName, toDept, reason);
  };

  return (
    <SlideOver title="โอนย้ายกรรมสิทธิ์ตรงระหว่างกองงาน" subtitle={`${asset.name} · ${asset.code}`} onClose={onClose}
      footer={
        <>
          <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
          <Btn variant="primary" icon={I.printer} onClick={handleSave} style={{ opacity: isAppr ? 1 : .5, pointerEvents: isAppr ? "auto" : "none" }}>บันทึกและพิมพ์ใบโอนย้าย</Btn>
        </>
      }>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="ผู้โอนกรรมสิทธิ์เดิม">
          <Input value={asset.holder || "พัสดุกลาง"} readOnly style={{ background: "var(--hover)" }} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="ผู้รับโอนพัสดุข้ามกองใหม่" required>
            <Input value={toName} onChange={e => setToName(e.target.value)} placeholder="ชื่อและตำแหน่งข้าราชการปลายทาง" />
          </Field>
          <Field label="แผนกกองงานผู้รับกรรมสิทธิ์ใหม่" required>
            <Select value={toDept} onChange={e => setToDept(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="เหตุผลขอโยกย้ายความรับผิดชอบระบุ" required>
          <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="ระบุเช่น เพื่อใช้งานสนับสนุนความจำเป็นกองสาธารณสุขงบสนับสนุนหลัก..." 
            style={{ fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box", resize: "vertical" }} />
        </Field>

        <div style={{ padding: "14px 16px", borderRadius: 11, border: `1.5px solid ${isAppr ? TONES.green.dot : TONES.amber.dot}`, background: isAppr ? TONES.green.bg : TONES.amber.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isAppr ? 0 : 10 }}>
            <Icon d={isAppr ? I.check : I.alert} size={20} stroke={isAppr ? TONES.green.fg : TONES.amber.fg} />
            <span style={{ fontSize: 13.8, fontWeight: 700, color: isAppr ? TONES.green.fg : TONES.amber.fg }}>
              {isAppr ? "การอนุมัติผู้จัดการฝ่ายพัสดุสำเร็จ (Approved)" : "ต้องผ่านลายเซ็นและคำอนุมัติสิทธิ์จากผู้จัดการพัสดุกองกลางก่อนพิมพ์"}
            </span>
          </div>
          {!isAppr && (
            <Btn size="sm" variant="primary" icon={I.check} onClick={() => setIsAppr(true)}>จำลองอนุมัติเรื่องโอนย้าย (ผู้บริหาร)</Btn>
          )}
        </div>
      </div>
    </SlideOver>
  );
}
