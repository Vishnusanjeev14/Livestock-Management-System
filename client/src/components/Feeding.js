import React, { useState, useEffect } from 'react';
import { feedingAPI, livestockAPI } from '../services/api';

const Feeding = () => {
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    feedType: '',
    quantity: '',
    date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedingResponse, animalsResponse] = await Promise.all([
        feedingAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setFeedingRecords(feedingResponse.data);
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
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity)
      };

      if (editingRecord) {
        await feedingAPI.update(editingRecord._id, submitData);
        setSuccess('Feeding record updated successfully');
      } else {
        await feedingAPI.create(submitData);
        setSuccess('Feeding record added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        animalId: '',
        feedType: '',
        quantity: '',
        date: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save feeding record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.animalId._id,
      feedType: record.feedType,
      quantity: record.quantity.toString(),
      date: record.date.split('T')[0],
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feeding record?')) {
      try {
        await feedingAPI.delete(id);
        setSuccess('Feeding record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete feeding record');
      }
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      animalId: '',
      feedType: '',
      quantity: '',
      date: '',
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
    return <div className="loading">Loading feeding records...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Feeding Records</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Feeding Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {feedingRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No feeding records found</h3>
          <p>Add your first feeding record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Feed Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedingRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.animalId?.name} ({record.animalId?.species})</td>
                  <td>{record.feedType}</td>
                  <td>{record.quantity} kg</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
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
              <h3>{editingRecord ? 'Edit Feeding Record' : 'Add New Feeding Record'}</h3>
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
                <label htmlFor="feedType">Feed Type</label>
                <input
                  type="text"
                  id="feedType"
                  name="feedType"
                  value={formData.feedType}
                  onChange={handleChange}
                  placeholder="e.g., Hay, Grain, Pellets"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity (kg)</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
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
                  placeholder="Any additional notes about the feeding..."
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

export default Feeding;
