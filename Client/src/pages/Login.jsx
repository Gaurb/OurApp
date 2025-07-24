import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = UserAuth();
  const [values, setValues] = useState({ username: "", password: "" });
  const [isNavigating, setIsNavigating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (isAuthenticated && !isNavigating) {
      setIsNavigating(true);
      navigate("/");
    }
  }, [isAuthenticated, navigate, isNavigating]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      try {
        const data = await login(username, password);
        if (data.status !== 200) {
          toast.error(data.msg, toastOptions);
        }
      } catch (error) {
        toast.error("Login failed. Please try again.", toastOptions);
      }
    }
  };

  return (
    <>
      <FormContainer>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>OurApp</h1>
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              name="username"
              onChange={(e) => handleChange(e)}
              min="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="password"
                onChange={(e) => handleChange(e)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit">Log In</button>
          <span>
            Don't have an account ? <Link to="/register">Create One.</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    
    img {
      height: 4rem;
      filter: brightness(1.2) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
    
    h1 {
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 3rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    min-width: 400px;
    
    @media screen and (max-width: 480px) {
      min-width: 300px;
      padding: 2rem;
    }
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.9;
  }
  
  input {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 1rem 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
      outline: none;
      background: rgba(255, 255, 255, 0.15);
    }
  }
  
  .password-container {
    position: relative;
    width: 100%;
    
    input {
      padding-right: 5rem;
    }
  }
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:hover {
      color: white;
      transform: translateY(-50%) scale(1.1);
    }
  }
  
  button[type="submit"] {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 12px;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    margin-top: 1rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  span {
    color: white;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 1rem;
    
    a {
      color: #ffeb3b;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      
      &:hover {
        color: white;
        text-shadow: 0 0 8px rgba(255, 235, 59, 0.6);
      }
    }
  }
`;
