import React from "react";
import styled from "styled-components";
import { FaUser, FaUsers } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatToggle() {
  const navigate = useNavigate();
  const location = useLocation();

  const isGroupChat = location.pathname === "/groups";

  return (
    <Container>
      <ToggleButton 
        active={!isGroupChat} 
        onClick={() => navigate("/")}
      >
        <FaUser />
        <span>Private</span>
      </ToggleButton>
      <ToggleButton 
        active={isGroupChat} 
        onClick={() => navigate("/groups")}
      >
        <FaUsers />
        <span>Groups</span>
      </ToggleButton>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #080420;
  border-radius: 0.5rem;
  margin: 0 0.5rem 0.5rem 0.5rem;
  flex-shrink: 0;

  @media screen and (max-width: 768px) {
    gap: 0.4rem;
    padding: 0.5rem;
    margin: 0 0.5rem 0.5rem 0.5rem;
  }
`;

const ToggleButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${props => props.active ? "#4e0eff" : "transparent"};
  color: ${props => props.active ? "white" : "#ffffffb3"};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  font-size: 0.95rem;
  font-weight: ${props => props.active ? "600" : "400"};
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;

  @media screen and (max-width: 768px) {
    padding: 0.7rem;
    font-size: 0.85rem;
    gap: 0.4rem;
    min-height: 44px;

    span {
      display: none;
    }

    svg {
      font-size: 1.2rem;
    }
  }

  svg {
    font-size: 1rem;
  }

  &:hover {
    background-color: ${props => props.active ? "#6c3cff" : "#ffffff34"};
    color: white;
  }

  &:active {
    transform: scale(0.96);
    background-color: ${props => props.active ? "#5a2ed8" : "#ffffff34"};
  }
`;

