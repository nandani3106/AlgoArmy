import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  getSettings,
  updateSettings,
} from "../../api/settingsApi";

export default function Settings() {
  const { isDark } = useTheme();
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      setForm(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      await updateSettings(form);
      alert("Settings saved!");
    } catch (err) {
      alert("Failed");
    }
  };

  if (!form) return <p>Loading settings...</p>;

  const inp = `border rounded-xl px-4 py-3 ${
    isDark
      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200"
      : ""
  }`;

  const card = `rounded-2xl border shadow-sm p-6 ${
    isDark
      ? "bg-[#151823] border-[#1e293b]"
      : "bg-white"
  }`;

  const label = `flex gap-3 ${
    isDark ? "text-slate-300" : ""
  }`;

  return (
    <>
      <h1
        className={`text-3xl font-bold mb-8 ${
          isDark ? "text-white" : ""
        }`}
      >
        Admin Settings
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* PLATFORM INFO */}
        <div className={card}>
          <h2 className="text-xl font-semibold mb-5">
            Platform Information
          </h2>

          <input
            className={inp}
            value={form.platformName}
            onChange={(e) =>
              handleChange(
                "platformName",
                e.target.value
              )
            }
          />

          <input
            className={`${inp} mt-4`}
            value={form.tagline}
            onChange={(e) =>
              handleChange(
                "tagline",
                e.target.value
              )
            }
          />

          <select
            className={`${inp} mt-4`}
            value={form.language}
            onChange={(e) =>
              handleChange(
                "language",
                e.target.value
              )
            }
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>

        {/* SITE SETTINGS */}
        <div className={card}>
          <h2 className="text-xl font-semibold mb-5">
            Site Settings
          </h2>

          <label className={label}>
            <input
              type="checkbox"
              checked={form.platformLive}
              onChange={() =>
                handleChange(
                  "platformLive",
                  !form.platformLive
                )
              }
            />
            Platform Live
          </label>

          <label className={label}>
            <input
              type="checkbox"
              checked={form.userRegistration}
              onChange={() =>
                handleChange(
                  "userRegistration",
                  !form.userRegistration
                )
              }
            />
            User Registration
          </label>

          <label className={label}>
            <input
              type="checkbox"
              checked={form.emailVerification}
              onChange={() =>
                handleChange(
                  "emailVerification",
                  !form.emailVerification
                )
              }
            />
            Email Verification
          </label>

          <label className={label}>
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={() =>
                handleChange(
                  "maintenanceMode",
                  !form.maintenanceMode
                )
              }
            />
            Maintenance Mode
          </label>
        </div>

        {/* AI SETTINGS */}
        <div className={card}>
          <h2 className="text-xl font-semibold mb-5">
            AI Evaluation
          </h2>

          <select
            className={inp}
            value={form.aiModel}
            onChange={(e) =>
              handleChange(
                "aiModel",
                e.target.value
              )
            }
          >
            <option>GPT-4o</option>
            <option>GPT-4</option>
          </select>

          <select
            className={`${inp} mt-4`}
            value={form.evaluationStrictness}
            onChange={(e) =>
              handleChange(
                "evaluationStrictness",
                e.target.value
              )
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label className={`${label} mt-4`}>
            <input
              type="checkbox"
              checked={form.plagiarismDetection}
              onChange={() =>
                handleChange(
                  "plagiarismDetection",
                  !form.plagiarismDetection
                )
              }
            />
            Plagiarism Detection
          </label>
        </div>

        {/* INTERVIEW SETTINGS */}
        <div className={card}>
          <h2 className="text-xl font-semibold mb-5">
            Interview Settings
          </h2>

          <input
            type="number"
            className={inp}
            value={form.defaultInterviewDuration}
            onChange={(e) =>
              handleChange(
                "defaultInterviewDuration",
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={`${inp} mt-4`}
            value={form.maxInterviewDuration}
            onChange={(e) =>
              handleChange(
                "maxInterviewDuration",
                e.target.value
              )
            }
          />

          <label className={`${label} mt-4`}>
            <input
              type="checkbox"
              checked={form.enableCodeEditor}
              onChange={() =>
                handleChange(
                  "enableCodeEditor",
                  !form.enableCodeEditor
                )
              }
            />
            Enable Code Editor
          </label>

          <label className={label}>
            <input
              type="checkbox"
              checked={form.allowCopyPaste}
              onChange={() =>
                handleChange(
                  "allowCopyPaste",
                  !form.allowCopyPaste
                )
              }
            />
            Allow Copy Paste
          </label>
        </div>
      </div>

      {/* SAVE */}
      <button
        onClick={handleSave}
        className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl"
      >
        Save Settings
      </button>
    </>
  );
}