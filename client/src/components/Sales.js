import React, { useState, useEffect } from 'react';
import { salesAPI, livestockAPI } from '../services/api';

const Sales = () => {
  const [activeTab, setActiveTab] = useState('animals');
  const [animalSales, setAnimalSales] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    animalId: '',
    saleDate: '',
    buyerName: '',
    buyerContact: '',
    salePrice: '',
    saleReason: 'Breeding',
    productType: 'Milk',
    quantity: '',
    unit: 'Liters',
    unitPrice: '',
    totalPrice: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [animalSalesResponse, productSalesResponse, animalsResponse] = await Promise.all([
        salesAPI.getAnimalSales(),
        salesAPI.getProductSales(),
        livestockAPI.getAll()
      ]);
      setAnimalSales(animalSalesResponse.data);
      setProductSales(productSalesResponse.data);
      setAnimals(animalsResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Calculate total price for product sales
    if (name === 'quantity' || name === 'unitPrice') {
      const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
      const unitPrice = name === 'unitPrice' ? parseFloat(value) : parseFloat(formData.unitPrice);
      if (quantity && unitPrice) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          totalPrice: (quantity * unitPrice).toFixed(2)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          totalPrice: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
        quantity: formData.quantity ? parseFloat(formData.quantity) : 0,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
        totalPrice: formData.totalPrice ? parseFloat(formData.totalPrice) : 0
      };

      if (activeTab === 'animals') {
        if (editingRecord) {
          await salesAPI.updateAnimalSale(editingRecord._id, submitData);
          setSuccess('Animal sale updated successfully');
        } else {
          await salesAPI.createAnimalSale(submitData);
          setSuccess('Animal sale added successfully');
        }
      } else {
        if (editingRecord) {
          await salesAPI.updateProductSale(editingRecord._id, submitData);
          setSuccess('Product sale updated successfully');
        } else {
          await salesAPI.createProductSale(submitData);
          setSuccess('Product sale added successfully');
        }
      }
      
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save sale record');
    }
  };

  const resetForm = () => {
    setFormData({
      animalId: '',
      saleDate: '',
      buyerName: '',
      buyerContact: '',
      salePrice: '',
      saleReason: 'Breeding',
      productType: 'Milk',
      quantity: '',
      unit: 'Liters',
      unitPrice: '',
      totalPrice: '',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (activeTab === 'animals') {
      setFormData({
        animalId: record.animalId._id,
        saleDate: record.saleDate.split('T')[0],
        buyerName: record.buyerName,
        buyerContact: record.buyerContact || '',
        salePrice: record.salePrice || '',
        saleReason: record.saleReason,
        productType: 'Milk',
        quantity: '',
        unit: 'Liters',
        unitPrice: '',
        totalPrice: '',
        notes: record.notes || ''
      });
    } else {
      setFormData({
        animalId: record.animalId?._id || '',
        saleDate: record.saleDate.split('T')[0],
        buyerName: record.buyerName,
        buyerContact: record.buyerContact || '',
        salePrice: '',
        saleReason: 'Breeding',
        productType: record.productType,
        quantity: record.quantity || '',
        unit: record.unit,
        unitPrice: record.unitPrice || '',
        totalPrice: record.totalPrice || '',
        notes: record.notes || ''
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      try {
        if (activeTab === 'animals') {
          await salesAPI.deleteAnimalSale(id);
        } else {
          await salesAPI.deleteProductSale(id);
        }
        setSuccess('Sale record deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete sale record');
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
    return <div className="loading">Loading sales records...</div>;
  }

  const currentRecords = activeTab === 'animals' ? animalSales : productSales;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sales & Inventory</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add New {activeTab === 'animals' ? 'Animal Sale' : 'Product Sale'}
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab ${activeTab === 'animals' ? 'active' : ''}`}
          onClick={() => setActiveTab('animals')}
        >
          Animal Sales
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Sales
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {currentRecords.length === 0 ? (
        <div className="empty-state">
          <h3>No {activeTab} sales found</h3>
          <p>Add your first {activeTab} sale to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                {activeTab === 'animals' ? (
                  <>
                    <th>Animal</th>
                    <th>Sale Date</th>
                    <th>Buyer</th>
                    <th>Sale Reason</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Animal</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                    <th>Buyer</th>
                    <th>Sale Date</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr key={record._id}>
                  {activeTab === 'animals' ? (
                    <>
                      <td>{record.animalId?.name} ({record.animalId?.species})</td>
                      <td>{new Date(record.saleDate).toLocaleDateString()}</td>
                      <td>{record.buyerName}</td>
                      <td>{record.saleReason}</td>
                      <td>${record.salePrice}</td>
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
                      <td>{record.animalId?.name || '-'}</td>
                      <td>{record.productType}</td>
                      <td>{record.quantity} {record.unit}</td>
                      <td>${record.unitPrice}</td>
                      <td>${record.totalPrice}</td>
                      <td>{record.buyerName}</td>
                      <td>{new Date(record.saleDate).toLocaleDateString()}</td>
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
              <h3>{editingRecord ? `Edit ${activeTab === 'animals' ? 'Animal' : 'Product'} Sale` : `Add New ${activeTab === 'animals' ? 'Animal' : 'Product'} Sale`}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {activeTab === 'animals' ? (
                <>
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
                    <label htmlFor="saleDate">Sale Date</label>
                    <input
                      type="date"
                      id="saleDate"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="buyerName">Buyer Name</label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="buyerContact">Buyer Contact</label>
                    <input
                      type="text"
                      id="buyerContact"
                      name="buyerContact"
                      value={formData.buyerContact}
                      onChange={handleChange}
                      placeholder="Phone number or email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="salePrice">Sale Price ($)</label>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="saleReason">Sale Reason</label>
                    <select
                      id="saleReason"
                      name="saleReason"
                      value={formData.saleReason}
                      onChange={handleChange}
                      required
                    >
                      <option value="Breeding">Breeding</option>
                      <option value="Meat">Meat</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Wool">Wool</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
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
                    <label htmlFor="productType">Product Type</label>
                    <select
                      id="productType"
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Milk">Milk</option>
                      <option value="Eggs">Eggs</option>
                      <option value="Meat">Meat</option>
                      <option value="Wool">Wool</option>
                      <option value="Cheese">Cheese</option>
                      <option value="Butter">Butter</option>
                      <option value="Other">Other</option>
                    </select>
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
                      <option value="Liters">Liters</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Kilograms">Kilograms</option>
                      <option value="Grams">Grams</option>
                      <option value="Pounds">Pounds</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="unitPrice">Unit Price ($)</label>
                    <input
                      type="number"
                      id="unitPrice"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="totalPrice">Total Price ($)</label>
                    <input
                      type="number"
                      id="totalPrice"
                      name="totalPrice"
                      value={formData.totalPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="saleDate">Sale Date</label>
                    <input
                      type="date"
                      id="saleDate"
                      name="saleDate"
                      value={formData.saleDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="buyerName">Buyer Name</label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="buyerContact">Buyer Contact</label>
                    <input
                      type="text"
                      id="buyerContact"
                      name="buyerContact"
                      value={formData.buyerContact}
                      onChange={handleChange}
                      placeholder="Phone number or email"
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any additional notes about the sale..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Update' : 'Add'} Sale
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

export default Sales;
