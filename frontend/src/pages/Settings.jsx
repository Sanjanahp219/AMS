import React, { useState, useEffect } from "react";
import { Save, Building, Globe, CheckCircle } from "lucide-react";
import { getSettings, updateSettings } from "../services/settingsService";
import "./Settings.css";

export default function Settings() {
  const [formData, setFormData] = useState({
    academyName: "AMS Academy",
    tagline: "Simplifying Academy Management",
    contactEmail: "admin@ams.edu",
    contactPhone: "+91 98765 43210",
    address: "100 Knowledge Boulevard, Tech Hub",
    city: "Bangalore",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAcademySettings = async () => {
      try {
        setLoading(true);
        const res = await getSettings();
        if (res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademySettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Academy Settings</h1>
        <p>Configure academy identity, regional formats, and contact details</p>
      </div>

      {success && (
        <div style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={18} />
          <span>Academy settings updated successfully!</span>
        </div>
      )}

      <div className="settings-card">
        <form onSubmit={handleSubmit}>
          <h2 className="settings-section-title">General Academy Information</h2>

          <div className="form-group">
            <label>Academy Name *</label>
            <input
              type="text"
              required
              value={formData.academyName}
              onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Tagline / Motto</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>City / Location</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <h2 className="settings-section-title" style={{ marginTop: "24px" }}>
            Currency & Regional Settings
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label>Currency Format *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="GBP">British Pound (£ GBP)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time Zone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
