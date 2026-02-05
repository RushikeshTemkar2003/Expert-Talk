# ExpertTalk Spring Boot Backend

This is the Spring Boot backend for the ExpertTalk platform, converted from .NET Core.

## Prerequisites

1. **Java 17 or higher**
2. **Maven 3.6+**
3. **MySQL 8.0+**

## Setup Instructions

### 1. Database Setup
```sql
-- Create database (will be created automatically by Spring Boot)
-- Just make sure MySQL is running on localhost:3306
-- Default credentials: root with no password
```

### 2. Configuration
Update `src/main/resources/application.properties` if needed:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/experttalk_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=

# Server Configuration
server.port=5045
```

### 3. Run the Application

#### Option 1: Using the batch file
```bash
start-backend.bat
```

#### Option 2: Using Maven directly
```bash
mvn spring-boot:run
```

#### Option 3: Using IDE
Run the `ExpertTalkApiApplication.java` main class

## API Endpoints

The backend will run on `http://localhost:5045` and provides the same API endpoints as the .NET version:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}/experts` - Get experts by category

### Chat
- `POST /api/chat/start` - Start chat session
- `GET /api/chat/sessions` - Get user's chat sessions
- `GET /api/chat/sessions/{id}/messages` - Get session messages
- `POST /api/chat/sessions/{id}/end` - End chat session

### WebSocket
- WebSocket endpoint: `/ws`
- Chat messaging: `/app/chat.sendMessage`
- Subscribe to: `/topic/chat/{sessionId}`

## Features Implemented

✅ **Authentication & Authorization**
- JWT token-based authentication
- User registration and login
- Role-based access control (User, Expert, Admin)

✅ **User Management**
- User profiles with different types
- Expert profiles with categories and hourly rates
- Online status tracking

✅ **Categories**
- Predefined consultation categories
- Expert filtering by category

✅ **Chat System**
- Real-time messaging via WebSocket
- Chat session management
- Message history

✅ **Database**
- MySQL integration with JPA/Hibernate
- Automatic schema creation
- Data seeding for categories

## Database Schema

The application automatically creates the following tables:
- `users` - User accounts and profiles
- `categories` - Consultation categories
- `chat_sessions` - Chat session records
- `messages` - Chat messages
- `payments` - Payment records (basic structure)

## Frontend Integration

The React frontend should work seamlessly with this Spring Boot backend. The API endpoints and response formats are identical to the .NET version.

Make sure the frontend is configured to call `http://localhost:5045/api` for API requests.

## Development Notes

- CORS is configured to allow requests from `http://localhost:3000`
- JWT tokens expire after 7 days
- Auto-approval is enabled for demo purposes
- WebSocket uses STOMP protocol with SockJS fallback

## Troubleshooting

1. **Port 5045 already in use**: Stop any existing backend services
2. **MySQL connection error**: Ensure MySQL is running and credentials are correct
3. **JWT errors**: Check if the JWT secret is properly configured
4. **CORS issues**: Verify the frontend URL in CORS configuration