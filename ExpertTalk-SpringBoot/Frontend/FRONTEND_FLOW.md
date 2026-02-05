# Expert Talk Platform - Frontend Flow Script

## 🚀 Application Entry Point
**File:** `src/index.jsx`
```
index.jsx → App.jsx (wrapped in AuthProvider)
```

## 📱 Main App Structure
**File:** `src/App.jsx`
```
App.jsx
├── AuthProvider (context/AuthContext.jsx)
├── Router (react-router-dom)
└── Routes:
    ├── / → LandingPage.jsx
    ├── /login → Login.jsx (PublicRoute)
    ├── /register → Register.jsx (PublicRoute)
    ├── /user-dashboard → UserDashboard.jsx (ProtectedRoute - Role 1)
    ├── /expert-dashboard → ExpertDashboard.jsx (ProtectedRoute - Role 2)
    ├── /admin-dashboard → AdminDashboard.jsx (ProtectedRoute - Role 3)
    ├── /profile → Profile.jsx (ProtectedRoute - All Roles)
    └── /chat/:sessionId → Chat.jsx (ProtectedRoute - Roles 1,2)
```

## 🔐 Authentication Flow
**Files:** `context/AuthContext.jsx` + `services/api.js`
```
1. User visits site → LandingPage.jsx
2. Click Login → Login.jsx
3. Login.jsx → authAPI.login() → services/api.js
4. API Success → AuthContext updates user/token → localStorage
5. Redirect based on role:
   - Role 1 (User) → /user-dashboard
   - Role 2 (Expert) → /expert-dashboard  
   - Role 3 (Admin) → /admin-dashboard
```

## 👤 User Journey Flow
**Main File:** `pages/UserDashboard.jsx`

### Dashboard Load:
```
UserDashboard.jsx
├── useAuth() → context/AuthContext.jsx (get user data)
├── useEffect() → categoriesAPI.getAll() → services/api.js
├── Header.jsx (component)
└── Two Tabs:
    ├── "Find Experts" (default)
    └── "My Chats"
```

### Find Experts Flow:
```
1. UserDashboard.jsx → Display categories
2. User clicks category → fetchExperts(categoryId)
3. fetchExperts() → categoriesAPI.getExperts() → services/api.js
4. Display experts list
5. User clicks "Start Consultation" → setShowPaymentModal(true)
6. PaymentModal.jsx opens
7. Payment success → chatAPI.startSession() → services/api.js
8. navigate(`/chat/${sessionId}`) → Chat.jsx
```

### My Chats Flow:
```
1. User clicks "My Chats" tab → setActiveTab('chats')
2. useEffect() → fetchSessions()
3. fetchSessions() → chatAPI.getSessions() → services/api.js
4. Display sessions list
5. User clicks "Join Chat" → navigate(`/chat/${sessionId}`) → Chat.jsx
```

## 💬 Chat Flow
**File:** `pages/Chat.jsx`
```
Chat.jsx
├── useParams() → get sessionId from URL
├── useEffect() → chatAPI.getSessionInfo(sessionId) → services/api.js
├── useEffect() → chatAPI.getMessages(sessionId) → services/api.js
├── WebSocket/SignalR connection for real-time messaging
└── Message sending → API call to save message
```

## 👨‍💼 Expert Journey Flow
**Main File:** `pages/ExpertDashboard.jsx`
```
ExpertDashboard.jsx
├── useAuth() → context/AuthContext.jsx
├── Display earnings → chatAPI.getExpertEarnings() → services/api.js
├── Display active sessions
└── Join session → navigate(`/chat/${sessionId}`) → Chat.jsx
```

## 🔧 Admin Flow
**Main File:** `pages/AdminDashboard.jsx`
```
AdminDashboard.jsx
├── useAuth() → context/AuthContext.jsx
├── adminAPI.getStats() → services/api.js
├── Manage Users → adminAPI.getUsers() → services/api.js
├── Manage Categories → adminAPI.getCategories() → services/api.js
├── Approve Experts → adminAPI.getPendingExperts() → services/api.js
└── Monitor Sessions → adminAPI.getSessions() → services/api.js
```

## 🛡️ Route Protection
**Files:** `components/ProtectedRoute.jsx` + `components/PublicRoute.jsx`
```
ProtectedRoute.jsx
├── useAuth() → check if user logged in
├── Check user role against allowedRoles
├── If authorized → render children
└── If not → redirect to /login

PublicRoute.jsx
├── useAuth() → check if user logged in
├── If logged in → redirect to appropriate dashboard
└── If not → render children (Login/Register)
```

## 🌐 API Service Layer
**File:** `services/api.js`
```
api.js
├── axios instance with baseURL: 'http://localhost:5045/api'
├── Request interceptor → add Bearer token from localStorage
├── API modules:
    ├── authAPI (login, register, logout)
    ├── categoriesAPI (getAll, getExperts)
    ├── chatAPI (startSession, getSessions, getMessages)
    ├── paymentAPI (createOrder, verifyPayment)
    ├── adminAPI (getStats, manage users/categories)
    └── profileAPI (updateProfile, changePassword)
```

## 🎨 Component Structure
```
components/
├── Header.jsx → Navigation, user menu, logout
├── Footer.jsx → Site footer
├── PaymentModal.jsx → Payment processing
├── ConfirmModal.jsx → Confirmation dialogs
├── ProtectedRoute.jsx → Route authentication
└── PublicRoute.jsx → Public route handling
```

## 📄 Page Components
```
pages/
├── LandingPage.jsx → Home page
├── Login.jsx → User authentication
├── Register.jsx → User registration
├── UserDashboard.jsx → User main interface
├── ExpertDashboard.jsx → Expert main interface
├── AdminDashboard.jsx → Admin main interface
├── Chat.jsx → Real-time messaging
├── Profile.jsx → User profile management
└── Static pages (AboutUs, ContactUs, etc.)
```

## 🔄 State Management
```
Context:
├── AuthContext.jsx → Global user state, auth methods
└── Local State → Component-specific state (useState, useEffect)

Storage:
├── localStorage → token, user data persistence
└── Session storage → temporary data
```

## 🚦 Navigation Flow Summary
```
1. Landing → Login → Dashboard (based on role)
2. User Dashboard → Find Experts → Payment → Chat
3. User Dashboard → My Chats → Join Chat
4. Expert Dashboard → Active Sessions → Join Chat
5. Admin Dashboard → Manage Platform
6. Any Page → Profile → Update Info
7. Any Page → Logout → Landing
```

## 🔧 Development Commands
```bash
npm start    # Start development server (localhost:3000)
npm build    # Build for production
```

## 📦 Key Dependencies
```json
{
  "react": "^19.2.3",
  "react-router-dom": "^7.11.0",
  "axios": "^1.13.2",
  "@microsoft/signalr": "^10.0.0",
  "tailwindcss": "^3.4.0"
}
```