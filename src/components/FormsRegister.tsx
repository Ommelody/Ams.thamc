import React, { useState, useEffect } from 'react';
import { Card, Btn, Field, Input, Select, Badge, QRCode, TONES } from './Shared';
import { Icon, I } from './Icons';
import { Asset } from '../types';
import { CATEGORIES, DEPARTMENTS, LOCATIONS, } from '../data';

interface SlideOverProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function SlideOver({ title, subtitle, onClose, children, footer, width = 560 }: SlideOverProps) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      {/* backdrop with simple absolute/fadeIn equivalent style */}
      <div onClick={onClose} style={{ 
        position: "absolute", 
        inset: 0, 
        background: "rgba(20,35,58,.42)", 
        backdropFilter: "blur(1px)",
      }} />
      <div style={{ 
        position: "absolute", 
        top: 0, 
        right: 0, 
        height: "100%", 
        width, 
        maxWidth: "94vw", 
        background: "var(--bg)",
        boxShadow: "-8px 0 40px rgba(20,35,58,.22)", 
        display: "flex", 
        flexDirection: "column",
        transition: "transform .26s ease"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--muted)" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text)", flexShrink: 0 }}>
            <Icon d={I.close} size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>{footer}</div>}
      </div>
    </div>
  );
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 4, height: 16, background: "var(--primary)", borderRadius: 2 }} />{title}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>
    </div>
  );
}

const IMPORT_SAMPLE = [
  { code: "7440-001-0013/67", name: "เครื่องคอมพิวเตอร์ตั้งโต๊ะ i5", cat: "ครุภัณฑ์คอมพิวเตอร์", price: "21,500.00", dept: "กองคลัง", ok: true },
  { code: "7440-001-0014/67", name: "จอคอมพิวเตอร์ 24 นิ้ว", cat: "ครุภัณฑ์คอมพิวเตอร์", price: "4,200.00", dept: "กองคลัง", ok: true },
  { code: "7110-002-0021/67", name: "โต๊ะประชุมไม้ 8 ที่นั่ง", cat: "ครุภัณฑ์สำนักงาน", price: "12,800.00", dept: "สำนักปลัด", ok: true },
  { code: "5820-004-0011/67", name: "ลำโพงห้องประชุม", cat: "ครุภัณฑ์ไฟฟ้าและวิทยุ", price: "8,900.00", dept: "กองการศึกษา", ok: true },
  { code: "—", name: "เก้าอี้พลาสติก", cat: "(ไม่พบหมวดหมู่)", price: "350.00", dept: "กองช่าง", ok: false },
];

interface RegisterFormProps {
  onClose: () => void;
  onDone: (asset?: Asset | Asset[], customMsg?: string) => void;
  initialCode?: string;
}

export function RegisterForm({ onClose, onDone, initialCode }: RegisterFormProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [cat, setCat] = useState("C01");
  const [parsed, setParsed] = useState<any[] | null>(null);

  // Single form input states
  const [code, setCode] = useState(() => initialCode || "7440-001-0" + Math.floor(100 + Math.random() * 899) + "/67");

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);
  const [name, setName] = useState("");
  const [acquired, setAcquired] = useState("2024-06-10");
  const [price, setPrice] = useState("");
  const [vendor, setVendor] = useState("บจก. ไอที โซลูชั่น");
  const [dept, setDept] = useState("ศูนย์เทคโนโลยีสารสนเทศ");
  const [loc, setLoc] = useState("อาคาร 1 ชั้น 3 ห้อง 305");
  const [holder, setHolder] = useState("ธนกร พงษ์ศรี");
  const [method, setMethod] = useState("เบิกขาด");

  const submitSingle = () => {
    if (!name || !price) {
      alert("โปรดระบุชื่อครุภัณฑ์และราคาทุน");
      return;
    }
    const newAsset: Asset = {
      code,
      name,
      cat,
      dept,
      holder,
      loc,
      acquired,
      price: parseFloat(price) || 0,
      vendor,
      status: "in_use",
      method,
    };
    onDone(newAsset);
    onClose();
  };

  const validCount = parsed ? parsed.filter(r => r.ok).length : 0;

  const importBulk = () => {
    if (!parsed) return;
    const importedAssets: Asset[] = parsed.filter(r => r.ok).map(item => {
      // Find category ID based on name or default
      const foundCat = CATEGORIES.find(c => c.name === item.cat) || CATEGORIES[0];
      return {
        code: item.code,
        name: item.name,
        cat: foundCat.id,
        dept: item.dept,
        holder: "พัสดุกลาง",
        loc: "คลังพัสดุกลาง",
        acquired: "2024-06-12",
        price: parseFloat(item.price.replace(/,/g, '')) || 0,
        vendor: "ผู้นำเข้า Excel",
        status: "available",
        method: "เบิกขาด"
      };
    });
    onDone(importedAssets, `นำเข้าครุภัณฑ์สำเร็จ ${validCount} รายการ`);
    onClose();
  };

  const currentLife = CATEGORIES.find(c => c.id === cat)?.life ?? 5;
  const currentDep = CATEGORIES.find(c => c.id === cat)?.dep ?? 20;

  const footer = mode === "single"
    ? (
      <>
        <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
        <Btn variant="primary" icon={I.check} onClick={submitSingle}>บันทึกและขึ้นทะเบียน</Btn>
      </>
    )
    : (
      <>
        <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
        <Btn variant="primary" icon={I.check} onClick={importBulk} style={{ opacity: validCount ? 1 : .5, pointerEvents: validCount ? "auto" : "none" }}>นำเข้า {validCount} รายการ</Btn>
      </>
    );

  return (
    <SlideOver title="ขึ้นทะเบียนครุภัณฑ์ใหม่" subtitle="บันทึกข้อมูลพื้นฐานคุมทะเบียนเพื่อแนบป้ายรหัส QR" onClose={onClose} width={mode === "bulk" ? 680 : 560} footer={footer}>
      <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "var(--hover)", padding: 5, borderRadius: 11, width: "fit-content" }}>
        {[
          { id: "single" as const, label: "กรอกข้อมูลรายชิ้น", icon: I.plus }, 
          { id: "bulk" as const, label: "นำเข้าจากไฟล์ Excel", icon: I.download }
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.8, fontWeight: 600,
            background: mode === t.id ? "var(--surface)" : "transparent", color: mode === t.id ? "var(--primary)" : "var(--muted)", boxShadow: mode === t.id ? "0 1px 3px rgba(20,35,58,.1)" : "none" }}>
            <Icon d={t.icon} size={16} stroke={mode === t.id ? "var(--primary)" : "var(--muted)"} />{t.label}
          </button>
        ))}
      </div>

      {mode === "bulk" ? (
        <div>
          <div style={{ display: "flex", gap: 12, padding: "14px 16px", background: "var(--primary-soft)", borderRadius: 10, alignItems: "center", marginBottom: 16 }}>
            <Icon d={I.reports} size={22} stroke="var(--primary)" />
            <div style={{ flex: 1, fontSize: 13.3, color: "var(--text)", lineHeight: 1.5 }}>นำเข้าครุภัณฑ์ครั้งละหลายรายการ — ดาวน์โหลดไฟล์เทมเพลต กรอกข้อมูล สแกน และนำเข้าพัสดุเข้าระบบทันที</div>
            <Btn size="sm" variant="default" icon={I.download}>เทมเพลต .xlsx</Btn>
          </div>

          {!parsed ? (
            <button onClick={() => setParsed(IMPORT_SAMPLE)} style={{ width: "100%", padding: "44px 20px", borderRadius: 12, border: "2px dashed var(--border)", background: "var(--hover)", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--muted)" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "var(--surface)", display: "grid", placeItems: "center", color: "var(--primary)" }}><Icon d={I.download} size={26} /></div>
              <div style={{ textAlign: "center", lineHeight: 1.5 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>ลากไฟล์ .xlsx มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</div>
                <div style={{ fontSize: 13 }}>รองรับไฟล์นามสกุล .xlsx, .xls, .csv</div>
              </div>
            </button>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>ตรวจสอบข้อมูลพัสดุ ({parsed.length} รายการ)</span>
                <button onClick={() => setParsed(null)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>ยกเลิก/เลือกไฟล์ใหม่</button>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--th-bg)", textAlign: "left", color: "var(--muted)", fontSize: 11.5 }}>
                      <th style={{ padding: "9px 10px" }}>รหัสคุม</th>
                      <th style={{ padding: "9px 10px" }}>ชื่อครุภัณฑ์</th>
                      <th style={{ padding: "9px 10px" }}>หมวดหมู่</th>
                      <th style={{ padding: "9px 10px", textAlign: "right" }}>ราคา (฿)</th>
                      <th style={{ padding: "9px 10px" }}>ความสมบูรณ์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((r, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border)", background: r.ok ? "transparent" : TONES.red.bg }}>
                        <td style={{ padding: "9px 10px", fontFamily: "monospace", fontSize: 11.5 }}>{r.code}</td>
                        <td style={{ padding: "9px 10px", fontWeight: 600 }}>{r.name}</td>
                        <td style={{ padding: "9px 10px", color: "var(--muted)" }}>{r.cat}</td>
                        <td style={{ padding: "9px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.price}</td>
                        <td style={{ padding: "9px 10px" }}>
                          {r.ok ? <Badge tone="green" dot={false}>พร้อมบันทึก</Badge> : <Badge tone="red" dot={false}>ข้อมูลไม่ครบ</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13 }}>
                <span style={{ color: TONES.green.fg, fontWeight: 600 }}>✓ ข้อมูลสมบูรณ์พร้อมนำเข้า {validCount} รายการ</span>
                {parsed.length - validCount > 0 && <span style={{ color: TONES.red.fg, fontWeight: 600 }}>✕ ต้องแก้ไขเพิ่มเติม {parsed.length - validCount} รายการ</span>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <FormSection title="รายละเอียดพัสดุและรหัส">
            <Field label="รหัสครุภัณฑ์ภาครัฐ" required hint="กำหนดรหัสขึ้นทะเบียนครุภัณฑ์">
              <Input value={code} onChange={e => setCode(e.target.value)} style={{ fontFamily: "monospace" }} />
            </Field>
            <Field label="หมวดหมู่ครุภัณฑ์หลัก" required>
              <Select value={cat} onChange={e => setCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="ชื่อรายการครุภัณฑ์" required span={2}>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="ระบุประเภทและชื่อยี่ห้อ เช่น เครื่องปรับอากาศ York 18000BTU" />
            </Field>
          </FormSection>

          <FormSection title="เสื่อมราคาและข้อมูลการได้มา">
            <Field label="วันที่ซื้อ/ตรวจรับ" required>
              <Input type="date" value={acquired} onChange={e => setAcquired(e.target.value)} />
            </Field>
            <Field label="ราคาทุนรวม (บาท)" required>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="ผู้ขาย/ร้านค้า (Vendor)" span={2}>
              <Select value={vendor} onChange={e => setVendor(e.target.value)}>
                <option value="บจก. ไอที โซลูชั่น">บจก. ไอที โซลูชั่น</option>
                <option value="บจก. ออฟฟิศ พลัส">บจก. ออฟฟิศ พลัส</option>
                <option value="หจก. เฟอร์นิเจอร์ไทย">หจก. เฟอร์นิเจอร์ไทย</option>
                <option value="บจก. เมดิคอล ซัพพลาย">บจก. เมดิคอล ซัพพลาย</option>
              </Select>
            </Field>
            <Field label="อายุใช้งานของพัสดุ (ปี)">
              <Input value={currentLife} readOnly style={{ background: "var(--hover)" }} />
            </Field>
            <Field label="อัตราเสื่อมราคา/ปี (%)" hint="คำนวณตามสูตรกรมบัญชีกลาง">
              <Input value={currentDep + "%"} readOnly style={{ background: "var(--hover)" }} />
            </Field>
          </FormSection>

          <FormSection title="ฝ่ายความรับผิดชอบและสถานที่">
            <Field label="แผนก/ฝ่ายผู้ดูแล" required>
              <Select value={dept} onChange={e => setDept(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="สถานที่ประจำห้อง" required>
              <Select value={loc} onChange={e => setLoc(e.target.value)}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="รหัสผู้รับครอบครองใช้งาน">
              <Input value={holder} onChange={e => setHolder(e.target.value)} placeholder="ระบุชื่อผู้ใช้งานรับดูแล" />
            </Field>
            <Field label="สิทธิ์การถือครองส่งมอบ">
              <Select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="เบิกขาด">ส่งมอบเบิกขาด</option>
                <option value="ยืมใช้งาน">ยืมใช้อเนกประสงค์</option>
              </Select>
            </Field>
          </FormSection>

          <div style={{ display: "flex", gap: 12, padding: "14px 16px", background: "var(--primary-soft)", borderRadius: 10, alignItems: "center" }}>
            <div style={{ padding: 6, background: "#fff", borderRadius: 8, border: "1px solid var(--border)" }}>
              <QRCode value={code} size={64} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
              <b>สร้างรหัสบาร์โค้ด QR Code อัตโนมัติ</b><br />
              <span style={{ color: "var(--muted)" }}>ใช้สำหรับติดครุภัณฑ์ สแกนตรวจสอบประวัติและเช็คซ่อมออนไลน์ได้ทันที</span>
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
export default RegisterForm;
