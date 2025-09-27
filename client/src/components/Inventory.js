import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Feed',
    currentStock: '',
    unit: 'Kilograms',
    minimumStock: '',
    unitCost: '',
    supplier: '',
    supplierContact: '',
    expiryDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventoryItems(response.data);
    } catch (error) {
      setError('Failed to fetch inventory data');
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
        currentStock: parseFloat(formData.currentStock),
        minimumStock: parseFloat(formData.minimumStock) || 0,
        unitCost: parseFloat(formData.unitCost) || 0
      };

      if (editingItem) {
        await inventoryAPI.update(editingItem._id, submitData);
        setSuccess('Inventory item updated successfully');
      } else {
        await inventoryAPI.create(submitData);
        setSuccess('Inventory item added successfully');
      }
      
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: 'Feed',
      currentStock: '',
      unit: 'Kilograms',
      minimumStock: '',
      unitCost: '',
      supplier: '',
      supplierContact: '',
      expiryDate: '',
      notes: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minimumStock: item.minimumStock || '',
      unitCost: item.unitCost || '',
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryAPI.delete(id);
        setSuccess('Inventory item deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete inventory item');
      }
    }
  };

  const openModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError('');
    setSuccess('');
  };

  const getStockStatus = (currentStock, minimumStock) => {
    if (currentStock <= minimumStock) {
      return { status: 'Low Stock', className: 'low-stock' };
    } else if (currentStock <= minimumStock * 1.5) {
      return { status: 'Medium Stock', className: 'medium-stock' };
    } else {
      return { status: 'Good Stock', className: 'good-stock' };
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Inventory Management</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New Inventory Item
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {inventoryItems.length === 0 ? (
        <div className="empty-state">
          <h3>No inventory items found</h3>
          <p>Add your first inventory item to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Unit Cost</th>
                <th>Supplier</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
                return (
                  <tr key={item._id}>
                    <td>{item.itemName}</td>
                    <td>{item.category}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.unit}</td>
                    <td>{item.minimumStock}</td>
                    <td>
                      <span className={`stock-status ${stockStatus.className}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td>{item.unitCost ? `$${item.unitCost}` : '-'}</td>
                    <td>{item.supplier || '-'}</td>
                    <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="btn btn-secondary"
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="itemName">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g., Cattle Feed, Antibiotics, etc."
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
                  <option value="Feed">Feed</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="currentStock">Current Stock</label>
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="Kilograms">Kilograms</option>
                  <option value="Liters">Liters</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Bags">Bags</option>
                  <option value="Bottles">Bottles</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="minimumStock">Minimum Stock Level</label>
                <input
                  type="number"
                  id="minimumStock"
                  name="minimumStock"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Alert when stock falls below this level"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="unitCost">Unit Cost ($)</label>
                <input
                  type="number"
                  id="unitCost"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="supplier">Supplier</label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Supplier name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="supplierContact">Supplier Contact</label>
                <input
                  type="text"
                  id="supplierContact"
                  name="supplierContact"
                  value={formData.supplierContact}
                  onChange={handleChange}
                  placeholder="Phone number or email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
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
                  placeholder="Any additional notes about this item..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Add'} Item
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

export default Inventory;
