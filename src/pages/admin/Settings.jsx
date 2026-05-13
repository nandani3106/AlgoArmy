import { useState } from "react";

export default function Settings() {
  const [form, setForm] = useState({
    name: "Admin Name",
    email: "admin@example.com",
    profession: "Platform Administrator",
    phone: "",
    company: "AlgoArmy",
    bio: "",
    skills: "Management, Recruiting, Tech",
    password: "",
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    theme: "Light",
    defaultContestDuration: 90,
    defaultOADuration: 60,
    defaultInterviewDuration: 30,
  });

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSave = () => {
    alert("Settings saved!");
  };

  const handleLogout = () => {
    alert("Logged out");
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Delete account permanently?"
    );

    if (confirmDelete) {
      alert("Account deleted");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        Admin Settings
      </h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5">
          Profile Information
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Profession"
            value={form.profession}
            onChange={(e) =>
              handleChange(
                "profession",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              handleChange(
                "phone",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              handleChange(
                "company",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Skills"
            value={form.skills}
            onChange={(e) =>
              handleChange(
                "skills",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />
        </div>

        <textarea
          placeholder="Bio"
          rows={4}
          value={form.bio}
          onChange={(e) =>
            handleChange(
              "bio",
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3 mt-4"
        />

        <input
          type="password"
          placeholder="Change Password"
          value={form.password}
          onChange={(e) =>
            handleChange(
              "password",
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3 mt-4"
        />
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5">
          Preferences
        </h2>

        <div className="space-y-4">
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={() =>
                handleChange(
                  "notifications",
                  !form.notifications
                )
              }
            />
            Notifications
          </label>

          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.emailAlerts}
              onChange={() =>
                handleChange(
                  "emailAlerts",
                  !form.emailAlerts
                )
              }
            />
            Email Alerts
          </label>

          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.twoFactor}
              onChange={() =>
                handleChange(
                  "twoFactor",
                  !form.twoFactor
                )
              }
            />
            Two Factor Authentication
          </label>

          <select
            value={form.theme}
            onChange={(e) =>
              handleChange(
                "theme",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          >
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
      </div>

      {/* Platform Defaults */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5">
          Platform Defaults
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="number"
            value={form.defaultContestDuration}
            onChange={(e) =>
              handleChange(
                "defaultContestDuration",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
            placeholder="Contest Duration"
          />

          <input
            type="number"
            value={form.defaultOADuration}
            onChange={(e) =>
              handleChange(
                "defaultOADuration",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
            placeholder="OA Duration"
          />

          <input
            type="number"
            value={form.defaultInterviewDuration}
            onChange={(e) =>
              handleChange(
                "defaultInterviewDuration",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
            placeholder="Interview Duration"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl"
        >
          Save Settings
        </button>

        <button
          onClick={handleLogout}
          className="border px-6 py-3 rounded-xl"
        >
          Logout
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-6 py-3 rounded-xl"
        >
          Delete Account
        </button>
      </div>
    </>
  );
}