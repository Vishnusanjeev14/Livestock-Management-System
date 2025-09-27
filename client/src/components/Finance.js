import React, { useState, useEffect } from 'react';
import { financeAPI, livestockAPI } from '../services/api';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    expenseDate: '',
    incomeDate: '',
    category: 'Feed',
    description: '',
    amount: '',
    supplier: '',
    buyer: '',
    paymentMethod: 'Cash',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesResponse, incomeResponse, animalsResponse, summaryResponse] = await Promise.all([
        financeAPI.getExpenses(),
        financeAPI.getIncome(),
        livestockAPI.getAll(),
        financeAPI.getSummary()
      ]);
      setExpenses(expensesResponse.data);
      setIncome(incomeResponse.data);
      setAnimals(animalsResponse.data);
      setSummary(summaryResponse.data);
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
        amount: parseFloat(formData.amount)
      };

      if (activeTab === 'expenses') {
        if (editingRecord) {
          await financeAPI.updateExpense(editingRecord._id, submitData);
          setSuccess('Expense updated successfully');
        } else {
          await financeAPI.createExpense(submitData);
          setSuccess('Expense added successfully');
        }
      } else {
        if (editingRecord) {
          await financeAPI.updateIncome(editingRecord._id, submitData);
          setSuccess('Income updated successfully');
        } else {
          await financeAPI.createIncome(submitData);
          setSuccess('Income added successfully');
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
      animalId: '',
      expenseDate: '',
      incomeDate: '',
      category: 'Feed',
      description: '',
      amount: '',
      supplier: '',
      buyer: '',
      paymentMethod: 'Cash',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'expenses') {
      setFormData({
        animalId: record.animalId?._id || '',
        expenseDate: record.expenseDate.split('T')[0],
        incomeDate: '',
        category: record.category,
        description: record.description,
        amount: record.amount,
        supplier: record.supplier || '',
        buyer: '',
        paymentMethod: record.paymentMethod,
        notes: record.notes || ''
      });
    } else {
      setFormData({
        animalId: record.animalId?._id || '',
        expenseDate: '',
        incomeDate: record.incomeDate.split('T')[0],
        category: record.category,
        description: record.description,
        amount: record.amount,
        supplier: '',
        buyer: record.buyer || '',
        paymentMethod: record.paymentMethod,
        notes: record.notes || ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        if (activeTab === 'expenses') {
          await financeAPI.deleteExpense(id);
        } else {
          await financeAPI.deleteIncome(id);
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

  const handleDateRangeChange = async () => {
    if (dateRange.startDate && dateRange.endDate) {
      try {
        const response = await financeAPI.getSummary(dateRange.startDate, dateRange.endDate);
        setSummary(response.data);
      } catch (error) {
        setError('Failed to fetch summary for date range');
      }
    } else {
      fetchData();
    }
  };

  if (loading) {
    return <div className="loading">Loading financial data...</div>;
  }

  const currentRecords = activeTab === 'expenses' ? expenses : income;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Expenses & Finance</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New {activeTab === 'expenses' ? 'Expense' : 'Income'}
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button 
          className={`tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'reports' ? (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Financial Summary</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
              <button onClick={handleDateRangeChange} className="btn btn-secondary">
                Filter
              </button>
            </div>
            
            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="summary-card">
                  <h4>Total Income</h4>
                  <p style={{ fontSize: '24px', color: 'green', fontWeight: 'bold' }}>
                    ${summary.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="summary-card">
                  <h4>Total Expenses</h4>
                  <p style={{ fontSize: '24px', color: 'red', fontWeight: 'bold' }}>
                    ${summary.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="summary-card">
                  <h4>Net Profit</h4>
                  <p style={{ 
                    fontSize: '24px', 
                    color: summary.netProfit >= 0 ? 'green' : 'red', 
                    fontWeight: 'bold' 
                  }}>
                    ${summary.netProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card">
                <h4>Income by Category</h4>
                {summary.incomeByCategory.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>{item._id}</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h4>Expenses by Category</h4>
                {summary.expensesByCategory.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>{item._id}</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
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
                    <th>Animal</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>{activeTab === 'expenses' ? 'Supplier' : 'Buyer'}</th>
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{record.animalId?.name || '-'}</td>
                      <td>{new Date(activeTab === 'expenses' ? record.expenseDate : record.incomeDate).toLocaleDateString()}</td>
                      <td>{record.category}</td>
                      <td>{record.description}</td>
                      <td>${record.amount}</td>
                      <td>{activeTab === 'expenses' ? (record.supplier || '-') : (record.buyer || '-')}</td>
                      <td>{record.paymentMethod}</td>
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
                  <h3>{editingRecord ? `Edit ${activeTab === 'expenses' ? 'Expense' : 'Income'}` : `Add New ${activeTab === 'expenses' ? 'Expense' : 'Income'}`}</h3>
                  <button onClick={closeModal} className="close-btn">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="animalId">Animal (Optional)</label>
                    <select
                      id="animalId"
                      name="animalId"
                      value={formData.animalId}
                      onChange={handleChange}
                    >
                      <option value="">Select an animal (optional)</option>
                      {animals.map((animal) => (
                        <option key={animal._id} value={animal._id}>
                          {animal.name} ({animal.species} - {animal.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={activeTab === 'expenses' ? 'expenseDate' : 'incomeDate'}>
                      {activeTab === 'expenses' ? 'Expense' : 'Income'} Date
                    </label>
                    <input
                      type="date"
                      id={activeTab === 'expenses' ? 'expenseDate' : 'incomeDate'}
                      name={activeTab === 'expenses' ? 'expenseDate' : 'incomeDate'}
                      value={activeTab === 'expenses' ? formData.expenseDate : formData.incomeDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {activeTab === 'expenses' ? (
                        <>
                          <option value="Feed">Feed</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Labor">Labor</option>
                          <option value="Veterinary">Veterinary</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Transport">Transport</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="Animal Sale">Animal Sale</option>
                          <option value="Product Sale">Product Sale</option>
                          <option value="Milk">Milk</option>
                          <option value="Eggs">Eggs</option>
                          <option value="Meat">Meat</option>
                          <option value="Wool">Wool</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the transaction"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="amount">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={activeTab === 'expenses' ? 'supplier' : 'buyer'}>
                      {activeTab === 'expenses' ? 'Supplier' : 'Buyer'}
                    </label>
                    <input
                      type="text"
                      id={activeTab === 'expenses' ? 'supplier' : 'buyer'}
                      name={activeTab === 'expenses' ? 'supplier' : 'buyer'}
                      value={activeTab === 'expenses' ? formData.supplier : formData.buyer}
                      onChange={handleChange}
                      placeholder={activeTab === 'expenses' ? 'Supplier name' : 'Buyer name'}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Other">Other</option>
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
                      placeholder="Any additional notes about this transaction..."
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
        </>
      )}
    </div>
  );
};

export default Finance;
