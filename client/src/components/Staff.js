import React, { useState, useEffect } from 'react';
import { staffAPI, livestockAPI } from '../services/api';

const Staff = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: '',
    status: 'Active',
    skills: '',
    notes: '',
    title: '',
    description: '',
    assignedTo: '',
    animalId: '',
    taskType: 'Feeding',
    priority: 'Medium',
    dueDate: '',
    estimatedDuration: '',
    notes: '',
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResponse, tasksResponse, attendanceResponse, animalsResponse] = await Promise.all([
        staffAPI.getEmployees(),
        staffAPI.getTasks(),
        staffAPI.getAttendance(),
        livestockAPI.getAll()
      ]);
      setEmployees(employeesResponse.data);
      setTasks(tasksResponse.data);
      setAttendance(attendanceResponse.data);
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
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : 0,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      };

      if (activeTab === 'employees') {
        if (editingRecord) {
          await staffAPI.updateEmployee(editingRecord._id, submitData);
          setSuccess('Employee updated successfully');
        } else {
          await staffAPI.createEmployee(submitData);
          setSuccess('Employee added successfully');
        }
      } else if (activeTab === 'tasks') {
        if (editingRecord) {
          await staffAPI.updateTask(editingRecord._id, submitData);
          setSuccess('Task updated successfully');
        } else {
          await staffAPI.createTask(submitData);
          setSuccess('Task added successfully');
        }
      } else {
        if (editingRecord) {
          await staffAPI.updateAttendance(editingRecord._id, submitData);
          setSuccess('Attendance record updated successfully');
        } else {
          await staffAPI.createAttendance(submitData);
          setSuccess('Attendance record added successfully');
        }
      }
      
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      email: '',
      phone: '',
      hireDate: '',
      salary: '',
      status: 'Active',
      skills: '',
      notes: '',
      title: '',
      description: '',
      assignedTo: '',
      animalId: '',
      taskType: 'Feeding',
      priority: 'Medium',
      dueDate: '',
      estimatedDuration: '',
      notes: '',
      employeeId: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'Present'
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'employees') {
      setFormData({
        name: record.name,
        position: record.position,
        email: record.email,
        phone: record.phone,
        hireDate: record.hireDate.split('T')[0],
        salary: record.salary || '',
        status: record.status,
        skills: record.skills ? record.skills.join(', ') : '',
        notes: record.notes || ''
      });
    } else if (activeTab === 'tasks') {
      setFormData({
        title: record.title,
        description: record.description || '',
        assignedTo: record.assignedTo?._id || '',
        animalId: record.animalId?._id || '',
        taskType: record.taskType,
        priority: record.priority,
        dueDate: record.dueDate.split('T')[0],
        estimatedDuration: record.estimatedDuration || '',
        notes: record.notes || ''
      });
    } else {
      setFormData({
        employeeId: record.employeeId._id,
        date: record.date.split('T')[0],
        checkIn: record.checkIn ? record.checkIn.split('T')[1].substring(0, 5) : '',
        checkOut: record.checkOut ? record.checkOut.split('T')[1].substring(0, 5) : '',
        status: record.status,
        notes: record.notes || ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        if (activeTab === 'employees') {
          await staffAPI.deleteEmployee(id);
        } else if (activeTab === 'tasks') {
          await staffAPI.deleteTask(id);
        } else {
          await staffAPI.deleteAttendance(id);
        }
        setSuccess('Record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete record');
      }
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

  if (loading) {
    return <div className="loading">Loading staff data...</div>;
  }

  const currentRecords = activeTab === 'employees' ? employees : activeTab === 'tasks' ? tasks : attendance;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Staff Management</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New {activeTab === 'employees' ? 'Employee' : activeTab === 'tasks' ? 'Task' : 'Attendance Record'}
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {currentRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No {activeTab} records found</h3>
          <p>Add your first {activeTab} record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                {activeTab === 'employees' ? (
                  <>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Hire Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                ) : activeTab === 'tasks' ? (
                  <>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Animal</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr key={record._id}>
                  {activeTab === 'employees' ? (
                    <>
                      <td>{record.name}</td>
                      <td>{record.position}</td>
                      <td>{record.email}</td>
                      <td>{record.phone}</td>
                      <td>{new Date(record.hireDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status status-${record.status.toLowerCase().replace(' ', '-')}`}>
                          {record.status}
                        </span>
                      </td>
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
                    </>
                  ) : activeTab === 'tasks' ? (
                    <>
                      <td>{record.title}</td>
                      <td>{record.taskType}</td>
                      <td>{record.assignedTo?.name || '-'}</td>
                      <td>{record.animalId?.name || '-'}</td>
                      <td>
                        <span className={`priority priority-${record.priority.toLowerCase()}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status status-${record.status.toLowerCase().replace(' ', '-')}`}>
                          {record.status}
                        </span>
                      </td>
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
                    </>
                  ) : (
                    <>
                      <td>{record.employeeId?.name || '-'}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                      <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                      <td>
                        <span className={`status status-${record.status.toLowerCase().replace(' ', '-')}`}>
                          {record.status}
                        </span>
                      </td>
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
                    </>
                  )}
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
              <h3>{editingRecord ? `Edit ${activeTab === 'employees' ? 'Employee' : activeTab === 'tasks' ? 'Task' : 'Attendance Record'}` : `Add New ${activeTab === 'employees' ? 'Employee' : activeTab === 'tasks' ? 'Task' : 'Attendance Record'}`}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {activeTab === 'employees' ? (
                <>
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
                    <label htmlFor="position">Position</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="hireDate">Hire Date</label>
                    <input
                      type="date"
                      id="hireDate"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="salary">Salary</label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., Feeding, Milking, Cleaning"
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
                    />
                  </div>
                </>
              ) : activeTab === 'tasks' ? (
                <>
                  <div className="form-group">
                    <label htmlFor="title">Task Title</label>
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
                    <label htmlFor="assignedTo">Assign To</label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                    >
                      <option value="">Select an employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.position})
                        </option>
                      ))}
                    </select>
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
                          {animal.name} ({animal.species})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="taskType">Task Type</label>
                    <select
                      id="taskType"
                      name="taskType"
                      value={formData.taskType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Feeding">Feeding</option>
                      <option value="Milking">Milking</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Health Check">Health Check</option>
                      <option value="Breeding">Breeding</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Other">Other</option>
                    </select>
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
                    <label htmlFor="estimatedDuration">Estimated Duration (minutes)</label>
                    <input
                      type="number"
                      id="estimatedDuration"
                      name="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                      min="0"
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
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="employeeId">Employee</label>
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.position})
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
                    <label htmlFor="checkIn">Check In Time</label>
                    <input
                      type="time"
                      id="checkIn"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="checkOut">Check Out Time</label>
                    <input
                      type="time"
                      id="checkOut"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
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
                </>
              )}
              
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

export default Staff;
