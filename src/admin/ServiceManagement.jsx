import React, { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "../firebase";
import '../styles/ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
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
    onValue(servicesRef, (snapshot) => {
      const servicesData = snapshot.val();
      if (servicesData) {
        const fetchedServices = Object.keys(servicesData).map(key => ({
          id: key,
          ...servicesData[key]
        }));
        setServices(fetchedServices);
      } else {
        setServices([]);
      }
    });
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setServiceFormData({ id: '', title: '', description: '', image: null, imageFile: null });
    setShowServiceModal(true);
  };

  // FIX: Function to open the modal for editing
  const handleOpenEditModal = (service) => {
    setIsEditing(true);
    setServiceFormData({ ...service, imageFile: null }); // Reset image file on edit
    setShowServiceModal(true);
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const deleteService = () => {
    if (serviceToDelete) {
      const serviceRef = ref(database, `services/${serviceToDelete.id}`);
      remove(serviceRef)
        .then(() => {
          setShowDeleteConfirm(false);
          setServiceToDelete(null);
        })
        .catch(error => console.error("Failed to delete service:", error));
    }
  };

  const cancelAction = () => {
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
  };
  
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData({ ...serviceFormData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // We show a preview, and store the file for upload on save
        setServiceFormData({ ...serviceFormData, image: reader.result, imageFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveService = async () => {
    const { id, title, description, image, imageFile } = serviceFormData;
    if (!title || !description) {
      alert("Service name and description are required.");
      return;
    }

    let imageUrl = image; // Keep existing image URL if no new file is uploaded
    if (imageFile) {
      // Upload new image to Firebase Storage
      const imageStorageRef = storageRef(storage, `services/service_${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageStorageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    const serviceData = {
        title,
        description,
        image: imageUrl,
        id: isEditing ? id : push(ref(database, 'services')).key,
    };

    const serviceRef = ref(database, `services/${serviceData.id}`);
    
    set(serviceRef, serviceData)
    .then(() => {
        setShowServiceModal(false);
    })
    .catch(error => {
        console.error("Failed to save service:", error);
    });
  };

  return (
    <div className="service-management">
      <div className="service-header">
        <div>
          <h1>Service Management</h1>
          <p>Create and manage service offerings for customers</p>
        </div>
        <button className="add-service-btn" onClick={handleOpenAddModal}>
          Add New Service
        </button>
      </div>

      <div className="services-list">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-image">
              <div className="image-placeholder">
                {service.image ? (
                  <img src={service.image} alt={service.title} className="service-img" />
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
                  <button className="action-btn edit-btn" title="Edit" onClick={() => handleOpenEditModal(service)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                  <button className="action-btn delete-btn" onClick={() => confirmDelete(service)} title="Delete">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
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
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  Choose Image
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Service Name</label>
              <input type="text" name="title" value={serviceFormData.title} onChange={handleModalInputChange} placeholder="e.g., Plumber, Electrician" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={serviceFormData.description} onChange={handleModalInputChange} placeholder="Describe the service..." rows="3" />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowServiceModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleSaveService}>
                {isEditing ? 'Save Changes' : 'Add Service'}
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
              <button className="cancel-btn" onClick={cancelAction}>Cancel</button>
              <button className="confirm-btn delete" onClick={deleteService}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;