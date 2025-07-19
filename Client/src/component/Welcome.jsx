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
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;

const AddFriendButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4e0eff;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #3a0cc9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.2rem;
  }
`;
