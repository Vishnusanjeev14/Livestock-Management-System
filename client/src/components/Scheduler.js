import React, { useState, useEffect } from 'react';
import { schedulerAPI, livestockAPI } from '../services/api';

const Scheduler = () => {
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animalId: '',
    reminderType: 'Vaccination',
    dueDate: '',
    priority: 'Medium',
    isRecurring: false,
    recurringInterval: 'Monthly',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersResponse, upcomingResponse, summaryResponse, animalsResponse] = await Promise.all([
        schedulerAPI.getAll(),
        schedulerAPI.getUpcoming(),
        schedulerAPI.getSummary(),
        livestockAPI.getAll()
      ]);
      setReminders(remindersResponse.data);
      setUpcomingReminders(upcomingResponse.data);
      setSummary(summaryResponse.data);
      setAnimals(animalsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        isRecurring: formData.isRecurring
      };

      if (editingRecord) {
        await schedulerAPI.update(editingRecord._id, submitData);
        setSuccess('Reminder updated successfully');
      } else {
        await schedulerAPI.create(submitData);
        setSuccess('Reminder added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save reminder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      animalId: '',
      reminderType: 'Vaccination',
      dueDate: '',
      priority: 'Medium',
      isRecurring: false,
      recurringInterval: 'Monthly',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || '',
      animalId: record.animalId?._id || '',
      reminderType: record.reminderType,
      dueDate: record.dueDate.split('T')[0],
      priority: record.priority,
      isRecurring: record.isRecurring,
      recurringInterval: record.recurringInterval || 'Monthly',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await schedulerAPI.delete(id);
        setSuccess('Reminder deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete reminder');
      }
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await schedulerAPI.markComplete(id);
      setSuccess('Reminder marked as completed');
      fetchData();
    } catch (error) {
      setError('Failed to mark reminder as completed');
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setError('');
    setSuccess('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Completed': return '#28a745';
      case 'Overdue': return '#dc3545';
      case 'Cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'High': return '#fd7e14';
      case 'Urgent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading scheduler data...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Task Scheduler & Reminders</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Reminder
        </button>
      </div>

      {summary && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Dashboard Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="summary-card">
              <h4>Total Reminders</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {summary.totalReminders}
              </p>
            </div>
            <div className="summary-card">
              <h4>Pending</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {summary.pendingReminders}
              </p>
            </div>
            <div className="summary-card">
              <h4>Overdue</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {summary.overdueReminders}
              </p>
            </div>
            <div className="summary-card">
              <h4>Upcoming (7 days)</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {summary.upcomingReminders}
              </p>
            </div>
          </div>
        </div>
      )}

      {upcomingReminders.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Upcoming Reminders (Next 7 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {upcomingReminders.map((reminder) => (
              <div key={reminder._id} className="reminder-card" style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h5 style={{ margin: 0, color: '#333' }}>{reminder.title}</h5>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: getPriorityColor(reminder.priority),
                    color: 'white'
                  }}>
                    {reminder.priority}
                  </span>
                </div>
                <p style={{ margin: '5px 0', color: '#666' }}>{reminder.description}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Due:</strong> {new Date(reminder.dueDate).toLocaleDateString()}
                </p>
                {reminder.animalId && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Animal:</strong> {reminder.animalId.name} ({reminder.animalId.species})
                  </p>
                )}
                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={() => handleMarkComplete(reminder._id)}
                    className="btn btn-success"
                    style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                  >
                    Mark Complete
                  </button>
                  <button 
                    onClick={() => handleEdit(reminder)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {reminders.length === 0 ? (
        <div className="empty-state">
          <h3>No reminders found</h3>
          <p>Add your first reminder to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Animal</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Recurring</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder._id}>
                  <td>{reminder.title}</td>
                  <td>{reminder.reminderType}</td>
                  <td>{reminder.animalId?.name || '-'}</td>
                  <td>{new Date(reminder.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: getPriorityColor(reminder.priority),
                      color: 'white'
                    }}>
                      {reminder.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: getStatusColor(reminder.status),
                      color: 'white'
                    }}>
                      {reminder.status}
                    </span>
                  </td>
                  <td>{reminder.isRecurring ? 'Yes' : 'No'}</td>
                  <td>
                    {reminder.status === 'Pending' && (
                      <button 
                        onClick={() => handleMarkComplete(reminder._id)}
                        className="btn btn-success"
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(reminder)}
                      className="btn btn-secondary"
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(reminder._id)}
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
              <h3>{editingRecord ? 'Edit Reminder' : 'Add New Reminder'}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="animalId">Animal (Optional)</label>
                <select
                  id="animalId"
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleChange}
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
                <label htmlFor="reminderType">Reminder Type</label>
                <select
                  id="reminderType"
                  name="reminderType"
                  value={formData.reminderType}
                  onChange={handleChange}
                  required
                >
                  <option value="Vaccination">Vaccination</option>
                  <option value="Breeding Check">Breeding Check</option>
                  <option value="Feeding">Feeding</option>
                  <option value="Health Check">Health Check</option>
                  <option value="Milking">Milking</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                  />
                  Recurring Reminder
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="form-group">
                  <label htmlFor="recurringInterval">Recurring Interval</label>
                  <select
                    id="recurringInterval"
                    name="recurringInterval"
                    value={formData.recurringInterval}
                    onChange={handleChange}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              )}
              
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
                  {editingRecord ? 'Update' : 'Add'} Reminder
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

export default Scheduler;
