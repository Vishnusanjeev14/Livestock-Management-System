import React, { useState, useEffect } from 'react';
import { veterinaryAPI, livestockAPI } from '../services/api';

const Veterinary = () => {
  const [veterinaryRecords, setVeterinaryRecords] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    appointmentDate: '',
    vetName: '',
    vetContact: '',
    visitType: 'Routine Checkup',
    diagnosis: '',
    treatment: '',
    medication: '',
    dosage: '',
    nextVisitDate: '',
    cost: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [veterinaryResponse, animalsResponse] = await Promise.all([
        veterinaryAPI.getAll(),
        livestockAPI.getAll()
      ]);
      setVeterinaryRecords(veterinaryResponse.data);
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
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };

      if (editingRecord) {
        await veterinaryAPI.update(editingRecord._id, submitData);
        setSuccess('Veterinary record updated successfully');
      } else {
        await veterinaryAPI.create(submitData);
        setSuccess('Veterinary record added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        animalId: '',
        appointmentDate: '',
        vetName: '',
        vetContact: '',
        visitType: 'Routine Checkup',
        diagnosis: '',
        treatment: '',
        medication: '',
        dosage: '',
        nextVisitDate: '',
        cost: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save veterinary record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.animalId._id,
      appointmentDate: record.appointmentDate.split('T')[0],
      vetName: record.vetName,
      vetContact: record.vetContact || '',
      visitType: record.visitType,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medication: record.medication || '',
      dosage: record.dosage || '',
      nextVisitDate: record.nextVisitDate ? record.nextVisitDate.split('T')[0] : '',
      cost: record.cost || '',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this veterinary record?')) {
      try {
        await veterinaryAPI.delete(id);
        setSuccess('Veterinary record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete veterinary record');
      }
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      animalId: '',
      appointmentDate: '',
      vetName: '',
      vetContact: '',
      visitType: 'Routine Checkup',
      diagnosis: '',
      treatment: '',
      medication: '',
      dosage: '',
      nextVisitDate: '',
      cost: '',
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
    return <div className="loading">Loading veterinary records...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Veterinary Records</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Veterinary Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {veterinaryRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No veterinary records found</h3>
          <p>Add your first veterinary record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Appointment Date</th>
                <th>Veterinarian</th>
                <th>Visit Type</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Cost</th>
                <th>Next Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {veterinaryRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.animalId?.name} ({record.animalId?.species})</td>
                  <td>{new Date(record.appointmentDate).toLocaleDateString()}</td>
                  <td>{record.vetName}</td>
                  <td>{record.visitType}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.treatment}</td>
                  <td>{record.cost ? `$${record.cost}` : '-'}</td>
                  <td>{record.nextVisitDate ? new Date(record.nextVisitDate).toLocaleDateString() : '-'}</td>
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
              <h3>{editingRecord ? 'Edit Veterinary Record' : 'Add New Veterinary Record'}</h3>
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
                <label htmlFor="appointmentDate">Appointment Date</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
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
                <label htmlFor="vetContact">Veterinarian Contact</label>
                <input
                  type="text"
                  id="vetContact"
                  name="vetContact"
                  value={formData.vetContact}
                  onChange={handleChange}
                  placeholder="Phone number or email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="visitType">Visit Type</label>
                <select
                  id="visitType"
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  required
                >
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Other">Other</option>
                </select>
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
                <label htmlFor="medication">Medication</label>
                <input
                  type="text"
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  placeholder="e.g., Amoxicillin, Ivermectin, etc."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dosage">Dosage</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 10ml twice daily for 5 days"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="nextVisitDate">Next Visit Date</label>
                <input
                  type="date"
                  id="nextVisitDate"
                  name="nextVisitDate"
                  value={formData.nextVisitDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cost">Cost ($)</label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
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
                  placeholder="Any additional notes about the veterinary visit..."
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

export default Veterinary;
