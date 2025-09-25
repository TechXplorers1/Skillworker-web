import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "../firebase";
import '../styles/ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
    const servicesRef = ref(database, "services");
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const servicesData = snapshot.val();
      if (servicesData) {
        const fetchedServices = Object.keys(servicesData).map(key => ({
          id: key,
          ...servicesData[key]
        }));
        setServices(fetchedServices);
        console.log('Services loaded:', fetchedServices);
      } else {
        setServices([]);
      }
    });

    return () => unsubscribe();
  }, []);

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
      // Upload image code (same as above)
    }
    
    const serviceData = {
      title: title.trim(),
      description: description.trim(),
      image: imageUrl,
    };

    if (isEditing && id) {
      // Update existing service
      const serviceRef = ref(database, `services/${id}`);
      await set(serviceRef, serviceData);
    } else {
      // Add new service using a simple timestamp as ID
      const newServiceId = `service_${Date.now()}`;
      const serviceRef = ref(database, `services/${newServiceId}`);
      await set(serviceRef, serviceData);
    }
    
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
                    <span className="placeholder-text" style={{display: 'none'}}>Image Failed to Load</span>
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
                    className="action-btn edit-icon" 
                    title="Edit" 
                    onClick={() => handleOpenEditModal(service)}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-icon" 
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