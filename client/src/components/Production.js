import React, { useState, useEffect } from 'react';
import { productionAPI, livestockAPI } from '../services/api';

const Production = () => {
  const [productionRecords, setProductionRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    date: '',
    productType: '',
    quantity: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productionResponse, animalsResponse] = await Promise.all([
        productionAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setProductionRecords(productionResponse.data);
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
        await productionAPI.update(editingRecord._id, submitData);
        setSuccess('Production record updated successfully');
      } else {
        await productionAPI.create(submitData);
        setSuccess('Production record added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        animalId: '',
        date: '',
        productType: '',
        quantity: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save production record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.animalId._id,
      date: record.date.split('T')[0],
      productType: record.productType,
      quantity: record.quantity.toString(),
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        await productionAPI.delete(id);
        setSuccess('Production record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete production record');
      }
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      animalId: '',
      date: '',
      productType: '',
      quantity: '',
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
    return <div className="loading">Loading production records...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Production Records</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Production Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {productionRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No production records found</h3>
          <p>Add your first production record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Date</th>
                <th>Product Type</th>
                <th>Quantity</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productionRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.animalId?.name} ({record.animalId?.species})</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.productType}</td>
                  <td>{record.quantity} units</td>
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
              <h3>{editingRecord ? 'Edit Production Record' : 'Add New Production Record'}</h3>
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
                <label htmlFor="productType">Product Type</label>
                <input
                  type="text"
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  placeholder="e.g., Milk, Eggs, Wool, Meat"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
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
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about the production..."
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

export default Production;
