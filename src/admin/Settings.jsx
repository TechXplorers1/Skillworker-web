import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebase";
import "../styles/Settings.css";

const Settings = () => {
  const [settings, setSettings] = useState({
    supportEmail: "",
    supportPhone: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: ""
  });

  useEffect(() => {
    const settingsRef = ref(database, "contact_settings");
    onValue(settingsRef, (snapshot) => {
      const settingsData = snapshot.val();
      if (settingsData) {
        setSettings({
          supportEmail: settingsData.support_email || "",
          supportPhone: settingsData.support_phone || "",
          facebookUrl: settingsData.facebook_url || "",
          instagramUrl: settingsData.instagram_url || "",
          twitterUrl: settingsData.twitter_url || ""
        });
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const saveSettings = async () => {
    const settingsRef = ref(database, "contact_settings");
    try {
      await set(settingsRef, {
        support_email: settings.supportEmail,
        support_phone: settings.supportPhone,
        facebook_url: settings.facebookUrl,
        instagram_url: settings.instagramUrl,
        twitter_url: settings.twitterUrl
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("An error occurred while saving settings.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-section">
        <h2>Support & Contact Settings</h2>
        
        <div className="form-grid">
            <div className="form-group">
                <label>Support Email</label>
                <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
                />
            </div>

            <div className="form-group">
                <label>Support Phone</label>
                <input
                type="text"
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleInputChange}
                />
            </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Social Media Links</h2>
        <div className="form-group">
            <label>Facebook URL</label>
            <input
                type="url"
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
            />
        </div>
        <div className="form-group">
            <label>Instagram URL</label>
            <input
                type="url"
                name="instagramUrl"
                value={settings.instagramUrl}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourprofile"
            />
        </div>
        <div className="form-group">
            <label>Twitter URL</label>
            <input
                type="url"
                name="twitterUrl"
                value={settings.twitterUrl}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourhandle"
            />
        </div>
      </div>
      
      <button className="save-button" onClick={saveSettings}>
        Save All Settings
      </button>
    </div>
  );
};

export default Settings;