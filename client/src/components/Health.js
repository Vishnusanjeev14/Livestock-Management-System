import React, { useState, useEffect } from 'react';
import { healthAPI, livestockAPI } from '../services/api';

const Health = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    checkupDate: '',
    diagnosis: '',
    treatment: '',
    vetName: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [healthResponse, animalsResponse] = await Promise.all([
        healthAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setHealthRecords(healthResponse.data);
      setAnimals(animalsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
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
      if (editingRecord) {
        await healthAPI.update(editingRecord._id, formData);
        setSuccess('Health record updated successfully');
      } else {
        await healthAPI.create(formData);
        setSuccess('Health record added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        animalId: '',
        checkupDate: '',
        diagnosis: '',
        treatment: '',
        vetName: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save health record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.animalId._id,
      checkupDate: record.checkupDate.split('T')[0],
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      vetName: record.vetName,
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await healthAPI.delete(id);
        setSuccess('Health record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete health record');
      }
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      animalId: '',
      checkupDate: '',
      diagnosis: '',
      treatment: '',
      vetName: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="loading">Loading health records...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Health Records</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Health Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {healthRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No health records found</h3>
          <p>Add your first health record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Checkup Date</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Veterinarian</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {healthRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.animalId?.name} ({record.animalId?.species})</td>
                  <td>{new Date(record.checkupDate).toLocaleDateString()}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.treatment}</td>
                  <td>{record.vetName}</td>
                  <td>{record.notes || '-'}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(record)} 
                      className="btn btn-secondary"
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(record._id)} 
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
              <h3>{editingRecord ? 'Edit Health Record' : 'Add New Health Record'}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="animalId">Animal</label>
                <select
                  id="animalId"
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an animal</option>
                  {animals.map((animal) => (
                    <option key={animal._id} value={animal._id}>
                      {animal.name} ({animal.species} - {animal.breed})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="checkupDate">Checkup Date</label>
                <input
                  type="date"
                  id="checkupDate"
                  name="checkupDate"
                  value={formData.checkupDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="diagnosis">Diagnosis</label>
                <input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="e.g., Healthy, Respiratory infection, etc."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="treatment">Treatment</label>
                <input
                  type="text"
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  placeholder="e.g., Antibiotics, Vaccination, etc."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="vetName">Veterinarian Name</label>
                <input
                  type="text"
                  id="vetName"
                  name="vetName"
                  value={formData.vetName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about the health checkup..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Update' : 'Add'} Record
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

export default Health;
