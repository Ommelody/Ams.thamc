import React, { useState } from 'react';
import { Card, PageHead, Btn, Badge, Select, Input, Field, TONES, InfoRow } from './Shared';
import { SlideOver } from './FormsRegister';
import { Icon, I } from './Icons';
import { Requisition, Asset } from '../types';
import { DEPARTMENTS, REQ_STATUS, thDate } from '../data';
import { openPrint } from './FormsPrint';

interface StepperProps {
  steps: Array<{ label: string; by: string }>;
  current: number;
  rejected?: boolean;
}

export function Stepper({ steps, current, rejected }: StepperProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", padding: "10px 0" }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const isRej = rejected && i === current;
        const tone = isRej ? "red" : done ? "green" : active ? "blue" : "gray";
        const dotBg = done 
          ? TONES.green.dot 
          : active 
            ? (isRej ? TONES.red.dot : "var(--primary)") 
            : "var(--hover)";

        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto", width: 110, textAlign: "center" }}>
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 99, 
                display: "grid", 
                placeItems: "center", 
                flexShrink: 0,
                background: dotBg,
                color: (done || active) ? "#fff" : "var(--muted)", 
                fontWeight: 700, 
                fontSize: 15,
                boxShadow: active ? `0 0 0 4px ${isRej ? TONES.red.bg : "var(--primary-soft)"}` : "none" 
              }}>
                {done ? <Icon d={I.check} size={19} stroke="#fff" /> : isRej ? <Icon d={I.close} size={18} stroke="#fff" /> : i + 1}
              </div>
              <div style={{ fontSize: 12.8, marginTop: 8, fontWeight: active ? 700 : 500, color: active ? "var(--text)" : "var(--muted)", lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{s.by}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, background: i < current ? TONES.green.dot : "var(--border)", marginTop: 18, borderRadius: 2, minWidth: 20 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function reqStage(status: string) {
  return { pending: 1, approved: 2, disbursed: 3, rejected: 1 }[status] ?? 0;
}

interface RequisitionDetailProps {
  req: Requisition;
  role: string;
  onClose: () => void;
  onStatusChange: (reqId: string, newStatus: Requisition['status']) => void;
}

export function RequisitionDetail({ req, role, onClose, onStatusChange }: RequisitionDetailProps) {
  const steps = [
    { label: "ยื่นคำขอ", by: req.requester.split(" ")[0] },
    { label: "หัวหน้าอนุมัติ", by: req.approver.split(" ")[0] },
    { label: "พัสดุจัดจ่าย", by: "คลังพัสดุ" },
    { label: "ผู้รับส่งมอบ", by: req.requester.split(" ")[0] },
  ];
  
  const isApprover = role === "approver" && req.status === "pending";
  const isStaff = role === "staff" && req.status === "approved";

  return (
    <SlideOver title={req.item} subtitle={`${req.id} · ${req.type}`} onClose={onClose} width={620}
      footer={
        isApprover ? (
          <>
            <Btn variant="danger" icon={I.close} onClick={() => { onStatusChange(req.id, 'rejected'); onClose(); }}>ไม่อนุมัติ</Btn>
            <Btn variant="success" icon={I.check} onClick={() => { onStatusChange(req.id, 'approved'); onClose(); }}>อนุมัติคำขอเบิก</Btn>
          </>
        ) : isStaff ? (
          <>
            <Btn variant="default" icon={I.printer} onClick={() => openPrint("disbursement", req)}>พิมพ์ใบสั่งจ่าย</Btn>
            <Btn variant="primary" icon={I.check} onClick={() => { onStatusChange(req.id, 'disbursed'); onClose(); }}>ส่งมอบและตัดสต็อก</Btn>
          </>
        ) : (
          <>
            <Btn variant="default" icon={I.printer} onClick={() => openPrint("requisition", req)}>พิมพ์ใบเบิกพัสดุ</Btn>
            <Btn variant="default" onClick={onClose}>ปิด</Btn>
          </>
        )
      }>
      <div style={{ marginBottom: 26 }}>
        <Stepper steps={steps} current={reqStage(req.status)} rejected={req.status === "rejected"} />
      </div>

      {req.status === "rejected" && (
        <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: TONES.red.bg, borderRadius: 10, marginBottom: 18, color: TONES.red.fg }}>
          <Icon d={I.alert} size={20} /><span style={{ fontSize: 13.5 }}>ปฏิเสธการพิจารณาอนุมัติครุภัณฑ์: สต็อกครุภัณฑ์ว่างในคลังไม่เพียงพอ ให้รอจัดสรรพัสดุรอบงวดงบประมาณถัดไป</span>
        </div>
      )}

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>รายละเอียดประกอบคำร้อง</h3>
        <InfoRow label="ผู้ยื่นขอเบิก">{req.requester}</InfoRow>
        <InfoRow label="แผนก/ฝ่ายสังกัด">{req.dept}</InfoRow>
        <InfoRow label="ประเภทใบเบิก">{req.type === "ยืมใช้งาน" ? <Badge tone="amber">ประเภท: ยืมใช้งาน</Badge> : <Badge tone="blue">ประเภท: เบิกขาด</Badge>}</InfoRow>
        <InfoRow label="วันที่จัดทำ">{thDate(req.date)}</InfoRow>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "10px 0" }}>
          <span style={{ fontSize: 13.5, color: "var(--muted)" }}>เหตุผลความจำเป็น</span>
          <span style={{ fontSize: 14, color: "var(--text)" }}>{req.purpose}</span>
        </div>
      </Card>

      {isApprover && (
        <div style={{ padding: "14px 16px", background: "var(--primary-soft)", borderRadius: 10, fontSize: 13.5, color: "var(--text)", display: "flex", gap: 10 }}>
          <Icon d={I.user} size={20} stroke="var(--primary)" />
          <span>ท่านกำลังพิจารณาในบทบาท <b>ผู้อำนวยการส่วน (Approver)</b> — โปรดอนุมัติหากเห็นว่าสอดคล้องกับพัสดุในงบประมาณประจำกอง</span>
        </div>
      )}
    </SlideOver>
  );
}

interface RequisitionViewProps {
  role: string;
  requisitions: Requisition[];
  assets: Asset[];
  openForm: () => void;
  onStatusChange: (reqId: string, newStatus: Requisition['status']) => void;
  onBatchDisburse: (data: any) => void;
}

const thc: React.CSSProperties = { padding: "12px 18px", fontWeight: 600, whiteSpace: "nowrap" };
const tdc: React.CSSProperties = { padding: "13px 18px", verticalAlign: "middle" };

export function RequisitionView({ role, requisitions, assets, openForm, onStatusChange, onBatchDisburse }: RequisitionViewProps) {
  const [sel, setSel] = useState<Requisition | null>(null);
  const [tab, setTab] = useState("all");
  const [disb, setDisb] = useState(false);

  const rows = requisitions.filter(r => tab === "all" || r.status === tab);
  
  const tabs = [
    { id: "all", label: "ทั้งหมด" },
    { id: "pending", label: "รอพิจารณาอนุมัติ" },
    { id: "approved", label: "รอการส่งมอบ" },
    { id: "disbursed", label: "ส่งมอบแล้ว" },
  ];

  return (
    <div className="animate-fadeIn">
      <PageHead 
        title="เบิก-จ่ายครุภัณฑ์" 
        subtitle="จัดการใบเบิกพัสดุครุภัณฑ์ภาครัฐ · ขอเบิก -> หัวหน้าคุมอนุมัติ -> เจ้าหน้าที่พัสดุตัดคลังส่งมอบ"
        actions={
          <>
            <Btn icon={I.requisition} variant="default" onClick={() => setDisb(true)}>ออกใบสั่งจ่าย (รวมหลายรายการ)</Btn>
            <Btn icon={I.plus} variant="primary" onClick={openForm}>สร้างใบขอเบิกพัสดุ</Btn>
          </>
        } 
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "var(--surface)", padding: 5, borderRadius: 11, border: "1px solid var(--border)", width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.8, fontWeight: 600,
            background: tab === t.id ? "var(--primary)" : "transparent", color: tab === t.id ? "#fff" : "var(--muted)" }}>
            {t.label}{t.id === "pending" && ` (${requisitions.filter(r => r.status === "pending").length})`}
          </button>
        ))}
      </div>

      <Card pad={false}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".03em" }}>
                <th style={thc}>เลขที่ใบเบิก</th>
                <th style={thc}>ชื่อครุภัณฑ์</th>
                <th style={thc}>ผู้ขอเบิก</th>
                <th style={thc}>ลักษณะ</th>
                <th style={thc}>วันที่ขอดำเนินการ</th>
                <th style={thc}>สถานะ</th>
                <th style={thc}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} onClick={() => setSel(r)} style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={tdc}><span style={{ fontFamily: "monospace", fontSize: 12.8, fontWeight: 600 }}>{r.id}</span></td>
                  <td style={{ ...tdc, fontWeight: 600 }}>{r.item}</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{r.requester}</td>
                  <td style={tdc}>{r.type === "ยืมใช้งาน" ? <Badge tone="amber" dot={false}>ยืมใช้งาน</Badge> : <Badge tone="blue" dot={false}>เบิกขาด</Badge>}</td>
                  <td style={{ ...tdc, color: "var(--muted)" }}>{thDate(r.date)}</td>
                  <td style={tdc}><Badge tone={(REQ_STATUS[r.status]?.tone ?? "gray")}>{REQ_STATUS[r.status]?.label ?? r.status}</Badge></td>
                  <td style={{ ...tdc, textAlign: "right", color: "var(--muted)" }}><Icon d={I.chevron} size={17} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>ไม่มีรายการใบคำขอเบิกพัสดุในกลุ่มนี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && (
        <RequisitionDetail 
          req={sel} 
          role={role} 
          onClose={() => setSel(null)} 
          onStatusChange={onStatusChange} 
        />
      )}
      {disb && (
        <DisbursementBuilder 
          onClose={() => setDisb(false)} 
          assets={assets} 
          onBatchDisburse={(v) => { onBatchDisburse(v); setDisb(false); }} 
        />
      )}
    </div>
  );
}

// ---------- Batch Disbursement Builder component ----------
interface DisbursementBuilderProps {
  onClose: () => void;
  assets: Asset[];
  onBatchDisburse: (data: any) => void;
}

function DisbursementBuilder({ onClose, assets, onBatchDisburse }: DisbursementBuilderProps) {
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState("เบิกขาด");
  const avail = assets.filter(a => a.status === "available");
  
  const [items, setItems] = useState<Array<{ code: string; qty: string; note: string }>>([
    { code: avail[0]?.code || "", qty: "1", note: "สภาพใช้งานปกติ" }
  ]);

  const setItem = (idx: number, k: string, v: string) => {
    setItems(arr => arr.map((item, j) => j === idx ? { ...item, [k]: v } : item));
  };
  const addItem = () => {
    setItems(arr => [...arr, { code: avail[0]?.code || "", qty: "1", note: "สภาพใช้งานปกติ" }]);
  };
  const delItem = (idx: number) => {
    setItems(arr => arr.filter((_, j) => j !== idx));
  };

  const handlePrint = () => {
    if (!recipient) {
      alert("โปรดระบุผู้รับมอบครุภัณฑ์");
      return;
    }
    const builtItems = items.map(it => { 
      const a = assets.find(x => x.code === it.code); 
      return { 
        name: a ? `${a.name} (${a.code})` : it.code, 
        qty: it.qty + " รายการพัสดุ", 
        note: it.note 
      }; 
    });

    const parsedData = { 
      dept, 
      recipient, 
      type, 
      items: builtItems, 
      date: new Date().toISOString() 
    };

    openPrint("disbursement", parsedData);
    
    // update real status of those assets in parent state
    const codesToUpdate = items.map(it => it.code);
    onBatchDisburse({ codeList: codesToUpdate, dept, recipient, type });
    onClose();
  };

  return (
    <SlideOver title="ออกใบสั่งจ่ายรวมหลายรายการ" subtitle="พัสดุและผู้จัดจัดการทำเรื่องจ่ายออกพัสดุคอมพิวเตอร์และสำนักงาน" width={680} onClose={onClose}
      footer={
        <>
          <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
          <Btn variant="primary" icon={I.printer} onClick={handlePrint}>พิมพ์ใบสั่งจ่ายออกคลัง ({items.length} รายการ)</Btn>
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Field label="แผนก/ฝ่ายสังกัดที่รับพัสดุ" required>
          <Select value={dept} onChange={e => setDept(e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="ผู้รับมอบครุภัณฑ์ (หัวหน้า/ตัวแทน)" required>
          <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="ชื่อ-นามสกุล ข้าราชการระบุ" />
        </Field>
        <Field label="ประเภทลักษณะใบสั่งจ่าย" required>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="เบิกขาด">เบิกขาดเข้าราชการ</option>
            <option value="ยืมใช้งาน">ยืมพัสดุชั่วคราว</option>
          </Select>
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 4, height: 16, background: "var(--primary)", borderRadius: 2 }} />
          รายการพัสดุครุภัณฑ์ที่จะเบิกจ่าย
        </span>
        <Btn size="sm" variant="default" icon={I.plus} onClick={addItem}>เพิ่มรายการพัสดุ</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 78px 1fr 32px", gap: 8, alignItems: "center", padding: "10px 12px", background: "var(--hover)", borderRadius: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textAlign: "center" }}>{i + 1}</span>
            <Select value={it.code} onChange={e => setItem(i, "code", e.target.value)} style={{ fontSize: 13.5 }}>
              {avail.map(a => <option key={a.code} value={a.code}>{a.name} ({a.code})</option>)}
            </Select>
            <Input value={it.qty} onChange={e => setItem(i, "qty", e.target.value)} style={{ fontSize: 13.5, textAlign: "center" }} />
            <Input value={it.note} onChange={e => setItem(i, "note", e.target.value)} placeholder="ระบุประกันชำรุด" style={{ fontSize: 13.5 }} />
            <button onClick={() => delItem(i)} disabled={items.length === 1} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: items.length === 1 ? "not-allowed" : "pointer", color: items.length === 1 ? "#c3ccd9" : "#e23b3b", display: "grid", placeItems: "center" }}>
              <Icon d={I.close} size={16} />
            </button>
          </div>
        ))}
        {avail.length === 0 && (
          <div style={{ padding: 18, color: "red", textAlign: "center", fontSize: 13.5 }}>
            ไม่มีพัสดุว่างพร้อมจัดส่งมอบในคลังพัสดุกลางในขณะนี้
          </div>
        )}
      </div>
      <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>อ้างอิงใบสั่งพัสดุและมอบสิทธิ์รวม จัดทำลงนามพร้อมกันในที่เดียว</div>
    </SlideOver>
  );
}
