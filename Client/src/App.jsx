import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SetAvatar from "./component/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthContextProvider } from "./context/AuthContext";
import "./styles/MobilePolish.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setAvatar" element={<SetAvatar />} />
          <Route path="/" element={<Chat />} />
          <Route path="/groups" element={<Chat />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
}
