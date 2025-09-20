import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../firebase";
import "../styles/Settings.css";

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "StillWorkers",
    siteDescription: "Connect with skilled professionals",
    supportEmail: "",
    supportPhone: "",
    socialMedia: []
  });

  const [newSocialMedia, setNewSocialMedia] = useState({
    platform: "",
    url: ""
  });

  useEffect(() => {
    const settingsRef = ref(database, "contact_settings");
    onValue(settingsRef, (snapshot) => {
      const settingsData = snapshot.val();
      if (settingsData) {
        setSettings({
          siteName: "StillWorkers", // Keeping these as hardcoded for now, as they're not in the provided JSON
          siteDescription: "Connect with skilled professionals", // Same as above
          supportEmail: settingsData.support_email,
          supportPhone: settingsData.support_phone,
          socialMedia: [
            { platform: "Facebook", url: settingsData.facebook_url },
            { platform: "Instagram", url: settingsData.instagram_url },
            { platform: "Twitter", url: settingsData.twitter_url }
          ]
        });
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSocialMediaChange = (e, index) => {
    const { name, value } = e.target;
    const updatedSocialMedia = [...settings.socialMedia];
    updatedSocialMedia[index][name] = value;
    
    setSettings({
      ...settings,
      socialMedia: updatedSocialMedia
    });
  };

  const handleNewSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setNewSocialMedia({
      ...newSocialMedia,
      [name]: value
    });
  };

  const addSocialMedia = () => {
    if (newSocialMedia.platform && newSocialMedia.url) {
      setSettings({
        ...settings,
        socialMedia: [...settings.socialMedia, newSocialMedia]
      });
      setNewSocialMedia({ platform: "", url: "" });
    }
  };

  const saveSettings = async () => {
    const settingsRef = ref(database, "contact_settings");
    try {
      await set(settingsRef, {
        support_email: settings.supportEmail,
        support_phone: settings.supportPhone,
        facebook_url: settings.socialMedia.find(s => s.platform === 'Facebook')?.url,
        instagram_url: settings.socialMedia.find(s => s.platform === 'Instagram')?.url,
        twitter_url: settings.socialMedia.find(s => s.platform === 'Twitter')?.url
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
        <h2>General Settings</h2>
        
        <div className="form-group">
          <label>Site Name</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Site Description</label>
          <input
            type="text"
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleInputChange}
          />
        </div>

        <button className="save-button" onClick={saveSettings}>
          Save General Settings
        </button>
      </div>

      <div className="divider"></div>

      <div className="settings-section">
        <h2>Support & Contact Settings</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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

        <h3 style={{ margin: '16px 0', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Social Media Links</h3>
        
        <table className="social-media-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {settings.socialMedia.map((social, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    name="platform"
                    value={social.platform}
                    onChange={(e) => handleSocialMediaChange(e, index)}
                    style={{ width: '100%', border: 'none', background: 'transparent' }}
                  />
                </td>
                <td>
                  <input
                    type="url"
                    name="url"
                    value={social.url}
                    onChange={(e) => handleSocialMediaChange(e, index)}
                    style={{ width: '100%', border: 'none', background: 'transparent' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="add-social-link">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <input
                type="text"
                name="platform"
                value={newSocialMedia.platform}
                onChange={handleNewSocialMediaChange}
                placeholder="Platform (e.g., Facebook)"
              />
            </div>
            <div className="form-group">
              <input
                type="url"
                name="url"
                value={newSocialMedia.url}
                onChange={handleNewSocialMediaChange}
                placeholder="URL"
              />
            </div>
          </div>
          <button className="add-social-link-button" onClick={addSocialMedia}>
            Add Social Media Link
          </button>
        </div>

        <button className="save-button" onClick={saveSettings}>
          Save Support Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;