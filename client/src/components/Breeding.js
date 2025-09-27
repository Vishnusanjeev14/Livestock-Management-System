import React, { useState, useEffect } from 'react';
import { breedingAPI, livestockAPI } from '../services/api';

const Breeding = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    partnerAnimalId: '',
    breedingDate: '',
    outcome: 'Pending',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [breedingResponse, animalsResponse] = await Promise.all([
        breedingAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setBreedingRecords(breedingResponse.data);
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
        await breedingAPI.update(editingRecord._id, formData);
        setSuccess('Breeding record updated successfully');
      } else {
        await breedingAPI.create(formData);
        setSuccess('Breeding record added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        animalId: '',
        partnerAnimalId: '',
        breedingDate: '',
        outcome: 'Pending',
        notes: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save breeding record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.animalId._id,
      partnerAnimalId: record.partnerAnimalId._id,
      breedingDate: record.breedingDate.split('T')[0],
      outcome: record.outcome,
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this breeding record?')) {
      try {
        await breedingAPI.delete(id);
        setSuccess('Breeding record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete breeding record');
      }
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      animalId: '',
      partnerAnimalId: '',
      breedingDate: '',
      outcome: 'Pending',
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
    return <div className="loading">Loading breeding records...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Breeding Records</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Breeding Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {breedingRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No breeding records found</h3>
          <p>Add your first breeding record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Partner</th>
                <th>Breeding Date</th>
                <th>Outcome</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {breedingRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.animalId?.name} ({record.animalId?.species})</td>
                  <td>{record.partnerAnimalId?.name} ({record.partnerAnimalId?.species})</td>
                  <td>{new Date(record.breedingDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: record.outcome === 'Successful' ? '#d4edda' : 
                                     record.outcome === 'Unsuccessful' ? '#f8d7da' :
                                     record.outcome === 'Pending' ? '#fff3cd' : '#e2e3e5',
                      color: record.outcome === 'Successful' ? '#155724' : 
                             record.outcome === 'Unsuccessful' ? '#721c24' :
                             record.outcome === 'Pending' ? '#856404' : '#383d41'
                    }}>
                      {record.outcome}
                    </span>
                  </td>
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
              <h3>{editingRecord ? 'Edit Breeding Record' : 'Add New Breeding Record'}</h3>
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
                <label htmlFor="partnerAnimalId">Partner Animal</label>
                <select
                  id="partnerAnimalId"
                  name="partnerAnimalId"
                  value={formData.partnerAnimalId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a partner animal</option>
                  {animals.filter(animal => animal._id !== formData.animalId).map((animal) => (
                    <option key={animal._id} value={animal._id}>
                      {animal.name} ({animal.species} - {animal.breed})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="breedingDate">Breeding Date</label>
                <input
                  type="date"
                  id="breedingDate"
                  name="breedingDate"
                  value={formData.breedingDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="outcome">Outcome</label>
                <select
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Successful">Successful</option>
                  <option value="Unsuccessful">Unsuccessful</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
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

export default Breeding;
