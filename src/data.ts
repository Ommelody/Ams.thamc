import { Category, Asset, Requisition, Repair, Disposal, Activity } from './types';

// Load from localStorage or defaults
const defaultCategories: Category[] = [
  { id: "C01", name: "ครุภัณฑ์คอมพิวเตอร์", life: 5, dep: 20 },
  { id: "C02", name: "ครุภัณฑ์สำนักงาน", life: 8, dep: 12.5 },
  { id: "C03", name: "ครุภัณฑ์ยานพาหนะและขนส่ง", life: 8, dep: 12.5 },
  { id: "C04", name: "ครุภัณฑ์ไฟฟ้าและวิทยุ", life: 5, dep: 20 },
  { id: "C05", name: "ครุภัณฑ์วิทยาศาสตร์การแพทย์", life: 10, dep: 10 },
  { id: "C06", name: "ครุภัณฑ์งานบ้านงานครัว", life: 5, dep: 20 },
];

const defaultDepartments = [
  "ฝ่ายบริหารทั่วไป", "ฝ่ายการเงินและพัสดุ", "ฝ่ายวิศวกรรมการแพทย์", "ฝ่ายการพยาบาล",
  "ฝ่ายบริการการแพทย์", "สำนักงานผู้อำนวยการ", "ศูนย์เทคโนโลยีสารสนเทศ",
];

const defaultLocations = [
  "อาคาร 1 ชั้น 2 ห้อง 201", "อาคาร 1 ชั้น 3 ห้อง 305", "อาคาร 2 ชั้น 1 ห้องประชุม",
  "อาคาร 2 ชั้น 4 ห้อง 410", "คลังพัสดุกลาง", "อาคาร 3 ชั้น 1 ห้องสำนักงาน",
];

const defaultPeople = [
  { id: "U01", name: "สมชาย ใจดี", role: "เจ้าหน้าที่พัสดุ", dept: "ฝ่ายการเงินและพัสดุ", title: "นักวิชาการพัสดุชำนาญการ" },
  { id: "U02", name: "วิภาดา สุขใจ", role: "หัวหน้างาน", dept: "ฝ่ายวิศวกรรมการแพทย์", title: "หัวหน้าฝ่ายวิศวกรรมการแพทย์" },
  { id: "U03", name: "ธนกร พงษ์ศรี", role: "ผู้ใช้งาน", dept: "ศูนย์เทคโนโลยีสารสนเทศ", title: "นักวิชาการคอมพิวเตอร์ปฏิบัติการ" },
  { id: "U04", name: "อรุณี แสงทอง", role: "ผู้ใช้งาน", dept: "ฝ่ายบริการการแพทย์", title: "แพทย์ชำนาญการ" },
  { id: "U05", name: "ประเสริฐ มั่นคง", role: "ผู้บริหาร", dept: "สำนักงานผู้อำนวยการ", title: "ผู้อำนวยการศูนย์การแพทย์ธรรมศาสตร์" },
  { id: "U06", name: "กนกพร วงศ์ทอง", role: "ผู้ใช้งาน", dept: "ฝ่ายการพยาบาล", title: "พยาบาลวิชาชีพชำนาญการ" },
];

const loadLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const val = localStorage.getItem(key);
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    return fallback;
  }
};

export const CATEGORIES: Category[] = loadLocal("ams_categories", defaultCategories);
export const DEPARTMENTS: string[] = loadLocal("ams_departments", defaultDepartments);
export const LOCATIONS: string[] = loadLocal("ams_locations", defaultLocations);
export const PEOPLE: any[] = loadLocal("ams_people", defaultPeople);

export function updateCategories(newCats: Category[]) {
  CATEGORIES.splice(0, CATEGORIES.length, ...newCats);
  localStorage.setItem("ams_categories", JSON.stringify(newCats));
}

export function updateDepartments(newDepts: string[]) {
  DEPARTMENTS.splice(0, DEPARTMENTS.length, ...newDepts);
  localStorage.setItem("ams_departments", JSON.stringify(newDepts));
}

export function updateLocations(newLocs: string[]) {
  LOCATIONS.splice(0, LOCATIONS.length, ...newLocs);
  localStorage.setItem("ams_locations", JSON.stringify(newLocs));
}

export function updatePeople(newPeople: any[]) {
  PEOPLE.splice(0, PEOPLE.length, ...newPeople);
  localStorage.setItem("ams_people", JSON.stringify(newPeople));
}

export const ROLES = [
  { id: "staff", label: "เจ้าหน้าที่พัสดุ", name: "สมชาย ใจดี", title: "นักวิชาการพัสดุชำนาญการ" },
  { id: "approver", label: "หัวหน้างาน", name: "วิภาดา สุขใจ", title: "หัวหน้าฝ่ายวิศวกรรมการแพทย์" },
  { id: "user", label: "ผู้ใช้งานทั่วไป", name: "ธนกร พงษ์ศรี", title: "นักวิชาการคอมพิวเตอร์" },
  { id: "exec", label: "ผู้บริหาร", name: "ประเสริฐ มั่นคง", title: "ผู้อำนวยการศูนย์การแพทย์ธรรมศาสตร์" },
];

export const STATUS_MAP = {
  available: { label: "พร้อมใช้งาน", tone: "green" as const },
  in_use:    { label: "ใช้งานอยู่", tone: "blue" as const },
  borrowed:  { label: "ถูกยืม", tone: "amber" as const },
  repair:    { label: "รอ/กำลังซ่อม", tone: "orange" as const },
  disposed:  { label: "จำหน่ายแล้ว", tone: "gray" as const },
  lost:      { label: "สูญหาย", tone: "red" as const },
};

export const REQ_STATUS = {
  pending:   { label: "รออนุมัติ", tone: "amber" as const },
  approved:  { label: "อนุมัติแล้ว", tone: "blue" as const },
  disbursed: { label: "จ่ายแล้ว", tone: "green" as const },
  rejected:  { label: "ไม่อนุมัติ", tone: "red" as const },
};

export const REPAIR_STATUS = {
  waiting:   { label: "รอซ่อม", tone: "amber" as const },
  repairing: { label: "กำลังซ่อม", tone: "blue" as const },
  done:      { label: "ซ่อมเสร็จ", tone: "green" as const },
  scrap:     { label: "ส่งแทงจำหน่าย", tone: "red" as const },
};

export const DISPOSAL_METHODS = [
  "ขายทอดตลาด", "ขายโดยวิธีตกลงราคา", "แลกเปลี่ยน",
  "โอนให้หน่วยงานรัฐอื่น", "แปรสภาพหรือทำลาย", "สูญหาย"
];

export function thb(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function thDate(iso: string): string {
  const d = new Date(iso);
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function exportToExcel(data: any[], filename: string, headers: Record<string, string>) {
  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);
  
  const csvRows = [];
  // UTF-8 BOM is required for Thai Excel to display correctly
  csvRows.push(headerLabels.map(h => `"${h.replace(/"/g, '""')}"`).join(","));
  
  for (const row of data) {
    const values = headerKeys.map(key => {
      let val = row[key];
      if (val === undefined || val === null) val = "";
      const valStr = String(val);
      return `"${valStr.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  
  const csvContent = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const ASSETS_MOCK: Asset[] = [
  { code: "7440-001-0001/67", name: "เครื่องคอมพิวเตอร์ All In One", cat: "C01", dept: "ศูนย์เทคโนโลยีสารสนเทศ", holder: "ธนกร พงษ์ศรี", loc: "อาคาร 1 ชั้น 3 ห้อง 305", acquired: "2023-11-15", price: 23000, vendor: "บจก. ไอที โซลูชั่น", status: "in_use", method: "เบิกขาด" },
  { code: "7440-001-0002/67", name: "เครื่องพิมพ์เลเซอร์ขาวดำ", cat: "C01", dept: "ฝ่ายการเงินและพัสดุ", holder: "สมชาย ใจดี", loc: "อาคาร 1 ชั้น 2 ห้อง 201", acquired: "2023-12-02", price: 8900, vendor: "บจก. ออฟฟิศ พลัส", status: "in_use", method: "เบิกขาด" },
  { code: "7440-001-0003/66", name: "เครื่องคอมพิวเตอร์โน้ตบุ๊ก", cat: "C01", dept: "ฝ่ายวิศวกรรมการแพทย์", holder: "วิภาดา สุขใจ", loc: "อาคาร 2 ชั้น 4 ห้อง 410", acquired: "2022-08-20", price: 26500, vendor: "บจก. ไอที โซลูชั่น", status: "borrowed", method: "ยืมใช้งาน" },
  { code: "7110-002-0011/65", name: "โต๊ะทำงานเหล็ก 5 ฟุต", cat: "C02", dept: "ฝ่ายบริหารทั่วไป", holder: "อรุณี แสงทอง", loc: "อาคาร 3 ชั้น 1 ห้องสำนักงาน", acquired: "2021-05-10", price: 4500, vendor: "หจก. เฟอร์นิเจอร์ไทย", status: "in_use", method: "เบิกขาด" },
  { code: "7110-002-0012/65", name: "เก้าอี้สำนักงานบุนวม", cat: "C02", dept: "ฝ่ายบริหารทั่วไป", holder: "—", loc: "คลังพัสดุกลาง", acquired: "2021-05-10", price: 2800, vendor: "หจก. เฟอร์นิเจอร์ไทย", status: "available", method: "—" },
  { code: "2310-003-0001/64", name: "รถยนต์ตรวจการณ์ (กระบะ)", cat: "C03", dept: "สำนักงานผู้อำนวยการ", holder: "ประเสริฐ มั่นคง", loc: "โรงจอดรถ อาคาร 1", acquired: "2020-09-30", price: 869000, vendor: "บจก. ออโต้ ดีลเลอร์", status: "in_use", method: "เบิกขาด" },
  { code: "6515-005-0007/66", name: "เครื่องวัดความดันโลหิตดิจิทัล", cat: "C05", dept: "ฝ่ายการพยาบาล", holder: "กนกพร วงศ์ทอง", loc: "อาคาร 2 ชั้น 1 ห้องประชุม", acquired: "2022-12-18", price: 12500, vendor: "บจก. เมดิคอล ซัพพลาย", status: "repair", method: "เบิกขาด" },
  { code: "5820-004-0003/63", name: "เครื่องโปรเจคเตอร์ LCD", cat: "C04", dept: "ฝ่ายบริการการแพทย์", holder: "อรุณี แสงทอง", loc: "อาคาร 2 ชั้น 1 ห้องประชุม", acquired: "2019-07-22", price: 18900, vendor: "บจก. ออดิโอ วิชวล", status: "repair", method: "เบิกขาด" },
  { code: "7440-001-0004/64", name: "เครื่องสำรองไฟ UPS 1500VA", cat: "C04", dept: "ศูนย์เทคโนโลยีสารสนเทศ", holder: "ธนกร พงษ์ศรี", loc: "อาคาร 1 ชั้น 3 ห้อง 305", acquired: "2020-11-05", price: 4200, vendor: "บจก. ไอที โซลูชั่น", status: "in_use", method: "เบิกขาด" },
  { code: "7430-006-0002/62", name: "ตู้เย็น 2 ประตู 7 คิว", cat: "C06", dept: "ฝ่ายการพยาบาล", holder: "—", loc: "คลังพัสดุกลาง", acquired: "2018-03-14", price: 9800, vendor: "บจก. อิเล็คทรอนิคส์ มอลล์", status: "disposed", method: "ขายทอดตลาด" },
  { code: "7110-002-0020/66", name: "ตู้เหล็กเก็บเอกสาร 4 ลิ้นชัก", cat: "C02", dept: "ฝ่ายการเงินและพัสดุ", holder: "สมชาย ใจดี", loc: "อาคาร 1 ชั้น 2 ห้อง 201", acquired: "2022-06-08", price: 5600, vendor: "หจก. เฟอร์นิเจอร์ไทย", status: "in_use", method: "เบิกขาด" },
  { code: "5820-004-0010/67", name: "โทรทัศน์ LED 55 นิ้ว", cat: "C04", dept: "ฝ่ายบริการการแพทย์", holder: "—", loc: "คลังพัสดุกลาง", acquired: "2024-01-20", price: 16900, vendor: "บจก. อิเล็คทรอนิคส์ มอลล์", status: "available", method: "—" },
  { code: "7440-001-0009/65", name: "สแกนเนอร์เอกสารความเร็วสูง", cat: "C01", dept: "ฝ่ายการเงินและพัสดุ", holder: "—", loc: "คลังพัสดุกลาง", acquired: "2021-10-11", price: 21000, vendor: "บจก. ออฟฟิศ พลัส", status: "lost", method: "—" },
];

export const REQUISITIONS_MOCK: Requisition[] = [
  { id: "REQ-2567-0042", date: "2024-06-03", requester: "ธนกร พงษ์ศรี", dept: "ศูนย์เทคโนโลยีสารสนเทศ", item: "เครื่องคอมพิวเตอร์โน้ตบุ๊ก", type: "ยืมใช้งาน", purpose: "ใช้ปฏิบัติงานนอกสถานที่ โครงการสำรวจ", status: "pending", approver: "วิภาดา สุขใจ" },
  { id: "REQ-2567-0041", date: "2024-06-02", requester: "อรุณี แสงทอง", dept: "ฝ่ายบริการการแพทย์", item: "โทรทัศน์ LED 55 นิ้ว", type: "เบิกขาด", purpose: "ติดตั้งห้องเรียนอัจฉริยะ", status: "approved", approver: "วิภาดา สุขใจ" },
  { id: "REQ-2567-0040", date: "2024-05-29", requester: "กนกพร วงศ์ทอง", dept: "ฝ่ายการพยาบาล", item: "เก้าอี้สำนักงานบุนวม", type: "เบิกขาด", purpose: "ทดแทนของเดิมที่ชำรุด", status: "disbursed", approver: "วิภาดา สุขใจ" },
  { id: "REQ-2567-0039", date: "2024-05-25", requester: "ธนกร พงษ์ศรี", dept: "ศูนย์เทคโนโลยีสารสนเทศ", item: "เครื่องสำรองไฟ UPS 1500VA", type: "เบิกขาด", purpose: "สำรองไฟห้องเซิร์ฟเวอร์", status: "rejected", approver: "วิภาดา สุขใจ" },
];

export const REPAIRS_MOCK: Repair[] = [
  { id: "RP-2567-0015", date: "2024-06-01", asset: "เครื่องวัดความดันโลหิตดิจิทัล", code: "6515-005-0007/66", reporter: "กนกพร วงศ์ทอง", problem: "หน้าจอแสดงผลค่าผิดพลาด ไม่เสถียร", status: "repairing", vendor: "ศูนย์บริการเมดิคอล" },
  { id: "RP-2567-0014", date: "2024-05-28", asset: "เครื่องโปรเจคเตอร์ LCD", code: "5820-004-0003/63", reporter: "อรุณี แสงทอง", problem: "ภาพเป็นจุดสีและมัว หลอดภาพเสื่อม", status: "waiting", vendor: "—" },
  { id: "RP-2567-0013", date: "2024-05-12", asset: "เครื่องพิมพ์เลเซอร์ขาวดำ", code: "7440-001-0002/67", reporter: "สมชาย ใจดี", problem: "กระดาษติดบ่อย ชุดดึงกระดาษสึก", status: "done", vendor: "บจก. ออฟฟิศ พลัส" },
];

export const DISPOSALS_MOCK: Disposal[] = [
  { id: "DP-2566-0008", date: "2023-09-30", asset: "ตู้เย็น 2 ประตู 7 คิว", code: "7430-006-0002/62", method: "ขายทอดตลาด", reason: "เสื่อมสภาพตามอายุการใช้งาน", value: 850, committee: "คณะกรรมการตรวจสอบพัสดุประจำปี 2566" },
  { id: "DP-2566-0007", date: "2023-09-30", asset: "สแกนเนอร์เอกสารความเร็วสูง", code: "7440-001-0009/65", method: "สูญหาย", reason: "สูญหายระหว่างปฏิบัติงาน (มีรายงานผลการสอบสวนแนบ)", value: 0, committee: "คณะกรรมการสอบข้อเท็จจริง" },
];

export const ACTIVITY_MOCK: Activity[] = [
  { t: "2024-06-03 09:14", who: "ธนกร พงษ์ศรี", action: "ยื่นใบขอเบิก", target: "REQ-2567-0042", tone: "amber" },
  { t: "2024-06-02 15:40", who: "วิภาดา สุขใจ", action: "อนุมัติใบเบิก", target: "REQ-2567-0041", tone: "blue" },
  { t: "2024-06-01 11:02", who: "กนกพร วงศ์ทอง", action: "แจ้งซ่อม", target: "RP-2567-0015", tone: "orange" },
  { t: "2024-05-30 14:25", who: "สมชาย ใจดี", action: "ขึ้นทะเบียนครุภัณฑ์", target: "5820-004-0010/67", tone: "green" },
  { t: "2024-05-29 10:08", who: "สมชาย ใจดี", action: "จ่ายครุภัณฑ์", target: "REQ-2567-0040", tone: "green" },
];

export const REPORTS_STRUCTURE = [
  { group: "ขึ้นทะเบียน", items: [
    { name: "ทะเบียนคุมทรัพย์สิน (แบบกรมบัญชีกลาง)", desc: "รายการครุภัณฑ์ทั้งหมดพร้อมมูลค่าและค่าเสื่อม" },
    { name: "สรุปจำนวน-มูลค่าครุภัณฑ์", desc: "แยกตามหมวดหมู่ / แผนก / ปีงบประมาณ" },
    { name: "รายงานการคำนวณค่าเสื่อมราคาประจำปี", desc: "ค่าเสื่อมสะสมและมูลค่าคงเหลือ" },
  ]},
  { group: "เบิก-จ่าย", items: [
    { name: "สรุปการเบิกจ่ายประจำเดือน/ปี", desc: "ปริมาณและมูลค่าการเบิกจ่าย" },
    { name: "ทะเบียนผู้ยืม-ครอบครองครุภัณฑ์", desc: "ใครถือครองครุภัณฑ์ใดอยู่บ้าง" },
  ]},
  { group: "ส่งคืน-เบิกต่อ", items: [
    { name: "ประวัติการเคลื่อนไหวครุภัณฑ์", desc: "Movement history รายชิ้น" },
    { name: "ครุภัณฑ์คงเหลือในคลัง", desc: "รายการพร้อมจ่าย" },
  ]},
  { group: "จำหน่าย", items: [
    { name: "สรุปการจำหน่ายพัสดุประจำปี", desc: "สำหรับผู้บริหารและ สตง." },
    { name: "เงินรายได้จากการจำหน่ายพัสดุ", desc: "ยอดเงินที่ได้จากการจำหน่าย" },
  ]},
];

// SQL DDL to set up tables in Supabase
export const SUPABASE_DDL_SCRIPT = `-- 1. Create table for Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  life DOUBLE PRECISION NOT NULL,
  dep DOUBLE PRECISION NOT NULL
);

-- 2. Create table for Assets
CREATE TABLE IF NOT EXISTS assets (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cat TEXT NOT NULL,
  dept TEXT NOT NULL,
  holder TEXT NOT NULL,
  loc TEXT NOT NULL,
  acquired TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL,
  method TEXT NOT NULL
);

-- 3. Create table for Requisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  requester TEXT NOT NULL,
  dept TEXT NOT NULL,
  item TEXT NOT NULL,
  type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL,
  approver TEXT NOT NULL
);

-- 4. Create table for Repairs
CREATE TABLE IF NOT EXISTS repairs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  asset TEXT NOT NULL,
  code TEXT NOT NULL,
  reporter TEXT NOT NULL,
  problem TEXT NOT NULL,
  status TEXT NOT NULL,
  vendor TEXT NOT NULL
);

-- 5. Create table for Disposals
CREATE TABLE IF NOT EXISTS disposals (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  asset TEXT NOT NULL,
  code TEXT NOT NULL,
  method TEXT NOT NULL,
  reason TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  committee TEXT NOT NULL
);

-- Enable full read/write permissions for anon public (unauthenticated users)
ALTER TABLE categories enable row level security;
ALTER TABLE assets enable row level security;
ALTER TABLE requisitions enable row level security;
ALTER TABLE repairs enable row level security;
ALTER TABLE disposals enable row level security;

CREATE POLICY "Allow anon select categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow anon insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update categories" ON categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow anon select assets" ON assets FOR SELECT USING (true);
CREATE POLICY "Allow anon insert assets" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update assets" ON assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete assets" ON assets FOR DELETE USING (true);

CREATE POLICY "Allow anon select requisitions" ON requisitions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert requisitions" ON requisitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update requisitions" ON requisitions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete requisitions" ON requisitions FOR DELETE USING (true);

CREATE POLICY "Allow anon select repairs" ON repairs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert repairs" ON repairs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update repairs" ON repairs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete repairs" ON repairs FOR DELETE USING (true);

CREATE POLICY "Allow anon select disposals" ON disposals FOR SELECT USING (true);
CREATE POLICY "Allow anon insert disposals" ON disposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update disposals" ON disposals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete disposals" ON disposals FOR DELETE USING (true);
`;
