import React, { useState, useEffect } from 'react';
import { Card, Btn } from './Shared';
import { Icon, I } from './Icons';
import { DEPARTMENTS } from '../data';

interface AuthProps {
  onLogin: (user: any) => void;
}

export function AuthView({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration fields
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regDept, setRegDept] = useState(DEPARTMENTS[0] || "ฝ่ายบริหารทั่วไป");
  const [regRole, setRegRole] = useState("ผู้ใช้งาน");
  const [regTitle, setRegTitle] = useState("นักวิชาการปฏิบัติการ");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize users list with Admin default
  useEffect(() => {
    const existing = localStorage.getItem("ams_users");
    if (!existing) {
      const defaultUsers = [
        {
          username: "Admin",
          password: "1234",
          name: "ผู้ดูแลระบบ (Admin)",
          role: "เจ้าหน้าที่พัสดุ",
          dept: "ฝ่ายการเงินและพัสดุ",
          title: "ผู้จัดการพัสดุระบบสูงสุด"
        },
        {
          username: "somchai",
          password: "1234",
          name: "สมชาย ใจดี",
          role: "เจ้าหน้าที่พัสดุ",
          dept: "ฝ่ายการเงินและพัสดุ",
          title: "นักวิชาการพัสดุชำนาญการ"
        },
        {
          username: "wiphada",
          password: "1234",
          name: "วิภาดา สุขใจ",
          role: "หัวหน้างาน",
          dept: "ฝ่ายวิศวกรรมการแพทย์",
          title: "หัวหน้าฝ่ายวิศวกรรมการแพทย์"
        }
      ];
      localStorage.setItem("ams_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const getUsers = () => {
    const raw = localStorage.getItem("ams_users");
    return raw ? JSON.parse(raw) : [];
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();
    const match = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (match) {
      onLogin(match);
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regUser || !regPass || !regName) {
      setError("โปรดกรอกข้อมูลให้ครบถ้วนทุกช่อง");
      return;
    }

    const users = getUsers();
    if (users.some((u: any) => u.username.toLowerCase() === regUser.toLowerCase())) {
      setError("มีชื่อผู้ใช้นี้ในระบบแล้ว โปรดใช้ชื่ออื่น");
      return;
    }

    const newUser = {
      username: regUser,
      password: regPass,
      name: regName,
      role: regRole,
      dept: regDept,
      title: regTitle
    };

    const updated = [...users, newUser];
    localStorage.setItem("ams_users", JSON.stringify(updated));

    // Also insert into master data People list so they appear in setting / select forms!
    const rawPeople = localStorage.getItem("ams_people");
    const currentPeople = rawPeople ? JSON.parse(rawPeople) : [];
    const pId = "U" + String(currentPeople.length + 1).padStart(2, '0');
    currentPeople.push({
      id: pId,
      name: regName,
      role: regRole,
      dept: regDept,
      title: regTitle
    });
    localStorage.setItem("ams_people", JSON.stringify(currentPeople));

    setSuccess("ลงทะเบียนเข้าใช้งานสำเร็จแล้ว! โปรดเข้าสู่ระบบ");
    setIsLogin(true);
    setUsername(regUser);
    setPassword(regPass);
    
    // Clear registration fields
    setRegUser("");
    setRegPass("");
    setRegName("");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 50% 50%, #fcfbf9 0%, #f4f2ee 100%)",
      padding: 24, fontFamily: "var(--font-sans)"
    }}>
      <div style={{ width: "100%", maxWidth: 440 }} className="animate-fadeIn">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "var(--primary)",
            display: "grid", placeItems: "center", margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(45, 108, 223, 0.25)"
          }}>
            <Icon d={I.box} size={30} stroke="#fff" />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-.02em" }}>
            AMS THAMC
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>
            ระบบบริหารจัดการพัสดุและครุภัณฑ์ · ศูนย์การแพทย์ธรรมศาสตร์
          </p>
        </div>

        <Card style={{ padding: 32, boxShadow: "0 10px 30px rgba(20,35,58,0.06)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 10, borderBottom: "1.5px solid var(--border)", marginBottom: 24, paddingBottom: 2 }}>
            <button
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              style={{
                flex: 1, padding: "8px 0 12px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700,
                color: isLogin ? "var(--primary)" : "var(--muted)",
                borderBottom: isLogin ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                marginBottom: -3.5
              }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              style={{
                flex: 1, padding: "8px 0 12px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700,
                color: !isLogin ? "var(--primary)" : "var(--muted)",
                borderBottom: !isLogin ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                marginBottom: -3.5
              }}
            >
              ลงทะเบียนใหม่
            </button>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5",
              padding: "12px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              display: "flex", gap: 8, marginBottom: 18, lineHeight: 1.4
            }}>
              <Icon d={I.alert} size={18} stroke="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div style={{
              background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
              padding: "12px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              display: "flex", gap: 8, marginBottom: 18, lineHeight: 1.4
            }}>
              <Icon d={I.check} size={18} stroke="#166534" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{success}</div>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ชื่อผู้ใช้งาน (Username)</label>
                <input
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้... (Admin)"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)",
                    fontSize: 14.5, background: "var(--surface)", color: "var(--text)", outline: "none",
                    transition: "border-color .15s"
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>รหัสผ่าน (Password)</label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่าน... (1234)"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border)",
                    fontSize: 14.5, background: "var(--surface)", color: "var(--text)", outline: "none",
                    transition: "border-color .15s"
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              <div style={{ marginTop: 8 }}>
                <Btn type="submit" variant="primary" style={{ width: "100%", padding: "11px 0", fontSize: 15, borderRadius: 8 }}>
                  เข้าสู่ระบบ
                </Btn>
              </div>

              <div style={{ textAlign: "center", marginTop: 8, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                เข้าระบบผู้ดูแลหลักด้วยผู้ใช้: <b style={{ color: "var(--text)" }}>Admin</b> รหัสผ่าน: <b style={{ color: "var(--text)" }}>1234</b>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ชื่อบัญชีผู้ใช้ (Username)</label>
                <input
                  type="text"
                  placeholder="ภาษาอังกฤษไม่มีช่องว่าง..."
                  required
                  value={regUser}
                  onChange={e => setRegUser(e.target.value.replace(/\s+/g, ""))}
                  style={{
                    padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                    fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>รหัสผ่านเข้าใช้งาน</label>
                <input
                  type="password"
                  placeholder="กำหนดรหัสผ่าน..."
                  required
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                    fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ชื่อ - นามสกุลจริง</label>
                <input
                  type="text"
                  placeholder="เช่น พญ. สุชาดา วิเศษคุณ..."
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                    fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ตำแหน่งทางวิชาการ/วิชาชีพ</label>
                <input
                  type="text"
                  placeholder="เช่น แพทย์ชำนาญการ..."
                  required
                  value={regTitle}
                  onChange={e => setRegTitle(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                    fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ฝ่ายสังกัดแพทย์</label>
                  <select
                    value={regDept}
                    onChange={e => setRegDept(e.target.value)}
                    style={{
                      padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                      fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none", width: "100%"
                    }}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>ระดับสิทธิ์หลัก</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value)}
                    style={{
                      padding: "8px 12px", borderRadius: 7, border: "1.5px solid var(--border)",
                      fontSize: 14, background: "var(--surface)", color: "var(--text)", outline: "none", width: "100%"
                    }}
                  >
                    <option value="ผู้ใช้งาน">ผู้ใช้งานทั่วไป</option>
                    <option value="เจ้าหน้าที่พัสดุ">เจ้าหน้าที่พัสดุ</option>
                    <option value="หัวหน้างาน">หัวหน้างานอนุมัติ</option>
                    <option value="ผู้บริหาร">ผู้บริหารสูงสุด</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <Btn type="submit" variant="success" style={{ width: "100%", padding: "10px 0", fontSize: 14.5, borderRadius: 7 }}>
                  ยืนยันการลงทะเบียน
                </Btn>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
