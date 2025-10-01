import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import TypingIndicator from "./TypingIndicator";
import defaultAvatar from '../assets/generated-image.png';

export default function ChatContainer({ currentChat, messages = [], sendMessage, stompClient, user, typingUsers = [], suggestions = [] }) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const scrollToBottom = () => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle automatic scrolling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const formatTimestamp = (timestamp) => {
    try {
      let date;
      
      if (Array.isArray(timestamp)) {
        // Convert array [year, month, day, hour, minute, second, nanoseconds] to Date
        const [year, month, day, hour, minute, second] = timestamp;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      }

      // Check if we have a valid date
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false // Use 24-hour format
        });
      }
      
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid time';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              style={{ 
                height: "2.5rem",
                borderRadius: "50%",
                objectFit: "cover",
                padding: "0.2rem",
              }}
              src={!currentChat.avatarUrl || currentChat.avatarUrl.trim === "" ? defaultAvatar : currentChat.avatarUrl}   
              alt="user-avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout onClick={() => {
          stompClient.disconnect();
          console.log("stompClient", stompClient);
        }} />
      </div>
      <div className="chat-messages" ref={chatContainerRef}>
        {Array.isArray(messages) && messages.map((message, index) => {
          const isFromSelf = message.sender === user.username;
          return (
            <div 
              key={`${message.sender}-${message.timestamp}-${index}`}
              className={`message ${isFromSelf ? "sended" : "recieved"}`}
            >
              <div className="content">
                <p>{message.content}</p>
                <span className="timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Show typing indicators */}
        {typingUsers.map((typingUser) => (
          <TypingIndicator 
            key={typingUser}
            isVisible={true}
            username={typingUser}
          />
        ))}
        
        <div ref={messagesEndRef} style={{ height: "1px", width: "100%" }} />
      </div>
      <div className="chat-input-wrapper">
        <ChatInput 
          handleSendMsg={sendMessage} 
          currentChat={currentChat}
          user={user}
          stompClient={stompClient}
          lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
          suggestions={suggestions}
        />
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    flex-grow: 0;
    min-height: 80px;
    max-height: 80px;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    box-sizing: border-box;
    
    @media screen and (max-width: 768px) {
      padding: 1rem;
      min-height: 70px;
      max-height: 70px;
    }
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .avatar {
        position: relative;
        
        img {
          height: 3rem;
          width: 3rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background: #4CAF50;
          border-radius: 50%;
          border: 2px solid white;
        }
      }
      
      .username {
        h3 {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }
      }
    }
  }
  
  .chat-messages {
    flex: 1 1 0;
    min-height: 0;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgba(255, 255, 255, 0.02);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
    scroll-behavior: smooth;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    
    @media screen and (max-width: 768px) {
      padding: 1rem;
      gap: 0.8rem;
    }
    
    /* For Webkit browsers */
    &::-webkit-scrollbar {
      width: 8px;
      
      @media screen and (max-width: 768px) {
        width: 4px;
      }
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      margin: 4px 0;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.4);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      &:hover {
        background: rgba(255, 255, 255, 0.6);
      }
      
      &:active {
        background: rgba(255, 255, 255, 0.8);
      }
    }
    
    /* Mobile scroll behavior */
    @media screen and (max-width: 768px) {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    .message {
      display: flex;
      margin-bottom: 0.5rem;
      
      .content {
        max-width: 70%;
        padding: 1rem 1.2rem;
        border-radius: 18px;
        font-size: 0.95rem;
        line-height: 1.4;
        word-wrap: break-word;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        @media screen and (max-width: 768px) {
          max-width: 85%;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
        }
        
        .timestamp {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.3rem;
          display: block;
          font-weight: 400;
        }
      }
    }
    
    .sended {
      justify-content: flex-end;
      
      .content {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-bottom-right-radius: 4px;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: -8px;
          width: 0;
          height: 0;
          border: 8px solid transparent;
          border-left-color: #764ba2;
          border-bottom: none;
          border-right: none;
        }
        
        .timestamp {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
    
    .recieved {
      justify-content: flex-start;
      
      .content {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-bottom-left-radius: 4px;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -8px;
          width: 0;
          height: 0;
          border: 8px solid transparent;
          border-right-color: rgba(255, 255, 255, 0.1);
          border-bottom: none;
          border-left: none;
        }
        
        .timestamp {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
  
  .chat-input-wrapper {
    flex-shrink: 0;
    flex-grow: 0;
    position: sticky;
    bottom: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    z-index: 50;
    box-sizing: border-box;
  }
`;
