import React, { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove } from "firebase/database";
import { database } from "../firebase";
import '../styles/ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [serviceToToggle, setServiceToToggle] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    image: null
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
      }
    });
  }, []);

  const confirmStatusChange = (service) => {
    setServiceToToggle(service);
    setShowStatusConfirm(true);
  };

  const toggleServiceStatus = () => {
    if (serviceToToggle) {
      const serviceRef = ref(database, `services/${serviceToToggle.id}`);
      set(serviceRef, { ...serviceToToggle, active: !serviceToToggle.active })
        .then(() => {
          setShowStatusConfirm(false);
          setServiceToToggle(null);
        })
        .catch(error => {
          console.error("Failed to toggle service status:", error);
        });
    }
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
        .catch(error => {
          console.error("Failed to delete service:", error);
        });
    }
  };

  const cancelAction = () => {
    setShowDeleteConfirm(false);
    setShowStatusConfirm(false);
    setServiceToDelete(null);
    setServiceToToggle(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, you would upload this file to Firebase Storage
      // and get a URL. For this example, we'll use a placeholder.
      console.log("Image uploaded:", file.name);
      setNewService({
        ...newService,
        image: 'https://via.placeholder.com/150'
      });
    }
  };

  const addNewService = () => {
    if (newService.name && newService.description) {
      const servicesRef = ref(database, "services");
      const newServiceKey = push(servicesRef).key;
      set(ref(database, `services/${newServiceKey}`), {
        id: newServiceKey,
        title: newService.name,
        description: newService.description,
        active: true,
        image: newService.image
      })
      .then(() => {
        setNewService({ name: '', description: '', image: null });
        setShowAddService(false);
      })
      .catch(error => {
        console.error("Failed to add new service:", error);
      });
    }
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
          onClick={() => setShowAddService(true)}
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
                  <img src={service.image} alt={service.title} className="service-img" />
                ) : (
                  <span className="placeholder-text">Service Image</span>
                )}
              </div>
            </div>

            <div className="service-content-wrapper">
              <div className="service-content">
                <h3 className="service-name">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>

              <div className="service-actions">
                <div className="status-section">
                  <span className={`status-label ${service.active ? 'active' : 'inactive'}`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={service.active}
                      onChange={() => confirmStatusChange(service)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="action-buttons">
                  <button className="action-btn edit-btn" title="Edit">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => confirmDelete(service)}
                    title="Delete"
                  >
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

      {showAddService && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Service</h2>
            <div className="form-group">
              <label>Service Image</label>
              <div className="image-upload">
                <div className="image-preview">
                  {newService.image ? (
                    <img src={newService.image} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  Choose Image
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Service Name</label>
              <input
                type="text"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="e.g., Plumber, Electrician"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                placeholder="Describe the service..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddService(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={addNewService}>
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Status Change</h2>
            <p>Are you sure you want to {serviceToToggle?.active ? 'deactivate' : 'activate'} the "{serviceToToggle?.title}" service?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelAction}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={toggleServiceStatus}>
                Confirm
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
              <button className="cancel-btn" onClick={cancelAction}>
                Cancel
              </button>
              <button className="delete-btn" onClick={deleteService}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;