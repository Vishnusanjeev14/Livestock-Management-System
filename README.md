# Livestock Management System

A full-stack web application for managing livestock records including animals, breeding, feeding, health, and production data.

## Features

- **User Authentication**: Secure signup and signin with JWT tokens
- **Animal Management**: Add, edit, delete, and view livestock information
- **Breeding Records**: Track breeding activities and outcomes
- **Feeding Records**: Monitor feeding schedules and nutrition
- **Health Records**: Maintain comprehensive health checkup records
- **Production Records**: Track production data and yields
- **Veterinary Records**: Schedule appointments, track treatments, and manage vet contacts
- **Sales Management**: Track animal sales and product sales with buyer information
- **Inventory Management**: Monitor feed, medicine, and equipment stock levels
- **Financial Management**: Track expenses, income, and generate profitability reports
- **Staff Management**: Manage employees, assign tasks, and track attendance
- **Environmental Monitoring**: Record weather conditions and environmental data with city selection
- **Task Scheduler**: Set reminders for vaccinations, breeding checks, and feeding times
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing     

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Plain CSS for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The MongoDB connection is already configured in `config.js` with your provided URL.

4. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Livestock
- `GET /api/livestock` - Get all animals
- `POST /api/livestock` - Create new animal
- `PUT /api/livestock/:id` - Update animal
- `DELETE /api/livestock/:id` - Delete animal

### Breeding Records
- `GET /api/breeding` - Get all breeding records
- `POST /api/breeding` - Create new breeding record
- `PUT /api/breeding/:id` - Update breeding record
- `DELETE /api/breeding/:id` - Delete breeding record

### Feeding Records
- `GET /api/feeding` - Get all feeding records
- `POST /api/feeding` - Create new feeding record
- `PUT /api/feeding/:id` - Update feeding record
- `DELETE /api/feeding/:id` - Delete feeding record

### Health Records
- `GET /api/health` - Get all health records
- `POST /api/health` - Create new health record
- `PUT /api/health/:id` - Update health record
- `DELETE /api/health/:id` - Delete health record

### Production Records
- `GET /api/production` - Get all production records
- `POST /api/production` - Create new production record
- `PUT /api/production/:id` - Update production record
- `DELETE /api/production/:id` - Delete production record

### Veterinary Records
- `GET /api/veterinary` - Get all veterinary records
- `POST /api/veterinary` - Create new veterinary record
- `PUT /api/veterinary/:id` - Update veterinary record
- `DELETE /api/veterinary/:id` - Delete veterinary record

### Sales Management
- `GET /api/sales/animals` - Get all animal sales
- `POST /api/sales/animals` - Create new animal sale
- `PUT /api/sales/animals/:id` - Update animal sale
- `DELETE /api/sales/animals/:id` - Delete animal sale
- `GET /api/sales/products` - Get all product sales
- `POST /api/sales/products` - Create new product sale
- `PUT /api/sales/products/:id` - Update product sale
- `DELETE /api/sales/products/:id` - Delete product sale

### Inventory Management
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/low-stock` - Get low stock items

### Financial Management
- `GET /api/finance/expenses` - Get all expenses
- `POST /api/finance/expenses` - Create new expense
- `PUT /api/finance/expenses/:id` - Update expense
- `DELETE /api/finance/expenses/:id` - Delete expense
- `GET /api/finance/income` - Get all income
- `POST /api/finance/income` - Create new income
- `PUT /api/finance/income/:id` - Update income
- `DELETE /api/finance/income/:id` - Delete income
- `GET /api/finance/summary` - Get financial summary with date range

### Staff Management
- `GET /api/staff/employees` - Get all employees
- `POST /api/staff/employees` - Create new employee
- `PUT /api/staff/employees/:id` - Update employee
- `DELETE /api/staff/employees/:id` - Delete employee
- `GET /api/staff/tasks` - Get all tasks
- `POST /api/staff/tasks` - Create new task
- `PUT /api/staff/tasks/:id` - Update task
- `DELETE /api/staff/tasks/:id` - Delete task
- `GET /api/staff/attendance` - Get attendance records
- `POST /api/staff/attendance` - Create attendance record
- `PUT /api/staff/attendance/:id` - Update attendance
- `DELETE /api/staff/attendance/:id` - Delete attendance

### Environmental Monitoring
- `GET /api/environment` - Get all environmental data
- `POST /api/environment` - Create environmental data
- `PUT /api/environment/:id` - Update environmental data
- `DELETE /api/environment/:id` - Delete environmental data
- `GET /api/environment/forecast/:city` - Get weather forecast for city
- `GET /api/environment/cities/list` - Get list of available cities

### Task Scheduler
- `GET /api/scheduler` - Get all reminders
- `POST /api/scheduler` - Create new reminder
- `PUT /api/scheduler/:id` - Update reminder
- `DELETE /api/scheduler/:id` - Delete reminder
- `GET /api/scheduler/upcoming/list` - Get upcoming reminders (7 days)
- `PUT /api/scheduler/:id/complete` - Mark reminder as completed
- `GET /api/scheduler/dashboard/summary` - Get scheduler dashboard summary

## Usage

1. **Sign Up**: Create a new account with your details
2. **Sign In**: Login with your credentials
3. **Dashboard**: Overview of the system with quick access to all features
4. **Animals**: Add and manage your livestock
5. **Breeding**: Record breeding activities
6. **Feeding**: Track feeding schedules
7. **Health**: Maintain health records
8. **Production**: Monitor production data
9. **Veterinary**: Schedule appointments and track treatments
10. **Sales**: Manage animal and product sales
11. **Inventory**: Track feed, medicine, and equipment stock
12. **Finance**: Monitor expenses, income, and profitability
13. **Staff**: Manage employees, tasks, and attendance
14. **Environment**: Monitor weather and environmental conditions
15. **Scheduler**: Set reminders and manage tasks

## Data Models

### User
- name, email, password, phoneNumber

### Livestock
- name, species, breed, dateOfBirth, gender, healthStatus

### Breeding Record
- animalId, partnerAnimalId, breedingDate, outcome, notes

### Feeding Record
- animalId, feedType, quantity, date, notes

### Health Record
- animalId, checkupDate, diagnosis, treatment, vetName, notes

### Production Record
- animalId, date, productType, quantity, notes

### Veterinary Record
- animalId, appointmentDate, vetName, vetContact, visitType, diagnosis, treatment, medication, dosage, nextVisitDate, cost, notes

### Animal Sale
- animalId, saleDate, buyerName, buyerContact, salePrice, saleReason, notes

### Product Sale
- animalId, saleDate, productType, quantity, unit, unitPrice, totalPrice, buyerName, buyerContact, notes

### Inventory Item
- itemName, category, currentStock, unit, minimumStock, unitCost, supplier, supplierContact, expiryDate, notes

### Expense
- expenseDate, category, description, amount, animalId, supplier, paymentMethod, notes

### Income
- incomeDate, category, description, amount, animalId, buyer, paymentMethod, notes

### Employee
- name, position, email, phone, hireDate, salary, status, skills, notes

### Task
- title, description, assignedTo, animalId, taskType, priority, status, dueDate, completedDate, estimatedDuration, actualDuration, notes

### Attendance
- employeeId, date, checkIn, checkOut, hoursWorked, status, notes

### Environmental Data
- location (city, coordinates), date, temperature, humidity, waterLevel, rainfall, windSpeed, weatherCondition, airQuality, notes

### Reminder
- title, description, animalId, reminderType, dueDate, priority, status, isRecurring, recurringInterval, completedDate, notes

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected routes requiring authentication
- User-specific data isolation

## Development

The application is structured with:
- `/server` - Backend Node.js application
- `/client` - Frontend React application

Both applications can be run simultaneously for full-stack development.
