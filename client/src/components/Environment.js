import React, { useState, useEffect } from 'react';
import { environmentAPI } from '../services/api';

const Environment = () => {
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [cities, setCities] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    location: {
      city: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    date: '',
    temperature: '',
    humidity: '',
    waterLevel: '',
    rainfall: '',
    windSpeed: '',
    weatherCondition: 'Sunny',
    airQuality: 'Good',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dataResponse, citiesResponse] = await Promise.all([
        environmentAPI.getAll(),
        environmentAPI.getCities()
      ]);
      setEnvironmentalData(dataResponse.data);
      setCities(citiesResponse.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value
        }
      });
    } else if (name.startsWith('coordinates.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            ...formData.location.coordinates,
            [field]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        waterLevel: formData.waterLevel ? parseFloat(formData.waterLevel) : undefined,
        rainfall: formData.rainfall ? parseFloat(formData.rainfall) : undefined,
        windSpeed: formData.windSpeed ? parseFloat(formData.windSpeed) : undefined,
        location: {
          ...formData.location,
          coordinates: {
            latitude: formData.location.coordinates.latitude ? parseFloat(formData.location.coordinates.latitude) : undefined,
            longitude: formData.location.coordinates.longitude ? parseFloat(formData.location.coordinates.longitude) : undefined
          }
        }
      };

      if (editingRecord) {
        await environmentAPI.update(editingRecord._id, submitData);
        setSuccess('Environmental data updated successfully');
      } else {
        await environmentAPI.create(submitData);
        setSuccess('Environmental data added successfully');
      }
      
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save environmental data');
    }
  };

  const resetForm = () => {
    setFormData({
      location: {
        city: '',
        coordinates: {
          latitude: '',
          longitude: ''
        }
      },
      date: '',
      temperature: '',
      humidity: '',
      waterLevel: '',
      rainfall: '',
      windSpeed: '',
      weatherCondition: 'Sunny',
      airQuality: 'Good',
      notes: ''
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      location: {
        city: record.location.city,
        coordinates: {
          latitude: record.location.coordinates?.latitude || '',
          longitude: record.location.coordinates?.longitude || ''
        }
      },
      date: record.date.split('T')[0],
      temperature: record.temperature,
      humidity: record.humidity,
      waterLevel: record.waterLevel || '',
      rainfall: record.rainfall || '',
      windSpeed: record.windSpeed || '',
      weatherCondition: record.weatherCondition,
      airQuality: record.airQuality || 'Good',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this environmental data?')) {
      try {
        await environmentAPI.delete(id);
        setSuccess('Environmental data deleted successfully');
        fetchData();
      } catch (error) {
        setError('Failed to delete environmental data');
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

  const handleGetForecast = async () => {
    if (!selectedCity) {
      setError('Please select a city first');
      return;
    }
    
    try {
      const response = await environmentAPI.getForecast(selectedCity);
      setForecast(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch weather forecast');
    }
  };

  if (loading) {
    return <div className="loading">Loading environmental data...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Environmental Monitoring</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add Environmental Data
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Weather Forecast</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Select a city</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
          <button onClick={handleGetForecast} className="btn btn-secondary">
            Get Forecast
          </button>
        </div>
        
        {forecast && (
          <div>
            <h4>Current Weather in {forecast.city}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="weather-card">
                <h5>Temperature</h5>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{forecast.current.temperature}°C</p>
              </div>
              <div className="weather-card">
                <h5>Humidity</h5>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{forecast.current.humidity}%</p>
              </div>
              <div className="weather-card">
                <h5>Condition</h5>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{forecast.current.condition}</p>
              </div>
              <div className="weather-card">
                <h5>Wind Speed</h5>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{forecast.current.windSpeed} km/h</p>
              </div>
            </div>
            
            <h4>7-Day Forecast</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {forecast.forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <h6>{new Date(day.date).toLocaleDateString()}</h6>
                  <p><strong>{day.temperature.high}°C</strong> / {day.temperature.low}°C</p>
                  <p>{day.condition}</p>
                  <p>Humidity: {day.humidity}%</p>
                  {day.rainfall > 0 && <p>Rain: {day.rainfall}mm</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {environmentalData.length === 0 ? (
        <div className="empty-state">
          <h3>No environmental data found</h3>
          <p>Add your first environmental data record to get started.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>City</th>
                <th>Date</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Water Level</th>
                <th>Weather</th>
                <th>Air Quality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {environmentalData.map((record) => (
                <tr key={record._id}>
                  <td>{record.location.city}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.temperature}°C</td>
                  <td>{record.humidity}%</td>
                  <td>{record.waterLevel ? `${record.waterLevel}%` : '-'}</td>
                  <td>{record.weatherCondition}</td>
                  <td>{record.airQuality || '-'}</td>
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
              <h3>{editingRecord ? 'Edit Environmental Data' : 'Add Environmental Data'}</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="location.city">City</label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="coordinates.latitude">Latitude (Optional)</label>
                <input
                  type="number"
                  id="coordinates.latitude"
                  name="coordinates.latitude"
                  value={formData.location.coordinates.latitude}
                  onChange={handleChange}
                  step="any"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="coordinates.longitude">Longitude (Optional)</label>
                <input
                  type="number"
                  id="coordinates.longitude"
                  name="coordinates.longitude"
                  value={formData.location.coordinates.longitude}
                  onChange={handleChange}
                  step="any"
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
                <label htmlFor="temperature">Temperature (°C)</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  required
                  step="any"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="humidity">Humidity (%)</label>
                <input
                  type="number"
                  id="humidity"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="waterLevel">Water Level (%)</label>
                <input
                  type="number"
                  id="waterLevel"
                  name="waterLevel"
                  value={formData.waterLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rainfall">Rainfall (mm)</label>
                <input
                  type="number"
                  id="rainfall"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="windSpeed">Wind Speed (km/h)</label>
                <input
                  type="number"
                  id="windSpeed"
                  name="windSpeed"
                  value={formData.windSpeed}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="weatherCondition">Weather Condition</label>
                <select
                  id="weatherCondition"
                  name="weatherCondition"
                  value={formData.weatherCondition}
                  onChange={handleChange}
                  required
                >
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Stormy">Stormy</option>
                  <option value="Foggy">Foggy</option>
                  <option value="Snowy">Snowy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="airQuality">Air Quality</label>
                <select
                  id="airQuality"
                  name="airQuality"
                  value={formData.airQuality}
                  onChange={handleChange}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Poor">Poor</option>
                  <option value="Hazardous">Hazardous</option>
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
                  {editingRecord ? 'Update' : 'Add'} Data
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

export default Environment;
