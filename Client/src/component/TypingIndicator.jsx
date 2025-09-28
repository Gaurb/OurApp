import React from 'react';
import styled, { keyframes } from 'styled-components';

const TypingIndicator = ({ isVisible, username }) => {
  if (!isVisible) return null;

  return (
    <TypingContainer>
      <TypingText>
        {username} is typing
        <DotsContainer>
          <Dot delay="0s" />
          <Dot delay="0.2s" />
          <Dot delay="0.4s" />
        </DotsContainer>
      </TypingText>
    </TypingContainer>
  );
};

export default TypingIndicator;

// Animations
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 5px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  animation: ${fadeIn} 0.3s ease-in-out;
  border-left: 3px solid #00d4ff;
`;

const TypingText = styled.span`
  color: #00d4ff;
  font-size: 0.85rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 2px;
`;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  background-color: #00d4ff;
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite;
  animation-delay: ${props => props.delay};
`;
