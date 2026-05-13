import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function Settings() {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    name: "Admin Name", email: "admin@example.com",
    profession: "Platform Administrator", phone: "", company: "AlgoArmy",
    bio: "", skills: "Management, Recruiting, Tech", password: "",
    notifications: true, emailAlerts: true, twoFactor: false, theme: "Light",
    defaultContestDuration: 90, defaultOADuration: 60, defaultInterviewDuration: 30,
  });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });
  const handleSave = () => alert("Settings saved!");
  const handleLogout = () => alert("Logged out");
  const handleDelete = () => { if (window.confirm("Delete account permanently?")) alert("Account deleted"); };

  const inp = `border rounded-xl px-4 py-3 ${isDark ? 'bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500' : ''}`;
  const card = `rounded-2xl border shadow-sm p-6 mb-6 ${isDark ? 'bg-[#151823] border-[#1e293b]' : 'bg-white'}`;
  const h2c = `text-xl font-semibold mb-5 ${isDark ? 'text-white' : ''}`;
  const lbl = `flex gap-3 ${isDark ? 'text-slate-300' : ''}`;

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>Admin Settings</h1>

      {/* Profile */}
      <div className={card}>
        <h2 className={h2c}>Profile Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Full Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inp} />
          <input placeholder="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={inp} />
          <input placeholder="Profession" value={form.profession} onChange={(e) => handleChange("profession", e.target.value)} className={inp} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className={inp} />
          <input placeholder="Company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} className={inp} />
          <input placeholder="Skills" value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} className={inp} />
        </div>
        <textarea placeholder="Bio" rows={4} value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} className={`w-full mt-4 ${inp}`} />
        <input type="password" placeholder="Change Password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} className={`w-full mt-4 ${inp}`} />
      </div>

      {/* Preferences */}
      <div className={card}>
        <h2 className={h2c}>Preferences</h2>
        <div className="space-y-4">
          <label className={lbl}><input type="checkbox" checked={form.notifications} onChange={() => handleChange("notifications", !form.notifications)} /> Notifications</label>
          <label className={lbl}><input type="checkbox" checked={form.emailAlerts} onChange={() => handleChange("emailAlerts", !form.emailAlerts)} /> Email Alerts</label>
          <label className={lbl}><input type="checkbox" checked={form.twoFactor} onChange={() => handleChange("twoFactor", !form.twoFactor)} /> Two Factor Authentication</label>
          <select value={form.theme} onChange={(e) => handleChange("theme", e.target.value)} className={inp}>
            <option>Light</option><option>Dark</option>
          </select>
        </div>
      </div>

      {/* Platform Defaults */}
      <div className={card}>
        <h2 className={h2c}>Platform Defaults</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="number" value={form.defaultContestDuration} onChange={(e) => handleChange("defaultContestDuration", e.target.value)} className={inp} placeholder="Contest Duration" />
          <input type="number" value={form.defaultOADuration} onChange={(e) => handleChange("defaultOADuration", e.target.value)} className={inp} placeholder="OA Duration" />
          <input type="number" value={form.defaultInterviewDuration} onChange={(e) => handleChange("defaultInterviewDuration", e.target.value)} className={inp} placeholder="Interview Duration" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition">Save Settings</button>
        <button onClick={handleLogout} className={`border px-6 py-3 rounded-xl ${isDark ? 'border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]' : ''}`}>Logout</button>
        <button onClick={handleDelete} className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition">Delete Account</button>
      </div>
    </>
  );
}