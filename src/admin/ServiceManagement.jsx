import React, { useState } from 'react';
import '../styles/ServiceManagement.css';

// Importing all service images
import plumberImg from '../assets/plumber.png';
import electricianImg from '../assets/electrician.png';
import acMechanicImg from '../assets/ac mechanic.png';
import carpenterImg from '../assets/carpenter.png';
import packersImg from '../assets/packers&movers.png';
import housecleanersImg from '../assets/House cleaners.png';
import camerafittingsImg from '../assets/camera fittings.png';
import privateinvestigatorsImg from '../assets/private investigators.png';
import welderImg from '../assets/welder.png';
import surveyorsImg from '../assets/surveyors.png';
import developersImg from '../assets/SoftwareDeveloper.png';
import bodymassageImg from '../assets/BodyMassage.png';
import constructioncleanersImg from '../assets/Construction cleaners.png';
import laundryImg from '../assets/laundry.png';
import deliveryImg from '../assets/delivery.png';

const ServiceManagement = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Plumber',
      description: 'A plumber is a skilled professional who installs, repairs, and maintains water supply and drainage systems. They ensure safe water flow and proper wastewater disposal in homes and buildings.',
      active: true,
      image: plumberImg
    },
    {
      id: 2,
      name: 'Electrician',
      description: 'An electrician is a skilled tradesperson who installs, maintains, and repairs electrical systems and wiring. They ensure the safe and efficient operation of power and lighting in residential, commercial, and industrial settings.',
      active: true,
      image: electricianImg
    },
    {
      id: 3,
      name: 'AC Mechanic',
      description: 'An AC mechanic specializes in the installation, maintenance, and repair of air conditioning systems. They diagnose issues, fix components, and ensure optimal cooling performance for residential and commercial clients.',
      active: true,
      image: acMechanicImg
    },
    {
      id: 4,
      name: 'Carpenter',
      description: 'A carpenter is a skilled tradesperson who works with wood to construct, install, and repair structures and fixtures.',
      active: true,
      image: carpenterImg
    },
    {
      id: 5,
      name: 'Packers & Movers',
      description: 'Packers and movers are professionals who assist with relocating goods from one place to another. They handle packing, loading, transporting, unloading, and unpacking items securely.',
      active: true,
      image: packersImg
    },
    {
      id: 6,
      name: 'House cleaners',
      description: 'House cleaners provide professional cleaning services for residential properties. They handle tasks such as dusting, vacuuming, mopping floors, and sanitizing bathrooms and kitchens to ensure a tidy living space.',
      active: true,
      image: housecleanersImg
    },
    {
      id: 7,
      name: 'Laundry',
      description: 'Laundry services offer professional washing, drying, and folding of clothes and other textiles. They provide convenient solutions for individuals and businesses, often including pickup and delivery.',
      active: true,
      image: laundryImg
    },
    {
      id: 8,
      name: 'Construction cleaners',
      description: 'Construction cleaners specialize in cleaning up job sites after construction or renovation. They remove debris, dust, and leftover materials to prepare the space for its new occupants.',
      active: true,
      image: constructioncleanersImg
    },
    {
      id: 9,
      name: 'Surveyors',
      description: 'A surveyor measures and maps land to determine property boundaries and land features. They play a crucial role in construction, real estate, and land development projects.',
      active: true,
      image: surveyorsImg
    },
    {
      id: 10,
      name: 'Camera fittings',
      description: 'Camera fitting services involve the professional installation and setup of security cameras and surveillance systems. They ensure optimal placement and functionality for monitoring homes or businesses.',
      active: true,
      image: camerafittingsImg
    },
    {
      id: 11,
      name: 'Welders',
      description: 'A welder is a skilled professional who joins metal parts using heat and various techniques. They are essential in construction, manufacturing, and repair industries.',
      active: true,
      image: welderImg
    },
    {
      id: 12,
      name: 'Private investigators',
      description: 'A private investigator is a professional who conducts surveillance and research to gather information for clients. They work on cases ranging from legal matters to personal inquiries.',
      active: true,
      image: privateinvestigatorsImg
    },
    {
      id: 13,
      name: 'Body Massage',
      description: 'Body massage services provide therapeutic manipulation of the body\'s muscles and tissues to relieve stress, reduce pain, and promote relaxation and overall well-being.',
      active: true,
      image: bodymassageImg
    },
    {
      id: 14,
      name: 'Software Developer',
      description: 'A software developer creates, tests, and maintains software applications and systems. They are skilled in various programming languages and frameworks to build functional and efficient digital solutions.',
      active: true,
      image: developersImg
    },
    {
      id: 15,
      name: 'Delivery',
      description: 'Delivery services transport goods, packages, and documents from a point of origin to a specified destination. This can include food delivery, courier services, and logistics for businesses.',
      active: true,
      image: deliveryImg
    }
  ]);

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

  const confirmStatusChange = (service) => {
    setServiceToToggle(service);
    setShowStatusConfirm(true);
  };

  const toggleServiceStatus = () => {
    setServices(services.map(service =>
      service.id === serviceToToggle.id ? { ...service, active: !service.active } : service
    ));
    setShowStatusConfirm(false);
    setServiceToToggle(null);
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const deleteService = () => {
    setServices(services.filter(service => service.id !== serviceToDelete.id));
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewService({
          ...newService,
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewService = () => {
    if (newService.name && newService.description) {
      const newServiceObj = {
        id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
        name: newService.name,
        description: newService.description,
        active: true,
        image: newService.image
      };

      setServices([...services, newServiceObj]);
      setNewService({ name: '', description: '', image: null });
      setShowAddService(false);
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
                  <img src={service.image} alt={service.name} className="service-img" />
                ) : (
                  <span className="placeholder-text">Service Image</span>
                )}
              </div>
            </div>

            <div className="service-content-wrapper">
              <div className="service-content">
                <h3 className="service-name">{service.name}</h3>
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
            <p>Are you sure you want to {serviceToToggle.active ? 'deactivate' : 'activate'} the "{serviceToToggle.name}" service?</p>
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
            <p>Are you sure you want to delete the "{serviceToDelete.name}" service? This action cannot be undone.</p>
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