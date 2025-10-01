import styled from 'styled-components';
import { FaMagic, FaTimes, FaRobot } from 'react-icons/fa';

const MagicReplies = ({ onSelectReply, lastMessage, isVisible, onClose, suggestions = [] }) => {
  // Fallback replies if no suggestions from backend
  const fallbackReplies = [
    "👍 Sounds good!",
    "😊 Thanks!",
    "🤔 Let me think about it",
    "👌 Perfect!",
    "😄 Haha, that's funny!",
    "🙏 Thank you so much!"
  ];

  // Use backend suggestions or fallback
  const displaySuggestions = suggestions.length > 0 ? suggestions : fallbackReplies;


  if (!isVisible) return null;

  const handleReplyClick = (reply) => {
    onSelectReply(reply);
    onClose();
  };

  return (
    <Container>
      <Header>
        <div className="title">
          <FaMagic />
          <span>Magic Replies</span>
        </div>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </Header>
      
      <RepliesGrid>
        {displaySuggestions.map((reply, index) => (
          <ReplyButton
            key={index}
            onClick={() => handleReplyClick(reply)}
          >
            {reply}
          </ReplyButton>
        ))}
      </RepliesGrid>
      
      <Footer>
        <FaRobot />
        <span>AI-powered quick responses</span>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  max-height: 300px;
  overflow-y: auto;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media screen and (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    max-height: 50vh;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;

    svg {
      color: #667eea;
      font-size: 1.1rem;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RepliesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
  padding: 1.5rem;

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    padding: 1rem;
  }
`;

const ReplyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  word-wrap: break-word;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media screen and (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    min-height: 40px;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;

  svg {
    color: #667eea;
  }
`;

export default MagicReplies;
