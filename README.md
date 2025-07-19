# OurApp Social Media

A real-time chat application where users can register, set avatars, chat with friends, and more. This project consists of a React frontend and a Spring Boot backend with WebSocket support for real-time messaging.

## Features

- **User Authentication**: Secure login and registration with JWT.
- **Avatar Setting**: Users can set profile pictures after registration.
- **Real-time Chat**: Chat with other users in real-time using WebSockets.
- **Friend Search**: Search and add friends.
- **Logout**: Secure logout functionality.
- **Error Handling**: Validation and error messages for invalid inputs.

Take a look at the live version: https://gaurb-ourapp.netlify.app/

## Tech Stack

- **Frontend**: React.js, Vite, Axios for API calls.
- **Backend**: Spring Boot, JWT for authentication, WebSockets for real-time communication, Maven for build.
- **Database**: (Assuming from typical Spring setup, e.g., H2 or PostgreSQL - configure in application.properties).
- **Other**: Docker support for containerization.

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

## Usage

- Register a new account on the registration page.
- Set your avatar.
- Login and start chatting with other users.
- Use the search functionality to find friends.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License (or specify if different).
