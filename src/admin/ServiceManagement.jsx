import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { database, storage, auth } from "../firebase";
import '../styles/ServiceManagement.css';

// --- IN-MEMORY CACHE ---
let servicesManagementCache = null;

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [loading, setLoading] = useState(true); // Start true for initial load

  // State for the modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: null,
    imageFile: null
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. Check Cache
        if (servicesManagementCache) {
          setServices(servicesManagementCache);
          setLoading(false);
          return;
        }

        // 2. Fetch if not in cache
        const servicesRef = ref(database, "services");
        get(servicesRef).then((snapshot) => {
          const servicesData = snapshot.val();
          let fetchedServices = [];
          if (servicesData) {
            fetchedServices = Object.keys(servicesData).map(key => ({
              id: key,
              ...servicesData[key]
            }));
            // Optional: Sort logic could be added here if needed
            setServices(fetchedServices);
            servicesManagementCache = fetchedServices;
          } else {
            setServices([]);
            servicesManagementCache = [];
          }
          setLoading(false);
        }).catch(error => {
          console.error("Error fetching services:", error);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updateCache = (newServices) => {
    setServices(newServices);
    servicesManagementCache = newServices;
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setServiceFormData({
      id: '',
      title: '',
      description: '',
      image: null,
      imageFile: null
    });
    setShowServiceModal(true);
  };

  const handleOpenEditModal = (service) => {
    setIsEditing(true);
    setServiceFormData({
      ...service,
      imageFile: null
    });
    setShowServiceModal(true);
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const deleteService = async () => {
    if (!serviceToDelete) return;

    setLoading(true);
    try {
      const serviceRef = ref(database, `services/${serviceToDelete.id}`);
      await remove(serviceRef);
      console.log('Service deleted successfully');

      // Update local state and cache
      const updatedServices = services.filter(s => s.id !== serviceToDelete.id);
      updateCache(updatedServices);

      setShowDeleteConfirm(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert('Error deleting service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setServiceFormData(prev => ({
        ...prev,
        image: reader.result,
        imageFile: file
      }));
    };
    reader.onerror = () => {
      alert('Error reading the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveService = async () => {
    const { id, title, description, image, imageFile } = serviceFormData;

    // Validation (same as above)
    if (!title?.trim() || !description?.trim()) {
      alert("Service name and description are required.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = image;

      if (imageFile) {
        // Upload image code would go here
        // For now, we are just using the base64 string or existing URL
      }

      const serviceData = {
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
      };

      let newServicesList = [...services];

      if (isEditing && id) {
        // Update existing service
        const serviceRef = ref(database, `services/${id}`);
        await set(serviceRef, serviceData);

        // Update local list
        newServicesList = newServicesList.map(s =>
          s.id === id ? { ...s, ...serviceData, id } : s
        );

      } else {
        // Add new service using a simple timestamp as ID
        const newServiceId = `service_${Date.now()}`;
        const serviceRef = ref(database, `services/${newServiceId}`);
        await set(serviceRef, serviceData);

        // Add to local list
        newServicesList.push({ ...serviceData, id: newServiceId });
      }

      // Update cache and state
      updateCache(newServicesList);

      console.log('Service saved successfully');
      setShowServiceModal(false);
      // Reset form
      setServiceFormData({ id: '', title: '', description: '', image: null, imageFile: null });
      setIsEditing(false);

    } catch (error) {
      console.error("Failed to save service:", error);
      alert('Error saving service. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.style.display = 'none';
    const placeholder = e.target.parentElement.querySelector('.placeholder-text');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  const handleModalClose = () => {
    setShowServiceModal(false);
    setServiceFormData({
      id: '',
      title: '',
      description: '',
      image: null,
      imageFile: null
    });
    setIsEditing(false);
  };

  if (loading && services.length === 0) { // Show loading only if no data
    return (
      <div className="loading-overlay">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="service-management">
      <div className="service-header">
        <div>
          <h1>Service Management</h1>
          <p>Create and manage service offerings for customers</p>
        </div>
        <button
          className="add-service-btn"
          onClick={handleOpenAddModal}
          disabled={loading}
        >
          Add New Service
        </button>
      </div>

      <div className="services-list">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-image">
              <div className="image-placeholder">
                {service.image ? (
                  <>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="service-img"
                      onError={handleImageError}
                    />
                    <span className="placeholder-text" style={{ display: 'none' }}>Image Failed to Load</span>
                  </>
                ) : (
                  <span className="placeholder-text">No Image</span>
                )}
              </div>
            </div>

            <div className="service-content-wrapper">
              <div className="service-content">
                <h3 className="service-name">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>

              <div className="service-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn-s edit-icon"
                    title="Edit"
                    onClick={() => handleOpenEditModal(service)}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn-s delete-icon"
                    onClick={() => confirmDelete(service)}
                    title="Delete"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showServiceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? 'Edit Service' : 'Add New Service'}</h2>

            <div className="form-group">
              <label>Service Image</label>
              <div className="image-upload">
                <div className="image-preview">
                  {serviceFormData.image ? (
                    <img src={serviceFormData.image} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="upload-placeholder"><span>No Image</span></div>
                  )}
                </div>
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  Choose Image
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Service Name *</label>
              <input
                type="text"
                name="title"
                value={serviceFormData.title}
                onChange={handleModalInputChange}
                placeholder="e.g., Plumber, Electrician"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={serviceFormData.description}
                onChange={handleModalInputChange}
                placeholder="Describe the service..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={handleModalClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleSaveService}
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Service')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the "{serviceToDelete?.title}" service? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelAction}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-btn delete"
                onClick={deleteService}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;