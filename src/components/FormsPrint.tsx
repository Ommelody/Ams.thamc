import React, { useState, useEffect } from 'react';
import { QRCode, Btn } from './Shared';
import { I } from './Icons';
import { Asset, Requisition, Repair, Disposal } from '../types';
import { thb, thDate, CATEGORIES, REPAIR_STATUS } from '../data';

const PF = {
  sheet: { 
    width: "210mm", 
    minHeight: "292mm", 
    background: "#fff", 
    color: "#000", 
    margin: "0 auto",
    padding: "16mm 18mm", 
    boxSizing: "border-box" as const, 
    fontFamily: "'Sarabun', sans-serif", 
    fontSize: "15px", 
    lineHeight: 1.55 
  },
  dot: { 
    borderBottom: "1px dotted #444", 
    display: "inline-block", 
    padding: "0 6px", 
    minHeight: "1.4em", 
    verticalAlign: "bottom" 
  },
};

interface DotProps {
  children?: React.ReactNode;
  w?: string;
  grow?: boolean;
}

function Dot({ children, w, grow }: DotProps) {
  return (
    <span className="pf-dot" style={{ 
      ...PF.dot, 
      width: grow ? "auto" : w, 
      flex: grow ? 1 : "none", 
      textAlign: children ? "left" : "center", 
      fontWeight: children ? 600 : 400 
    }}>
      {children || "\u00a0"}
    </span>
  );
}

interface FRowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function FRow({ children, style }: FRowProps) { 
  return (
    <div className="frow" style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 9, ...style }}>
      {children}
    </div>
  ); 
}

interface SealHeadProps {
  org?: string;
  sub?: string;
}

function SealHead({ org = "องค์การบริหารส่วนตำบล", sub = "อำเภอเมือง จังหวัด...................." }: SealHeadProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 6 }}>
      <div style={{ 
        width: 52, 
        height: 52, 
        margin: "0 auto 6px", 
        border: "1.5px solid #888", 
        borderRadius: "50%", 
        display: "grid", 
        placeItems: "center", 
        fontSize: 10, 
        color: "#888", 
        fontFamily: "monospace", 
        lineHeight: 1.1, 
        textAlign: "center" 
      }}>
        ตรา<br />ครุฑ
      </div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{org}</div>
      <div style={{ fontSize: 13.5, color: "#333" }}>{sub}</div>
    </div>
  );
}

interface TitleProps {
  children: React.ReactNode;
  sub?: string;
}

function Title({ children, sub }: TitleProps) {
  return (
    <div style={{ textAlign: "center", margin: "10px 0 18px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 4 }}>{children}</div>
      {sub && <div style={{ fontSize: 13.5, color: "#444", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

interface MetaRowProps {
  no: string;
  date: string;
}

function MetaRow({ no, date }: MetaRowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, marginBottom: 14 }}>
      <span>เลขที่ <b style={{ fontFamily: "monospace" }}>{no}</b></span>
      <span>วันที่ <b>{date}</b></span>
    </div>
  );
}

interface SignColProps {
  role: string;
  name?: string;
  position?: string;
  key?: React.Key;
}

function SignCol({ role, name, position }: SignColProps) {
  return (
    <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, textAlign: "center", lineHeight: 1.5 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, justifyContent: "center", marginBottom: 7 }}>
        <span>ลงชื่อ</span><span style={{ flex: 1, maxWidth: 150, borderBottom: "1px dotted #555", minHeight: "1.25em" }}>&nbsp;</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
        <span>(</span><span style={{ flex: 1, maxWidth: 130, borderBottom: "1px dotted #555", textAlign: "center", fontWeight: name ? 600 : 400, minHeight: "1.25em" }}>{name || "\u00a0"}</span><span>)</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, justifyContent: "center", marginBottom: 7 }}>
        <span style={{ whiteSpace: "nowrap" }}>ตำแหน่ง</span><span style={{ flex: 1, maxWidth: 120, borderBottom: "1px dotted #555", textAlign: "center", minHeight: "1.25em" }}>{position || "\u00a0"}</span>
      </div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{role}</div>
    </div>
  );
}

interface ItemTableProps {
  cols: Array<{ label: string; w?: string; align?: "left" | "right" | "center" }>;
  rows: Array<Array<string>>;
}

function ItemTable({ cols, rows }: ItemTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, margin: "6px 0 16px" }}>
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} style={{ 
              border: "1px solid #333", 
              padding: "6px 8px", 
              background: "#f0f0f0", 
              fontWeight: 700, 
              textAlign: c.align || "left", 
              width: c.w 
            }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} style={{ 
                border: "1px solid #333", 
                padding: "7px 8px", 
                textAlign: cols[j].align || "left", 
                verticalAlign: "top" 
              }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
        {Array.from({ length: Math.max(0, 3 - rows.length) }).map((_, i) => (
          <tr key={"e" + i}>
            {cols.map((c, j) => (
              <td key={j} style={{ border: "1px solid #333", padding: "7px 8px", height: 30 }}>&nbsp;</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface SignFooterProps {
  cols: SignColProps[];
  count?: number;
}

function SignFooter({ cols }: SignFooterProps) {
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
      {cols.map((c, i) => <SignCol key={i} role={c.role} name={c.name} position={c.position} />)}
    </div>
  );
}

function catName2(id: string) { 
  const c = CATEGORIES.find(x => x.id === id); 
  return c ? c.name : id; 
}

const FORMS = {
  registration: (a: Asset) => ({
    title: "ใบขึ้นทะเบียนครุภัณฑ์", 
    sub: "(แนบแฟ้มประวัติพัสดุ)", 
    no: a.code,
    body: (
      <div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <FRow><span>รหัสครุภัณฑ์</span><Dot grow>{a.code}</Dot></FRow>
            <FRow><span>ชื่อครุภัณฑ์</span><Dot grow>{a.name}</Dot></FRow>
            <FRow><span>หมวดหมู่</span><Dot grow>{catName2(a.cat)}</Dot></FRow>
            <FRow>
              <span>วันที่ได้มา</span><Dot w="150px">{thDate(a.acquired)}</Dot>
              <span>ราคา</span><Dot w="120px">{thb(a.price)}</Dot><span>บาท</span>
            </FRow>
            <FRow><span>ผู้จัดจำหน่าย</span><Dot grow>{a.vendor}</Dot></FRow>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ border: "1px solid #333", padding: 6, display: "inline-block" }}>
              <QRCode value={a.code} size={96} />
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", marginTop: 4 }}>{a.code}</div>
          </div>
        </div>
        <FRow>
          <span>อายุการใช้งาน</span><Dot w="80px">{(CATEGORIES.find(c => c.id === a.cat)?.life ?? 5)}</Dot><span>ปี</span>
          <span style={{ marginLeft: 14 }}>อัตราค่าเสื่อมราคา</span><Dot w="80px">{(CATEGORIES.find(c => c.id === a.cat)?.dep ?? 20)}</Dot><span>% ต่อปี</span>
        </FRow>
        <FRow><span>แผนก/ฝ่าย</span><Dot w="240px">{a.dept}</Dot><span>สถานที่ตั้ง</span><Dot grow>{a.loc}</Dot></FRow>
        <SignFooter cols={[
          { role: "เจ้าหน้าที่พัสดุ (ผู้บันทึก)", position: "นักวิชาการพัสดุ" },
          { role: "หัวหน้าเจ้าหน้าที่พัสดุ (ผู้ตรวจสอบ)", position: "ผู้อำนวยการกองคลัง" },
        ]} />
      </div>
    ),
  }),

  requisition: (r: Requisition) => ({
    title: "ใบเบิกครุภัณฑ์", 
    sub: "เสนอขออนุมัติตามลำดับขั้น", 
    no: r.id,
    body: (
      <div>
        <MetaRow no={r.id} date={thDate(r.date)} />
        <FRow><span>ข้าพเจ้า</span><Dot w="220px">{r.requester}</Dot><span>แผนก/ฝ่าย</span><Dot grow>{r.dept}</Dot></FRow>
        <FRow><span>มีความประสงค์ขอเบิกครุภัณฑ์ ประเภท</span><Dot w="180px">{r.type}</Dot><span>เพื่อใช้ในราชการ ดังนี้</span></FRow>
        <ItemTable 
          cols={[
            { label: "ลำดับ", w: "50px", align: "center" }, 
            { label: "รายการครุภัณฑ์", align: "left" }, 
            { label: "จำนวน", w: "90px", align: "center" }, 
            { label: "หมายเหตุ", w: "120px" }
          ]}
          rows={[["1", r.item, "1 เครื่อง", r.type]]} 
        />
        <FRow><span>วัตถุประสงค์</span><Dot grow>{r.purpose}</Dot></FRow>
        <SignFooter cols={[
          { role: "ผู้ขอเบิก", name: r.requester },
          { role: "ผู้บังคับบัญชา (ผู้อนุมัติ)", name: r.approver, position: "ผู้อำนวยการกอง" },
        ]} />
      </div>
    ),
  }),

  disbursement: (d: any) => {
    const items = d.items || [{ name: d.item, qty: "1 ชิ้น", note: d.type || "ใช้งานได้ปกติ" }];
    const recipient = d.recipient || d.requester || "";
    const dept = d.dept || "";
    const no = d.no || (d.id ? d.id.replace("REQ", "DIS") : "DIS-2567-____");
    const date = d.date ? thDate(d.date) : thDate(new Date().toISOString());
    const isLoan = d.type === "ยืมใช้งาน";
    return {
      title: isLoan ? "ใบยืมครุภัณฑ์" : "ใบสั่งจ่ายครุภัณฑ์", 
      sub: "(หลักฐานการจ่าย — ให้ผู้รับลงนามรับรอง)", 
      no,
      body: (
        <div>
          <MetaRow no={no} date={date} />
          <FRow><span>จ่ายครุภัณฑ์ให้แก่หน่วยงาน</span><Dot grow>{dept}</Dot></FRow>
          {d.id && <FRow><span>อ้างอิงใบเบิกเลขที่</span><Dot w="180px">{d.id}</Dot><span>ลักษณะการจ่าย</span><Dot w="140px">{d.type || "เบิกขาด"}</Dot></FRow>}
          <ItemTable 
            cols={[
              { label: "ลำดับ", w: "50px", align: "center" }, 
              { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
              { label: "จำนวน", w: "90px", align: "center" }, 
              { label: "สภาพ / หมายเหตุ", w: "140px" }
            ]}
            rows={items.map((it: any, i: number) => [String(i + 1), it.name, it.qty || "1", it.note || "ใช้งานได้ปกติ"])} 
          />
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <SignCol role="เจ้าหน้าที่พัสดุ (ผู้จ่าย)" position="นักวิชาการพัสดุ" />
            <SignCol role="ผู้จัดการฝ่ายพัสดุ (ผู้อนุมัติจ่าย)" position="หัวหน้าเจ้าหน้าที่พัสดุ" />
            <SignCol role="ผู้รับ (หัวหน้าหน่วยงาน)" name={recipient} />
          </div>
        </div>
      ),
    };
  },

  return: (a: any) => {
    const usable = a.condition !== "unusable";
    const box = (on: boolean) => (
      <span style={{ 
        width: 15, 
        height: 15, 
        border: "1.5px solid #333", 
        display: "inline-grid", 
        placeItems: "center", 
        fontSize: 12, 
        fontWeight: 700, 
        lineHeight: 1 
      }}>
        {on ? "✓" : "\u00a0"}
      </span>
    );
    return {
      title: "ใบส่งคืนครุภัณฑ์", 
      sub: "(ระบุสภาพครุภัณฑ์ ณ วันที่ส่งคืน)", 
      no: a.no || "RT-2567-____",
      body: (
        <div>
          <MetaRow no={a.no || "RT-2567-____"} date={thDate(new Date().toISOString())} />
          <FRow><span>ข้าพเจ้า</span><Dot w="220px">{a.holder}</Dot><span>ขอส่งคืนครุภัณฑ์ ดังนี้</span></FRow>
          <ItemTable 
            cols={[
              { label: "ลำดับ", w: "50px", align: "center" }, 
              { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
              { label: "จำนวน", w: "80px", align: "center" }, 
              { label: "สภาพ ณ วันส่งคืน", w: "160px" }
            ]}
            rows={[["1", `${a.name} (${a.code})`, "1", usable ? "ใช้การได้" : "ใช้การไม่ได้ / ชำรุด"]]} 
          />
          <div style={{ border: "1px solid #333", padding: "10px 14px", margin: "4px 0 12px" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>ผลการตรวจสภาพ ณ วันส่งคืน</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {box(usable)}<span>ส่งคืนใช้การได้ — รับเข้าคลัง (พร้อมจ่าย / เบิกต่อ)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {box(!usable)}<span>ส่งคืนใช้การไม่ได้ — ส่งตรวจสภาพ / แจ้งซ่อม / แทงจำหน่าย</span>
            </div>
          </div>
          {a.note && <FRow><span>หมายเหตุ</span><Dot grow>{a.note}</Dot></FRow>}
          <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
            <SignCol role="ผู้ส่งคืน" name={a.holder} />
            <SignCol role="เจ้าหน้าที่พัสดุ (ผู้ตรวจรับสภาพ)" position="นักวิชาการพัสดุ" />
          </div>
        </div>
      ),
    };
  },

  receipt: (a: any) => ({
    title: "ใบรับคืนครุภัณฑ์", 
    sub: "(หลักฐานว่าคลังได้รับครุภัณฑ์กลับคืนแล้ว)", 
    no: "RC-2567-____",
    body: (
      <div>
        <MetaRow no="RC-2567-____" date={thDate(new Date().toISOString())} />
        <FRow><span>คลังพัสดุได้รับครุภัณฑ์คืนจาก</span><Dot grow>{a.holder}</Dot></FRow>
        <ItemTable 
          cols={[
            { label: "ลำดับ", w: "50px", align: "center" }, 
            { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
            { label: "จำนวน", w: "80px", align: "center" }, 
            { label: "สถานะใหม่", w: "150px" }
          ]}
          rows={[["1", `${a.name} (${a.code})`, "1", "พร้อมใช้งาน"]]} 
        />
        <FRow style={{ marginTop: 4 }}><span>อัปเดตสถานะในระบบเป็น</span><Dot w="200px">ว่าง / พร้อมใช้งาน</Dot></FRow>
        <SignFooter cols={[
          { role: "เจ้าหน้าที่พัสดุ (ผู้รับคืน)", position: "นักวิชาการพัสดุ" }, 
          { role: "หัวหน้าเจ้าหน้าที่พัสดุ" }
        ]} />
      </div>
    ),
  }),

  transfer: (a: any) => ({
    title: "ใบโอนย้ายครุภัณฑ์", 
    sub: "(โอนย้ายระหว่างหน่วยงาน — ต้องผ่านการอนุมัติจากผู้จัดการฝ่ายพัสดุ)", 
    no: a.no || "TF-2567-____",
    body: (
      <div>
        <MetaRow no={a.no || "TF-2567-____"} date={thDate(new Date().toISOString())} />
        <FRow><span>ผู้โอน</span><Dot w="190px">{a.holder}</Dot><span>หน่วยงานเดิม</span><Dot grow>{a.dept}</Dot></FRow>
        <FRow><span>ผู้รับโอน</span><Dot w="190px">{a.toName || "ธนกร พงษ์ศรี"}</Dot><span>หน่วยงานผู้รับโอน</span><Dot grow>{a.toDept || "ศูนย์เทคโนโลยีสารสนเทศ"}</Dot></FRow>
        <ItemTable 
          cols={[
            { label: "ลำดับ", w: "50px", align: "center" }, 
            { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
            { label: "จำนวน", w: "80px", align: "center" }, 
            { label: "สภาพ", w: "120px" }
          ]}
          rows={[["1", `${a.name} (${a.code})`, "1", "ใช้งานได้ปกติ"]]} 
        />
        <FRow><span>เหตุผลการโอนย้าย</span><Dot grow>{a.reason || "เพื่อใช้ในภารกิจของหน่วยงานผู้รับโอน"}</Dot></FRow>
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <SignCol role="ผู้โอน" name={a.holder} />
          <SignCol role="ผู้รับโอน" name={a.toName || "ธนกร พงษ์ศรี"} />
          <SignCol role="เจ้าหน้าที่พัสดุ (พยาน)" />
          <SignCol role="ผู้จัดการฝ่ายพัสดุ (ผู้อนุมัติ)" position="หัวหน้าเจ้าหน้าที่พัสดุ" />
        </div>
      </div>
    ),
  }),

  disposal: (d: Disposal) => ({
    title: "ใบจำหน่ายพัสดุ", 
    sub: "(ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ)", 
    no: d.id,
    body: (
      <div>
        <MetaRow no={d.id} date={thDate(d.date)} />
        <ItemTable 
          cols={[
            { label: "ลำดับ", w: "50px", align: "center" }, 
            { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
            { label: "วิธีการจำหน่าย", w: "150px" }, 
            { label: "มูลค่าที่จำหน่ายได้", w: "120px", align: "right" }
          ]}
          rows={[["1", `${d.asset} (${d.code})`, d.method, d.value ? thb(d.value) : "—"]]} 
        />
        <FRow><span>เหตุผลในการจำหน่าย</span><Dot grow>{d.reason}</Dot></FRow>
        <FRow><span>คณะกรรมการตรวจสอบพัสดุ</span><Dot grow>{d.committee}</Dot></FRow>
        {d.method === "สูญหาย" && <div style={{ fontSize: 13.5, color: "#444", margin: "4px 0 10px" }}>* แนบรายงานผลการสอบสวนข้อเท็จจริงประกอบ</div>}
        <SignFooter cols={[
          { role: "ประธานกรรมการ" }, 
          { role: "กรรมการ" }, 
          { role: "ผู้อนุมัติ", position: "ผู้อำนวยการศูนย์การแพทย์ธรรมศาสตร์" }
        ]} />
      </div>
    ),
  }),

  repair: (rp: Repair) => ({
    title: "ใบแจ้งซ่อมครุภัณฑ์", 
    sub: "(บันทึกการแจ้งซ่อม / ประวัติการซ่อมบำรุง)", 
    no: rp.id,
    body: (
      <div>
        <MetaRow no={rp.id} date={thDate(rp.date)} />
        <FRow><span>ผู้แจ้ง</span><Dot w="220px">{rp.reporter}</Dot><span>สถานะ</span><Dot grow>{(REPAIR_STATUS[rp.status]?.label ?? "รอซ่อม")}</Dot></FRow>
        <ItemTable 
          cols={[
            { label: "รายการ / รหัสครุภัณฑ์", align: "left" }, 
            { label: "อาการ / ปัญหาที่พบ", align: "left" }, 
            { label: "ผู้รับซ่อม", w: "150px" }
          ]}
          rows={[[`${rp.asset} (${rp.code})`, rp.problem, rp.vendor]]} 
        />
        <FRow>
          <span>ผลการพิจารณา</span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 8 }}><input type="checkbox" /> ซ่อมได้/คุ้มค่า</label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 14 }}><input type="checkbox" /> ส่งแทงจำหน่าย</label>
        </FRow>
        <SignFooter cols={[
          { role: "ผู้แจ้งซ่อม", name: rp.reporter }, 
          { role: "เจ้าหน้าที่พัสดุ" }
        ]} />
      </div>
    ),
  }),
};

export function PrintHost() {
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    const handlePrintEvent = (e: any) => {
      setDoc(e.detail);
    };
    window.addEventListener("amsprint", handlePrintEvent);
    return () => window.removeEventListener("amsprint", handlePrintEvent);
  }, []);

  if (!doc) return null;
  const builder = FORMS[doc.type as keyof typeof FORMS];
  if (!builder) return null;

  const f = builder(doc.data);

  return (
    <div className="print-overlay animate-fadeIn" style={{ 
      position: "fixed", 
      inset: 0, 
      zIndex: 100, 
      background: "rgba(20,35,58,.55)", 
      overflow: "auto", 
      padding: "30px 20px" 
    }}>
      <div className="no-print" style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 2, 
        display: "flex", 
        justifyContent: "center", 
        gap: 12, 
        marginBottom: 18 
      }}>
        <Btn variant="primary" icon={I.printer} onClick={() => window.print()}>พิมพ์ / บันทึก PDF</Btn>
        <Btn variant="default" icon={I.close} onClick={() => setDoc(null)} style={{ background: "#fff" }}>ปิด</Btn>
      </div>
      <div className="printable" style={{ ...PF.sheet, boxShadow: "0 8px 30px rgba(0,0,0,.3)" }}>
        <SealHead />
        <Title sub={f.sub}>{f.title}</Title>
        {f.body}
      </div>
    </div>
  );
}

// Global dispatcher helper
export function openPrint(type: string, data: any) {
  window.dispatchEvent(new CustomEvent("amsprint", { detail: { type, data } }));
}
