# OurApp Social Media

A modern, real-time chat application with private messaging and group chat capabilities. This project features a React frontend and Spring Boot backend with WebSocket support for instant communication.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication**: JWT-based login and registration
- **Avatar Customization**: Set and update profile pictures
- **Session Management**: Persistent authentication with token refresh
- **Logout**: Secure session termination

### 💬 Private Messaging
- **Real-time Chat**: Instant private messaging using WebSockets (STOMP)
- **Typing Indicators**: See when others are typing
- **Message History**: Load and view past conversations
- **Search Contacts**: Find and chat with friends
- **Timestamps**: View message send times with proper date formatting

### 👥 Group Chat
- **Create Groups**: Form group chats with multiple members
- **Group Management**: Add/remove members, update group settings
- **Real-time Group Messaging**: Instant messaging in group chats
- **Group Typing Indicators**: See who's typing in group conversations
- **Group Settings**: Customize group name, description, and avatar
- **Role-Based Permissions**: Admin controls for group management

### 🎨 UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Mobile-First**: Touch-friendly interface with mobile navigation
- **Scrollable Contacts**: Smooth scrolling contact and group lists
- **Empty States**: Helpful messages when no content is available
- **Loading Indicators**: Visual feedback during data loading

### 📱 Mobile Optimizations
- **Mobile Navigation**: Custom navigation bar for mobile devices
- **Back Button**: Easy navigation between views on mobile
- **No Overlapping Issues**: Properly spaced components
- **Touch Targets**: Large, easy-to-tap buttons and controls
- **Responsive Layouts**: Flexible layouts that adapt to screen size

Take a look at the live version: https://ourapp1.netlify.app/

## 🛠 Tech Stack

### Frontend
- **React.js 18**: Modern React with hooks and context API
- **Vite**: Fast build tool and development server
- **Styled Components**: CSS-in-JS for component styling
- **Axios**: HTTP client for API communication
- **React Router DOM**: Client-side routing
- **SockJS & STOMP**: WebSocket client libraries
- **React Icons**: Icon library for UI

### Backend
- **Spring Boot 3.x**: RESTful API and WebSocket server
- **Spring Security**: JWT-based authentication and authorization
- **Spring WebSocket**: Real-time bidirectional communication
- **Spring Data MongoDB**: Database integration and repositories
- **MongoDB**: NoSQL database for flexible data storage
- **Maven**: Build and dependency management
- **Lombok**: Code generation for cleaner Java

### Infrastructure
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Docker**: Optional containerization support
- **CORS Configuration**: Secure cross-origin requests

## Installation

### Prerequisites
- Node.js and npm/yarn for the frontend.
- Java JDK and Maven for the backend.
- Docker (optional for containerized deployment).

### Setup

1. **Clone the repository**:
   ```
   git clone https://github.com/your-repo/OurApp-Social-Media-.git
   cd OurApp-Social-Media-
   ```

2. **Backend (Server)**:
   - Navigate to `Server/` directory.
   - Configure `src/main/resources/application.properties` for database and other settings.
   - Build and run:
     ```
     mvn clean install
     mvn spring-boot:run
     ```
   - Alternatively, use Docker:
     ```
     docker-compose up
     ```

3. **Frontend (Client)**:
   - Navigate to `Client/` directory.
   - Install dependencies:
     ```
     yarn install
     ```
   - Run the development server:
     ```
     yarn dev
     ```

The app should now be running on `http://localhost:5173` (frontend) and `http://localhost:8080` (backend API).

## 📖 Usage

1. **Register**: Create a new account on the registration page
2. **Set Avatar**: Upload and customize your profile picture
3. **Login**: Sign in with your credentials
4. **Private Chat**: 
   - Search for friends using the search bar
   - Click on a contact to start chatting
   - See typing indicators in real-time
5. **Group Chat**:
   - Toggle to the "Groups" tab
   - Create a new group with the "+" button
   - Add members to your group
   - Start group conversations with typing indicators

## 🐛 Recent Fixes & Improvements

### UI/UX Fixes (October 2025)
- ✅ **Fixed Layout Issues**: Resolved overlapping components in GroupList, GroupChatContainer, and Contacts
- ✅ **Flexbox Refactoring**: Migrated from grid to flexbox for better responsive behavior
- ✅ **Mobile Scrolling**: Made contact and group lists properly scrollable on mobile
- ✅ **Timestamp Display**: Fixed group chat message timestamps to parse Java LocalDateTime correctly
- ✅ **Mobile Contact View**: Fixed overlapping current user and friends list on mobile

### Backend Fixes
- ✅ **Room Creation**: Fixed MongoDB duplicate key errors when creating group rooms
- ✅ **Index Cleanup**: Removed invalid MongoDB indexes that caused save failures
- ✅ **Error Logging**: Enhanced error messages in API responses for better debugging
- ✅ **Validation**: Added null checks and ObjectId validation for @DBRef relationships

### WebSocket & Real-time Features
- ✅ **Typing Indicators**: Implemented working typing status for both private and group chats
- ✅ **Dynamic Subscriptions**: Fixed WebSocket subscriptions to update when switching rooms
- ✅ **Connection Management**: Improved stompClient prop passing and connection handling
- ✅ **Group Typing**: Separate typing channels for private (`/app/typing-status`) and group (`/app/group-typing`)

### Authentication & Routing
- ✅ **White Screen Fix**: Resolved startup issue showing white screen instead of login page
- ✅ **Auth Loading State**: Properly initialized loading state in AuthContext
- ✅ **Catch-all Route**: Added redirect to login for invalid paths
- ✅ **Session Persistence**: Improved token management and user session handling

## 🧪 Testing

### Manual Testing
1. **Private Chat**: Send messages, check typing indicators work
2. **Group Chat**: Create group, add members, test group messaging
3. **Mobile View**: Resize to <768px, verify scrolling and layout
4. **Desktop View**: Test on >768px screen, check all features
5. **WebSocket**: Verify real-time updates and typing status

### Common Issues
- **White screen on startup**: Hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Typing not showing**: Check console for WebSocket connection status
- **Layout overlap**: Clear cache and reload

## 📁 Project Structure

```
OurApp-Social-Media-/
├── Client/                  # React frontend
│   ├── src/
│   │   ├── component/       # React components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── GroupList.jsx
│   │   │   ├── GroupChatContainer.jsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.jsx
│   │   └── utils/           # Utility functions
│   └── package.json
│
└── Server/                  # Spring Boot backend
    ├── src/main/java/com/gaurav/chat_app_backend/
    │   ├── config/          # Configuration classes
    │   ├── controllers/     # REST & WebSocket controllers
    │   ├── entities/        # MongoDB entities
    │   ├── repositories/    # Data repositories
    │   ├── services/        # Business logic
    │   └── security/        # Security & JWT
    └── pom.xml
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License (or specify if different).
