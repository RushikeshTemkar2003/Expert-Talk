# ExpertTalk - Expert Consultation Platform

A full-stack web application connecting users with verified experts across multiple domains including finance, healthcare, technology, and legal services.

## 🚀 Tech Stack

**Backend:**
- Spring Boot 3.x
- MySQL Database
- JWT Authentication
- Spring Security
- Maven

**Frontend:**
- React 18
- Tailwind CSS
- Axios for API calls
- React Router for navigation

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven (included with project)

## 🛠️ Installation & Setup

### 1. Database Setup
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE expert_talk;

-- Verify creation
SHOW DATABASES;
exit
```

### 2. Backend Configuration
Update `experttalk_backend/expert-talk/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expert_talk
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Quick Start (Recommended)
```bash
# Navigate to project root
cd "C:\Users\[YourUsername]\Downloads\Expert-Talk-main\Expert-Talk-main"

# Double-click start-app.bat file
# OR run in command prompt:
start-app.bat
```

### 4. Manual Start
**Backend (Terminal 1):**
```bash
cd experttalk_backend/expert-talk
./mvnw spring-boot:run
# Windows: .\mvnw.cmd spring-boot:run
```

**Frontend (Terminal 2):**
```bash
cd experttalk_frontend/expert-talk-frontend
npm install
npm start
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Console** (if using H2): http://localhost:8080/h2-console

## 👥 User Roles & Features

### 🏠 Public Features
- Beautiful landing page with hero slider
- Service information pages
- About, Contact, How It Works pages
- User registration and login

### 👤 User Dashboard
- Browse expert categories
- View expert profiles
- Book consultations (future feature)

### 👨‍💼 Expert Dashboard
- Create and manage expert profile
- Set consultation rates and availability
- View approval status
- Manage consultation sessions (future feature)

### 👑 Admin Dashboard
- **Category Management**: Create, edit, enable/disable categories
- **User Management**: View, block/unblock, delete users
- **Expert Approval**: Approve/reject expert applications
- **System Monitoring**: View platform statistics

## 🔐 Authentication

The application uses JWT-based authentication with role-based access control:

- **USER**: Basic user access
- **EXPERT**: Expert profile management + user features
- **ADMIN**: Full system administration + all features

## 📱 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login    - User login
```

### Categories (Admin)
```
GET    /admin/categories/allCategories - Get all categories
POST   /admin/categories/create        - Create category
PUT    /admin/categories/{id}          - Update category
PUT    /admin/categories/{id}/enable   - Enable category
PUT    /admin/categories/{id}/disable  - Disable category
DELETE /admin/categories/{id}          - Delete category
```

### Expert Profile
```
POST /expert/profile/create - Create expert profile
GET  /expert/profile/get    - Get expert profile
PUT  /expert/profile/update - Update expert profile
```

### Admin User Management
```
GET    /admin/users              - Get all users
PUT    /admin/users/{id}/block   - Block user
PUT    /admin/users/{id}/unblock - Unblock user
DELETE /admin/users/{id}         - Delete user
```

### Admin Expert Management
```
GET /admin/experts/pending     - Get pending expert approvals
PUT /admin/experts/{id}/approve - Approve expert
PUT /admin/experts/{id}/reject  - Reject expert
```

## 🗂️ Project Structure

```
Expert-Talk-main/
├── experttalk_backend/
│   └── expert-talk/
│       ├── src/main/java/com/experttalk/
│       │   ├── controller/     # REST Controllers
│       │   ├── service/        # Business Logic
│       │   ├── repository/     # Data Access
│       │   ├── entity/         # JPA Entities
│       │   ├── dto/           # Data Transfer Objects
│       │   ├── config/        # Configuration Classes
│       │   └── security/      # Security & JWT
│       └── src/main/resources/
│           └── application.properties
├── experttalk_frontend/
│   └── expert-talk-frontend/
│       ├── src/
│       │   ├── components/    # Reusable Components
│       │   ├── pages/        # Page Components
│       │   ├── context/      # React Context
│       │   └── services/     # API Services
│       └── package.json
├── start-app.bat             # Startup Script
└── README.md
```

## 🎯 Getting Started Guide

1. **Create Admin Account**:
   - Go to http://localhost:3000/register
   - Fill form with role "ADMIN"
   - Login to access admin dashboard

2. **Create Categories**:
   - Login as admin
   - Go to Categories tab
   - Add categories like "Finance", "Healthcare", etc.

3. **Create Expert Account**:
   - Register with role "EXPERT"
   - Login and create expert profile
   - Wait for admin approval

4. **Test User Flow**:
   - Register as "USER"
   - Browse categories on landing page
   - View expert profiles

## 🔧 Troubleshooting

### Database Connection Issues
```properties
# Try H2 in-memory database for testing
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
```

### Port Conflicts
- Backend: Change `server.port=8080` in application.properties
- Frontend: Change port in package.json start script

### CORS Issues
CORS is configured for `http://localhost:3000`. Update `SecurityConfig.java` if using different ports.

## 🚀 Future Features

- Real-time chat system
- Payment integration (Razorpay)
- Video consultation
- Rating and review system
- Advanced search and filtering
- Mobile app support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@experttalk.com (placeholder)

---

**Happy Coding! 🎉**