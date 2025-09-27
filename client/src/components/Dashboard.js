import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const quickActions = [
    { title: 'Animals', description: 'Manage your livestock', link: '/animals', color: '#007bff' },
    { title: 'Breeding', description: 'Track breeding records', link: '/breeding', color: '#28a745' },
    { title: 'Feeding', description: 'Record feeding schedules', link: '/feeding', color: '#ffc107' },
    { title: 'Health', description: 'Monitor health records', link: '/health', color: '#dc3545' },
    { title: 'Production', description: 'Track production data', link: '/production', color: '#6f42c1' },
    { title: 'Veterinary', description: 'Schedule treatments', link: '/veterinary', color: '#fd7e14' },
    { title: 'Sales', description: 'Manage animal & product sales', link: '/sales', color: '#20c997' },
    { title: 'Inventory', description: 'Track feed and supplies', link: '/inventory', color: '#6c757d' },
    { title: 'Finance', description: 'Monitor expenses and income', link: '/finance', color: '#e83e8c' },
    { title: 'Staff', description: 'Manage employees and tasks', link: '/staff', color: '#17a2b8' },
    { title: 'Environment', description: 'Monitor weather and conditions', link: '/environment', color: 'magenta' },
    { title: 'Scheduler', description: 'Set reminders and tasks', link: '/scheduler', color: 'orange' }
  ];

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Welcome to your Livestock Management System. Use the quick actions below to manage your livestock.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        {quickActions.map((action, index) => (
          <Link 
            key={index} 
            to={action.link} 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit' 
            }}
          >
            <div 
              className="card" 
              style={{ 
                borderLeft: `4px solid ${action.color}`,
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <h3 style={{ color: action.color, marginBottom: '10px' }}>
                {action.title}
              </h3>
              <p style={{ color: '#666', margin: 0 }}>
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="card" style={{ marginTop: '30px' }}>
        <h3>System Overview</h3>
        <p>This livestock management system helps you:</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Track individual animals with detailed information</li>
          <li>Record breeding activities and outcomes</li>
          <li>Monitor feeding schedules and nutrition</li>
          <li>Maintain comprehensive health records</li>
          <li>Track production data and yields</li>
          <li>Schedule veterinary appointments and treatments</li>
          <li>Manage animal and product sales</li>
          <li>Track inventory of feed and supplies</li>
          <li>Monitor expenses, income, and profitability</li>
          <li>Manage staff assignments and track performance</li>
          <li>Monitor environmental conditions and weather</li>
          <li>Schedule tasks and set automated reminders</li>
        </ul>
        <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#666' }}>
          Use the navigation menu above to access different sections of the system.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
