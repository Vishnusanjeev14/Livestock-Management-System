import React, { useState, useEffect } from 'react';
import { livestockAPI } from '../services/api';

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: 'Male',
    healthStatus: 'Healthy'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await livestockAPI.getAll();
      setAnimals(response.data);
    } catch (error) {
      setError('Failed to fetch animals');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingAnimal) {
        await livestockAPI.update(editingAnimal._id, formData);
        setSuccess('Animal updated successfully');
      } else {
        await livestockAPI.create(formData);
        setSuccess('Animal added successfully');
      }
      
      setShowModal(false);
      setEditingAnimal(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        dateOfBirth: '',
        gender: 'Male',
        healthStatus: 'Healthy'
      });
      fetchAnimals();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save animal');
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      dateOfBirth: animal.dateOfBirth.split('T')[0],
      gender: animal.gender,
      healthStatus: animal.healthStatus
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        await livestockAPI.delete(id);
        setSuccess('Animal deleted successfully');
        fetchAnimals();
      } catch (error) {
        setError('Failed to delete animal');
      }
    }
  };

  const openModal = () => {
    setEditingAnimal(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      dateOfBirth: '',
      gender: 'Male',
      healthStatus: 'Healthy'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnimal(null);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="loading">Loading animals...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Animals</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Animal
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {animals.length === 0 ? (
        <div className="empty-state">
          <h3>No animals found</h3>
          <p>Add your first animal to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Health Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((animal) => (
                <tr key={animal._id}>
                  <td>{animal.name}</td>
                  <td>{animal.species}</td>
                  <td>{animal.breed}</td>
                  <td>{new Date(animal.dateOfBirth).toLocaleDateString()}</td>
                  <td>{animal.gender}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: animal.healthStatus === 'Healthy' ? '#d4edda' : 
                                     animal.healthStatus === 'Sick' ? '#f8d7da' :
                                     animal.healthStatus === 'Under Treatment' ? '#fff3cd' : '#e2e3e5',
                      color: animal.healthStatus === 'Healthy' ? '#155724' : 
                             animal.healthStatus === 'Sick' ? '#721c24' :
                             animal.healthStatus === 'Under Treatment' ? '#856404' : '#383d41'
                    }}>
                      {animal.healthStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(animal)} 
                      className="btn btn-secondary"
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(animal._id)} 
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAnimal ? 'Edit Animal' : 'Add New Animal'}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="species">Species</label>
                <input
                  type="text"
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="breed">Breed</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="healthStatus">Health Status</label>
                <select
                  id="healthStatus"
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Sick">Sick</option>
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Recovered">Recovered</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingAnimal ? 'Update' : 'Add'} Animal
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Animals;
