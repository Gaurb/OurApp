import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import SearchFriendModal from "./SearchFriendModal";

export default function Welcome() {
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setUsername(user.username);
    }
  }, [user,navigate]);

  const handleAddFriend = () => {
    setIsModalOpen(true);
  };
  
  return (
    <Container>
      <img src={Robot} alt="" />
      <h1>
        Welcome, <span>{username}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
      <AddFriendButton onClick={handleAddFriend}>
        <FaUserPlus />
        Add Friend
      </AddFriendButton>
      <SearchFriendModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  height: 100%;
  
  @media screen and (max-width: 768px) {
    gap: 1.5rem;
    padding: 1.5rem 1rem;
  }
  
  img {
    height: 15rem;
    filter: brightness(1.1) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
    animation: float 3s ease-in-out infinite;
    
    @media screen and (max-width: 768px) {
      height: 12rem;
    }
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
    
    @media screen and (max-width: 768px) {
      font-size: 1.8rem;
      padding: 0 1rem;
    }
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 400;
    text-align: center;
    margin: 0;
    opacity: 0.8;
    
    @media screen and (max-width: 768px) {
      font-size: 1rem;
      padding: 0 1rem;
    }
  }
  
  span {
    background: linear-gradient(135deg, #ffeb3b, #ffc107);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const AddFriendButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.2rem;
  }
  
  @media screen and (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 1rem;
    }
  }
`;
