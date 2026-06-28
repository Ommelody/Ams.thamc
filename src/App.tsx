import { useState, useEffect, useCallback } from 'react';
import { Asset, Requisition, Repair, Disposal, Activity } from './types';
import { 
  CATEGORIES, 
  DEPARTMENTS, 
  LOCATIONS, 
  STATUS_MAP, 
  REQ_STATUS, 
  ACTIVITY_MOCK, 
  thb, 
  thDate,
  ROLES
} from './data';
import { 
  fetchAssets, 
  upsertAsset, 
  fetchRequisitions, 
  upsertRequisition, 
  fetchRepairs, 
  upsertRepair, 
  fetchDisposals, 
  upsertDisposal, 
  getSupabaseStatus, 
  seedSupabaseIfNeeded 
} from './dbService';
import { Icon, I } from './components/Icons';
import { 
  Badge, 
  Card, 
  Btn, 
  PageHead, 
  Field, 
  Input, 
  Select, 
  SearchBox,
  TONES
} from './components/Shared';
import { PrintHost } from './components/FormsPrint';
import { MobileHost, openMobile } from './components/MobileScan';
import { 
  useTweaks, 
  TweaksPanel, 
  TweakSection, 
  TweakColor, 
  TweakRadio, 
  TweakSelect 
} from './components/TweaksPanel';

import { Dashboard } from './components/ViewsDashboard';
import { RegisterView, AssetDetail } from './components/ViewsRegister';
import { RegisterForm, SlideOver } from './components/FormsRegister';
import { RequisitionView } from './components/ViewsRequisition';
import { RepairView, DisposalView, ReturnView } from './components/ViewsOps';
import { ReportsView, AuditView, SettingsView } from './components/ViewsAdmin';
import { AuthView } from './components/Auth';


const NAV = [
  { id: "dashboard", label: "แดชบอร์ด", icon: I.dashboard },
  { id: "register", label: "ทะเบียนครุภัณฑ์", icon: I.register },
  { id: "requisition", label: "เบิก-จ่าย", icon: I.requisition, badge: "pending" },
  { id: "return", label: "ส่งคืน-โอนย้าย", icon: I.return },
  { id: "repair", label: "แจ้งซ่อม", icon: I.repair },
  { id: "disposal", label: "จำหน่าย", icon: I.disposal },
  { id: "audit", label: "ตรวจนับประจำปี", icon: I.audit },
  { id: "reports", label: "รายงาน", icon: I.reports },
  { id: "settings", label: "ตั้งค่าระบบ", icon: I.settings },
];

const TWEAK_DEFAULTS = {
  primary: "#2d6cdf",
  sidebarTone: "#16233a",
  density: "regular",
  navLayout: "sidebar",
  font: "Sarabun"
};

const PRIMARY_SOFT: Record<string, string> = { 
  "#2d6cdf": "#e8f0fe", 
  "#1f7a52": "#e6f4ec", 
  "#9a3a2a": "#f8ebe6", 
  "#5a4ad1": "#ecebfb", 
  "#0f766e": "#e3f4f1" 
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const raw = localStorage.getItem("ams_current_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [role, setRole] = useState<string>(() => {
    const raw = localStorage.getItem("ams_current_user");
    if (raw) {
      const user = JSON.parse(raw);
      const roleMap: Record<string, string> = {
        "เจ้าหน้าที่พัสดุ": "staff",
        "หัวหน้างาน": "approver",
        "ผู้บริหาร": "exec",
        "ผู้ใช้งาน": "user"
      };
      return roleMap[user.role] || "user";
    }
    return "staff";
  });

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("ams_current_user", JSON.stringify(user));
    
    // Map User Role to App role:
    const roleMap: Record<string, string> = {
      "เจ้าหน้าที่พัสดุ": "staff",
      "หัวหน้างาน": "approver",
      "ผู้บริหาร": "exec",
      "ผู้ใช้งาน": "user"
    };
    const appRole = roleMap[user.role] || "user";
    setRole(appRole);
    
    // save state
    const state = { view: "dashboard", role: appRole };
    localStorage.setItem("ams_state", JSON.stringify(state));
    setView("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ams_current_user");
    localStorage.removeItem("ams_state");
  };

  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showForm, setShowForm] = useState<boolean | string>(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [prefilledCode, setPrefilledCode] = useState<string | undefined>(undefined);

  // Supabase Sync States
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [masterKey, setMasterKey] = useState(0);
  const handleMasterDataChange = () => {
    setMasterKey(p => p + 1);
  };
  const [supabaseStatus, setSupabaseStatus] = useState<any>({
    connected: false,
    tablesExist: { assets: false, requisitions: false, repairs: false, disposals: false, categories: false },
    isEmpty: true
  });

  const fire = (msg: string) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 3000); 
  };

  const loadDataFromBackend = useCallback(async () => {
    try {
      const statusRes = await getSupabaseStatus();
      setSupabaseStatus(statusRes);

      const assetsRes = await fetchAssets();
      setAssets(assetsRes.data);

      const reqsRes = await fetchRequisitions();
      setRequisitions(reqsRes.data);

      const repairsRes = await fetchRepairs();
      setRepairs(repairsRes.data);

      const disposalsRes = await fetchDisposals();
      setDisposals(disposalsRes.data);

      // Create fallback activities based on state if empty
      setActivities(ACTIVITY_MOCK);
    } catch (e) {
      console.error("Error loading backend state:", e);
    }
  }, []);

  useEffect(() => {
    loadDataFromBackend();
  }, [loadDataFromBackend]);

  // Persist view + role
  useEffect(() => {
    const s = localStorage.getItem("ams_state");
    if (s) {
      const parsedS = JSON.parse(s);
      if (parsedS.view) setView(parsedS.view); 
      if (parsedS.role) setRole(parsedS.role);
    }
  }, []);

  useEffect(() => { 
    localStorage.setItem("ams_state", JSON.stringify({ view, role })); 
  }, [view, role]);

  // Reset detail when changing view
  useEffect(() => { setSelectedAsset(null); }, [view]);

  // Trigger Seeding Helper
  const triggerDatabaseSeed = async () => {
    const seeded = await seedSupabaseIfNeeded();
    if (seeded) {
      fire("นำเข้าข้อมูลจำลองลง Supabase สำเร็จ!");
      loadDataFromBackend();
    } else {
      fire("ไม่พบคอนเนกชันหรือไม่สามารถเขียนตารางในห้อง Supabase ได้ในขณะนี้");
    }
  };

  // Mutators saving directly into database context
  const handleAddNewAsset = async (newAsset: Asset | Asset[], customMsg?: string) => {
    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: ROLES.find(x => x.id === role)?.name || "เจ้าหน้าที่พัสดุ",
        action: Array.isArray(newAsset) ? "นำเข้าครุภัณฑ์ทั้งหมด" : `ขึ้นทะเบียนครุภัณฑ์ ${newAsset.name}`,
        target: Array.isArray(newAsset) ? "สิทธิ์ Excel Import" : newAsset.code,
        tone: "green"
      },
      ...prev
    ]);

    if (Array.isArray(newAsset)) {
      for (const single of newAsset) {
        await upsertAsset(single);
      }
      fire(customMsg || `นำเข้าครุภัณฑ์จำนวน ${newAsset.length} รายการพัสดุสำเร็จ`);
    } else {
      await upsertAsset(newAsset);
      fire(customMsg || `ขึ้นทะเบียนครุภัณฑ์ ${newAsset.name} เป็นแผ่นพัสดุสำเร็จ`);
    }
    loadDataFromBackend();
  };

  const handleAddNewRequisition = async (newReq: Requisition) => {
    await upsertRequisition(newReq);
    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: newReq.requester,
        action: `ส่งเอกสารขอเบิก ${newReq.item}`,
        target: newReq.id,
        tone: "amber"
      },
      ...prev
    ]);
    fire("ส่งใบขอเบิกพัสดุเข้ารับการพิจารณาตรวจสอบเรียบร้อย");
    loadDataFromBackend();
  };

  const handleStatusChangeRequisition = async (reqId: string, newStatus: Requisition['status']) => {
    const req = requisitions.find(r => r.id === reqId);
    if (!req) return;
    const nextReq: Requisition = { ...req, status: newStatus };
    await upsertRequisition(nextReq);

    // If disburse status, also change the underlying asset to 'in_use' and assign holder!
    if (newStatus === "disbursed") {
      const matchAsset = assets.find(a => a.name === req.item && a.status === 'available');
      if (matchAsset) {
        await upsertAsset({
          ...matchAsset,
          status: 'in_use',
          holder: req.requester,
          dept: req.dept,
          method: req.type
        });
      }
    }

    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: ROLES.find(x => x.id === role)?.name || "ผู้จัดการพัสดุ",
        action: newStatus === 'approved' ? `อนุมัติการใบเบิก` : newStatus === 'disbursed' ? `จ่ายมอบและยกส่งครุภัณฑ์` : "ปฏิเสธพยานใบเบิก",
        target: reqId,
        tone: newStatus === 'approved' ? "blue" : newStatus === 'disbursed' ? "green" : "red"
      },
      ...prev
    ]);

    fire(`ดำเนินการปรับคิวสถานะแถบใบเบิก ${reqId} สำเร็จ`);
    loadDataFromBackend();
  };

  const handleAddNewRepair = async (newRep: Repair) => {
    await upsertRepair(newRep);
    
    // Change corresponding asset status to 'repair'
    const matchingAsset = assets.find(a => a.code === newRep.code);
    if (matchingAsset) {
      await upsertAsset({
        ...matchingAsset,
        status: 'repair'
      });
    }

    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: newRep.reporter,
        action: "แจ้งพัสดุชำรุดส่งช่าง",
        target: newRep.id,
        tone: "orange"
      },
      ...prev
    ]);

    fire("ยื่นเรื่องแจ้งซ่อมแซมพัสดุกองรหัสเรียบร้อย");
    loadDataFromBackend();
  };

  const handleAddNewDisposal = async (newDisp: Disposal) => {
    await upsertDisposal(newDisp);

    // Change corresponding asset status to 'disposed' or 'lost'
    const matchingAsset = assets.find(a => a.code === newDisp.code);
    if (matchingAsset) {
      await upsertAsset({
        ...matchingAsset,
        status: newDisp.method === "สูญหาย" ? 'lost' : 'disposed'
      });
    }

    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: ROLES.find(x => x.id === role)?.name || "เจ้าหน้าที่พัสดุ",
        action: `เสนอตัดสถานะครุภัณฑ์ ${newDisp.method}`,
        target: newDisp.id,
        tone: "red"
      },
      ...prev
    ]);

    fire("จัดทำบันทึกจำหน่ายพัสดุออกพอร์ตรวมเสร็จสมบูรณ์");
    loadDataFromBackend();
  };

  const handleMutateAssetStatus = async (assetCode: string, fields: Partial<Asset>) => {
    const a = assets.find(x => x.code === assetCode);
    if (!a) return;
    await upsertAsset({
      ...a,
      ...fields
    });
    
    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: ROLES.find(x => x.id === role)?.name || "เจ้าหน้าที่พัสดุ",
        action: `ปรับคุณสมบัติผู้ถือพัสดุคุม`,
        target: assetCode,
        tone: "blue"
      },
      ...prev
    ]);
    fire(`อัปเกรดสถานะพัสดุ ${assetCode} ในฐานข้อมูลเรียบร้อย`);
    loadDataFromBackend();
  };

  const handleBatchDisburse = async (data: { codeList: string[]; dept: string; recipient: string; type: string }) => {
    for (const code of data.codeList) {
      const match = assets.find(a => a.code === code);
      if (match) {
        await upsertAsset({
          ...match,
          status: "in_use",
          holder: data.recipient,
          dept: data.dept,
          method: data.type
        });
      }
    }
    setActivities(prev => [
      {
        t: new Date().toISOString().replace('T', ' ').substring(0, 16),
        who: ROLES.find(x => x.id === role)?.name || "เจ้าหน้าที่พัสดุ",
        action: `จ่ายพัสดุสะสมยอดรวมออกเขต`,
        target: `คิวรวม ${data.codeList.length} รายการ`,
        tone: "green"
      },
      ...prev
    ]);
    fire(`ออกใบส่งจ่ายและมอบสิทธิ์รวมสมาชิกรวม ${data.codeList.length} รายการสำเร็จ`);
    loadDataFromBackend();
  };

  const handleAuditAsset = async (code: string) => {
    fire(`ตรวจยืนยันคุมพัสดุรหัส ${code} สภาพปกติผ่านเกณฑ์ปีงบ 2567`);
    loadDataFromBackend();
  };

  // Nav items density and variables
  const density = { compact: 16, regular: 22, comfy: 28 }[t.density] || 22;
  const fontCSS = t.font === "Sarabun" ? "'Sarabun', sans-serif" : t.font === "Noto Sans Thai" ? "'Noto Sans Thai', sans-serif" : "'IBM Plex Sans Thai', sans-serif";
  const vars: any = {
    "--primary": t.primary,
    "--primary-soft": PRIMARY_SOFT[t.primary] || "#e8f0fe",
    "--sidebar": t.sidebarTone,
    "--card-pad": density + "px",
    "--font": fontCSS,
  };

  if (!currentUser) {
    return (
      <div style={vars}>
        <AuthView onLogin={handleLogin} />
      </div>
    );
  }

  // nav visibility by RBAC role policy
  const allowedNavs: string[] = {
    staff: NAV.map(n => n.id),
    approver: ["dashboard", "requisition", "register", "repair", "reports"],
    user: ["dashboard", "register", "requisition", "return", "repair"],
    exec: ["dashboard", "register", "reports", "audit"],
  }[role] || NAV.map(n => n.id);

  function renderView() {
    if (view === "register" && selectedAsset) {
      return <AssetDetail asset={selectedAsset} back={() => setSelectedAsset(null)} />;
    }
    switch (view) {
      case "dashboard": 
        return <Dashboard role={role} setView={setView} openAsset={(a) => { setView("register"); setSelectedAsset(a); }} assets={assets} requisitions={requisitions} activities={activities} />;
      case "register": 
        return <RegisterView query={query} assets={assets} openAsset={setSelectedAsset} openForm={() => setShowForm(true)} />;
      case "requisition": 
        return <RequisitionView role={role} requisitions={requisitions} assets={assets} openForm={() => setShowForm("req")} onStatusChange={handleStatusChangeRequisition} onBatchDisburse={handleBatchDisburse} />;
      case "return": 
        return <ReturnView assets={assets} onMutateAssetStatus={handleMutateAssetStatus} />;
      case "repair": 
        return <RepairView repairs={repairs} assets={assets} onAddRepair={handleAddNewRepair} />;
      case "disposal": 
        return <DisposalView disposals={disposals} assets={assets} onAddDisposal={handleAddNewDisposal} />;
      case "audit": 
        return <AuditView assets={assets} onAuditAsset={handleAuditAsset} />;
      case "reports": 
        return <ReportsView assets={assets} requisitions={requisitions} disposals={disposals} />;
      case "settings": 
        return <SettingsView supabaseStatus={supabaseStatus} onTriggerSeed={triggerDatabaseSeed} onMasterDataChange={handleMasterDataChange} />;
      default: 
        return <Dashboard role={role} setView={setView} openAsset={setSelectedAsset} assets={assets} requisitions={requisitions} activities={activities} />;
    }
  }

  const topbar = (
    <header style={{
      height: 64, background: "var(--surface)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 16, padding: "0 26px", position: "sticky", top: 0, zIndex: 30,
    }}>
      <SearchBox value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหารหัสคุม / ชื่อรายการพัสดุครุภัณฑ์..." width={340} />
      
      <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
        {supabaseStatus.connected ? (
          <span style={{ fontSize: 12.8, background: "#f0fdf4", color: "#166534", border: "1.5px solid #bbf7d0", padding: "4px 10px", borderRadius: 8, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "green", display: "inline-block" }} /> Database: Supabase Link: rduvaovnnrifdgrfeumr
          </span>
        ) : (
          <span style={{ fontSize: 12.8, background: "#fffbeb", color: "#92400e", border: "1.5px solid #fef3c7", padding: "4px 10px", borderRadius: 8, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "#d97706", display: "inline-block" }} /> Database: Local Cache Fallback
          </span>
        )}
      </div>

      {/* Mobile QR scanner mockup trigger */}
      <Btn variant="default" onClick={() => openMobile(assets[2] || assets[0])} style={{ border: "1.5px solid var(--border)" }}>
        <Icon d={I.qr} size={18} stroke="var(--primary)" /> จำลองสแกน QR มือถือ
      </Btn>

      {/* Notifications bell dropdown selector */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setNotifOpen(o => !o); setRoleOpen(false); }} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text)" }}>
          <Icon d={I.bell} size={20} />
          {requisitions.filter(r => r.status === 'pending').length > 0 && (
            <span style={{ position: "absolute", top: 7, right: 8, width: 8, height: 8, borderRadius: 99, background: "#e23b3b", border: "2px solid var(--surface)" }} />
          )}
        </button>
        {notifOpen && <NotifPanel requisitions={requisitions} />}
      </div>

      {/* Active User / Profile Card */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setRoleOpen(o => !o); setNotifOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: "5px 12px 5px 6px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16 }}>
            {currentUser?.name ? currentUser.name[0] : "U"}
          </div>
          <div style={{ textAlign: "left", lineHeight: 1.25, whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{currentUser?.name || "ผู้ใช้งาน"}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{currentUser?.role || "ผู้ใช้งานทั่วไป"}</div>
          </div>
          <span style={{ transform: "rotate(90deg)", marginLeft: 4 }}><Icon d={I.chevron} size={16} stroke="var(--muted)" /></span>
        </button>
        
        {roleOpen && (
          <div style={{ position: "absolute", right: 0, top: 50, width: 280, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 12px 32px rgba(20,35,58,.16)", padding: "16px 14px", zIndex: 40 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>ข้อมูลผู้เข้าใช้งานระบบ</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{currentUser?.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>Username: @{currentUser?.username}</div>
              <div style={{ fontSize: 12.5, color: "var(--text)", marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                <div><b>ฝ่าย:</b> {currentUser?.dept || "-"}</div>
                <div><b>ตำแหน่ง:</b> {currentUser?.title || "-"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "var(--hover)", borderRadius: 6, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9, background: "green" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>สิทธิ์ระบบ: <span style={{ color: "var(--primary)" }}>{currentUser?.role}</span></span>
            </div>

            <button 
              onClick={handleLogout} 
              style={{
                width: "100%", padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", 
                fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#ef4444",
                textAlign: "center"
              }}
            >
              ออกจากระบบ (Logout)
            </button>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div style={{ ...vars, fontFamily: "var(--font)", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}
      onClick={() => { if (notifOpen) setNotifOpen(false); if (roleOpen) setRoleOpen(false); }}>

      {t.navLayout === "sidebar" ? (
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          
          <aside style={{
            width: 252, flexShrink: 0, background: "var(--sidebar)", color: "#cdd7e6",
            display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
          }}>
            <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,.2)" }}>
                <Icon d={I.box} size={23} stroke="#fff" />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15.5 }}>ระบบจัดการทะเบียนครุภัณฑ์</div>
                <div style={{ fontSize: 12, color: "#8294ad" }}>ศูนย์การแพทย์ธรรมศาสตร์</div>
              </div>
            </div>

            <nav style={{ padding: "12px 12px", flex: 1, overflowY: "auto" }}>
              {NAV.filter(n => allowedNavs.includes(n.id)).map(n => {
                const active = view === n.id;
                return (
                  <button key={n.id} onClick={() => setView(n.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
                    fontFamily: "inherit", fontSize: 14.5, fontWeight: active ? 600 : 500,
                    background: active ? "rgba(255,255,255,.10)" : "transparent",
                    color: active ? "#fff" : "#aebacb",
                    boxShadow: active ? "inset 3px 0 0 var(--primary)" : "none",
                  }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                    <Icon d={n.icon} size={20} stroke={active ? "#fff" : "#8294ad"} />
                    <span style={{ flex: 1 }}>{n.label}</span>
                    {n.badge === "pending" && requisitions.filter(r => r.status === "pending").length > 0 && (
                      <span style={{ background: "var(--primary)", color: "#fff", fontSize: 11.5, fontWeight: 700, borderRadius: 99, minWidth: 19, height: 19, display: "grid", placeItems: "center", padding: "0 5px" }}>
                        {requisitions.filter(r => r.status === "pending").length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 12, color: "#71819a", lineHeight: 1.5 }}>
              <div style={{ color: "#9fb0c6", fontWeight: 600 }}>องค์การบริหารส่วนตำบล</div>
              ปีงบประมาณ 2567 · v1.0
            </div>
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            {topbar}
            <main style={{ padding: "26px 30px 60px", maxWidth: 1320, margin: "0 auto" }}>{renderView()}</main>
          </div>
        </div>
      ) : (
        <div>
          {topbar}
          {/* Horizontal top bar helper layout */}
          <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 30px", display: "flex", gap: 2, overflowX: "auto", position: "sticky", top: 64, zIndex: 25 }}>
            {NAV.filter(n => allowedNavs.includes(n.id)).map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 14px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                color: view === n.id ? "var(--primary)" : "var(--muted)", borderBottom: view === n.id ? "2.5px solid var(--primary)" : "2.5px solid transparent" }}>
                <Icon d={n.icon} size={18} stroke={view === n.id ? "var(--primary)" : "var(--muted)"} />{n.label}
              </button>
            ))}
          </div>
          <main style={{ padding: "26px 30px 60px", maxWidth: 1320, margin: "0 auto" }}>{renderView()}</main>
        </div>
      )}

      {showForm === true && (
        <RegisterForm 
          onClose={() => { setShowForm(false); setPrefilledCode(undefined); }} 
          onDone={handleAddNewAsset} 
          initialCode={prefilledCode}
        />
      )}
      
      {showForm === "req" && (
        <ReqQuickForm 
          onClose={() => setShowForm(false)} 
          onSubmit={handleAddNewRequisition} 
          assets={assets}
        />
      )}

      <PrintHost />
      <MobileHost 
        assets={assets} 
        onRegisterCode={(code) => { 
          setPrefilledCode(code); 
          setShowForm(true); 
        }} 
      />

      {toast && (
        <div className="animate-slideUp" style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 80,
          background: "var(--text)", color: "#fff", padding: "13px 22px", borderRadius: 11, fontSize: 14.5, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 28px rgba(20,35,58,.3)" }}>
          <Icon d={I.check} size={19} stroke="#5fd58a" />{toast}
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="แบรนด์ความงามขององค์กร" />
        <TweakColor label="รูปแบบสีหลัก (Primary)" value={t.primary} options={["#2d6cdf", "#1f7a52", "#9a3a2a", "#5a4ad1", "#0f766e"]} onChange={v => setTweak("primary", v)} />
        <TweakColor label="โทนแถบเมนู (Sidebar)" value={t.sidebarTone} options={["#16233a", "#1c2433", "#13322a", "#241c33"]} onChange={v => setTweak("sidebarTone", v)} />
        <TweakSection label="การจักสรรหน้าจอสัมผัส" />
        <TweakRadio label="รูปแบบเลย์เอาต์การนำทาง" value={t.navLayout} options={["sidebar", "topbar"]} onChange={v => setTweak("navLayout", v)} />
        <TweakRadio label="ขนาดช่องช่องไฟ (Density)" value={t.density} options={["compact", "regular", "comfy"]} onChange={v => setTweak("density", v)} />
        <TweakSection label="การคุมฟอนต์อักษร" />
        <TweakSelect label="แบบฟอนต์หลัก" value={t.font} options={["Sarabun", "Noto Sans Thai", "IBM Plex Sans Thai"]} onChange={v => setTweak("font", v)} />
      </TweaksPanel>
    </div>
  );
}

// Subordinate Notifications drop-down component
function NotifPanel({ requisitions }: { requisitions: Requisition[] }) {
  const pendingList = requisitions.filter(r => r.status === 'pending');
  return (
    <div style={{ position: "absolute", right: 0, top: 50, width: 360, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 12px 32px rgba(20,35,58,.16)", zIndex: 40, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>กระดานแจ้งเตือน (LINE/Email)</span>
        <span style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>LINE Notify เชื่อมข่าย</span>
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {pendingList.map((req, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fdf3e0", color: "#b45309", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon d={I.requisition} size={18} />
            </div>
            <div style={{ flex: 1, lineHeight: 1.4 }}>
              <div style={{ fontSize: 13.8, fontWeight: 600, color: "var(--text)" }}>ใบคำขอเบิกพัสดุมารออนุมัติ</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{req.id} · {req.requester} ขอเบิก {req.item}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>เมื่อไม่กี่นาทีที่แล้ว</div>
            </div>
          </div>
        ))}
        {pendingList.length === 0 && (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)" }}>ไม่มีเรื่องคลังพัสดุรับแจ้งเตือนที่รอดำเนินการ</div>
        )}
      </div>
    </div>
  );
}

// Requisition Form
interface ReqQuickFormProps {
  onClose: () => void;
  onSubmit: (r: Requisition) => void;
  assets: Asset[];
}

function ReqQuickForm({ onClose, onSubmit, assets }: ReqQuickFormProps) {
  const avail = assets.filter(a => a.status === 'available');
  const [selectedAssetCode, setSelectedAssetCode] = useState(avail[0]?.code || "");
  const [type, setType] = useState("เบิกขาด");
  const [purpose, setPurpose] = useState("");
  const [requester, setRequester] = useState("ธนกร พงษ์ศรี");
  const [dept, setDept] = useState("ศูนย์เทคโนโลยีสารสนเทศ");

  const handleSave = () => {
    if (!purpose) {
      alert("โปรดระบุวัตถุประสงค์ความต้องการเบิกใช้งาน");
      return;
    }
    const match = assets.find(a => a.code === selectedAssetCode);
    const newReq: Requisition = {
      id: "REQ-2567-0" + Math.floor(10 + Math.random() * 89),
      date: new Date().toISOString().split('T')[0],
      requester,
      dept,
      item: match ? match.name : "ครุภัณฑ์คอมพิวเตอร์",
      type,
      purpose,
      status: "pending",
      approver: "วิภาดา สุขใจ · ผู้อำนวยการส่วนงาน",
    };
    onSubmit(newReq);
    onClose();
  };

  return (
    <SlideOver title="เขียนแบบฟอร์มคำขอเบิกครุภัณฑ์" subtitle="ยื่นคำร้องเสนอหัวหน้าฝ่ายสิทธิ์งานเป็นขั้นรับอนุมัติคลัง" onClose={onClose}
      footer={
        <>
          <Btn variant="default" onClick={onClose}>ยกเลิก</Btn>
          <Btn variant="primary" icon={I.check} onClick={handleSave}>ส่งเรื่องรออนุมัติ</Btn>
        </>
      }>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="เลือกครุภัณฑ์พัสดุที่ต้องการจากคลัง" required>
          <Select value={selectedAssetCode} onChange={e => setSelectedAssetCode(e.target.value)}>
            {avail.map(a => (
              <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
            ))}
          </Select>
        </Field>
        <Field label="ประเภทลักษณะสิทธิ์ขอเบิก" required>
          <Select value={type} onChange={e => setType(e.target.value)}>
            <option value="เบิกขาด">เบิกขาดเข้าราชการ</option>
            <option value="ยืมใช้งาน">ยืมพัสดุชั่วคราว</option>
          </Select>
        </Field>
        <Field label="ชื่อผู้จัดขอส่งพัสดุ" required>
          <Input value={requester} onChange={e => setRequester(e.target.value)} />
        </Field>
        <Field label="หน่วยงาน/ฝ่ายผู้จัดเบิก" required>
          <Select value={dept} onChange={e => setDept(e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="วัตถุประสงค์ และเป้าหมายการเบิก" required>
          <textarea rows={3} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="เช่น เพื่อจัดปูพัสดุสำหรับห้องศูนย์คอมพิวเตอร์งบประมาณใหม่..." 
            style={{ fontFamily: "inherit", fontSize: 14.5, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", width: "100%", boxSizing: "border-box", resize: "vertical" }} />
        </Field>
      </div>
    </SlideOver>
  );
}
