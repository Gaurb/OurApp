import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { FaArrowLeft, FaCog, FaUsers } from "react-icons/fa";
import { UserAuth } from "../context/AuthContext";
import defaultGroupAvatar from '../assets/generated-image.png';
import defaultUserAvatar from '../assets/generated-image.png';

export default function GroupChatContainer({ 
  currentRoom, 
  messages = [], 
  onSendMessage, 
  onBack,
  onOpenSettings,
  typingUsers = []
}) {
  const scrollRef = useRef();
  const { user } = UserAuth();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(() => {
    if (arrivalMessage) {
      // Handle arrival message if needed
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    onSendMessage(msg);
  };

  const isCurrentUser = (sender) => {
    return sender === user?.username;
  };

  const getMessageTime = (timestamp) => {
    if (!timestamp) {
      console.warn('No timestamp provided for message');
      return '';
    }
    
    try {
      let date;
      
      // Handle LocalDateTime array format from Java [year, month, day, hour, minute, second, nanoseconds]
      if (Array.isArray(timestamp)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanoseconds = 0] = timestamp;
        // Convert nanoseconds to milliseconds and add to the date
        const milliseconds = Math.floor(nanoseconds / 1000000);
        date = new Date(year, month - 1, day, hour, minute, second, milliseconds);
      } else {
        // Handle ISO string format
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return '';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const getMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      let date;
      
      // Handle LocalDateTime array format from Java [year, month, day, hour, minute, second, nanoseconds]
      if (Array.isArray(timestamp)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanoseconds = 0] = timestamp;
        // Convert nanoseconds to milliseconds and add to the date
        const milliseconds = Math.floor(nanoseconds / 1000000);
        date = new Date(year, month - 1, day, hour, minute, second, milliseconds);
      } else {
        // Handle ISO string format
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp for date:', timestamp);
        return '';
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const renderDateDivider = (currentMsg, previousMsg) => {
    if (!currentMsg?.timestamp) return null;
    
    if (!previousMsg) {
      const dateStr = getMessageDate(currentMsg.timestamp);
      return dateStr ? <DateDivider>{dateStr}</DateDivider> : null;
    }
    
    if (!previousMsg?.timestamp) {
      const dateStr = getMessageDate(currentMsg.timestamp);
      return dateStr ? <DateDivider>{dateStr}</DateDivider> : null;
    }
    
    // Convert timestamps to Date objects for comparison
    const getCurrentDate = (ts) => {
      if (Array.isArray(ts)) {
        const [year, month, day] = ts;
        return new Date(year, month - 1, day);
      }
      return new Date(ts);
    };
    
    const currentDate = getCurrentDate(currentMsg.timestamp).toDateString();
    const previousDate = getCurrentDate(previousMsg.timestamp).toDateString();
    
    if (currentDate !== previousDate) {
      const dateStr = getMessageDate(currentMsg.timestamp);
      return dateStr ? <DateDivider>{dateStr}</DateDivider> : null;
    }
    return null;
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <FaArrowLeft />
          </button>
          <div className="room-info">
            <div className="avatar">
              <img
                src={currentRoom.groupPhotoUrl || defaultGroupAvatar}
                alt={currentRoom.roomName}
              />
            </div>
            <div>
              <h3>{currentRoom.roomName}</h3>
              <p className="members">
                <FaUsers /> {currentRoom.members?.length || 0} members
              </p>
            </div>
          </div>
        </div>
        <button className="settings-button" onClick={onOpenSettings}>
          <FaCog />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <FaUsers className="empty-icon" />
            <p>No messages yet</p>
            <span>Start the conversation!</span>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <React.Fragment key={message.id || index}>
                {renderDateDivider(message, messages[index - 1])}
                <div ref={scrollRef}>
                  <div className={`message ${isCurrentUser(message.sender) ? "sent" : "received"}`}>
                    {!isCurrentUser(message.sender) && (
                      <div className="message-avatar">
                        <img
                          src={
                            currentRoom.members?.find(m => m.username === message.sender)?.avatarUrl 
                            || defaultUserAvatar
                          }
                          alt={message.sender}
                        />
                      </div>
                    )}
                    <div className="message-content">
                      {!isCurrentUser(message.sender) && (
                        <div className="sender-name">{message.sender}</div>
                      )}
                      <div className="content">
                        <p>{message.content}</p>
                        {message.timestamp && (
                          <span className="time">{getMessageTime(message.timestamp)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
            
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-avatar">
                  <img src={defaultUserAvatar} alt="typing" />
                </div>
                <div className="typing-content">
                  <span className="typing-text">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.length} people are typing...`
                    }
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #131324;

  @media screen and (max-width: 768px) {
    height: 100%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #080420;
    flex-shrink: 0;
    min-height: 70px;

    @media screen and (max-width: 768px) {
      padding: 0.8rem 1rem;
      min-height: 60px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      @media screen and (max-width: 768px) {
        gap: 0.5rem;
      }

      .back-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: 0.3s ease-in-out;

        &:hover {
          background-color: #ffffff34;
        }

        @media screen and (min-width: 769px) {
          display: none;
        }
      }

      .room-info {
        display: flex;
        align-items: center;
        gap: 1rem;

        @media screen and (max-width: 768px) {
          gap: 0.7rem;
        }

        .avatar {
          img {
            height: 3rem;
            width: 3rem;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid #4e0eff;

            @media screen and (max-width: 768px) {
              height: 2.5rem;
              width: 2.5rem;
            }
          }
        }

        div {
          h3 {
            color: white;
            margin: 0;
            font-size: 1.1rem;

            @media screen and (max-width: 768px) {
              font-size: 1rem;
            }
          }

          .members {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            color: #ffffffb3;
            font-size: 0.8rem;
            margin: 0.2rem 0 0 0;

            @media screen and (max-width: 768px) {
              font-size: 0.75rem;
            }

            svg {
              font-size: 0.7rem;
            }
          }
        }
      }
    }

    .settings-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: white;
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0.6rem;
      border-radius: 0.5rem;
      transition: 0.3s ease-in-out;

      &:hover {
        background-color: #ffffff34;
        color: #4e0eff;
      }

      @media screen and (max-width: 768px) {
        font-size: 1.1rem;
        padding: 0.5rem;
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    min-height: 0;

    @media screen and (max-width: 768px) {
      padding: 1rem;
      gap: 0.8rem;
    }

    &::-webkit-scrollbar {
      width: 0.3rem;
      &-thumb {
        background-color: #ffffff39;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;

      @media screen and (max-width: 768px) {
        gap: 0.4rem;
      }

      .message-avatar {
        img {
          height: 2rem;
          width: 2rem;
          border-radius: 50%;
          object-fit: cover;

          @media screen and (max-width: 768px) {
            height: 1.8rem;
            width: 1.8rem;
          }
        }
      }

      .message-content {
        max-width: 70%;

        @media screen and (max-width: 768px) {
          max-width: 75%;
        }

        .sender-name {
          color: #4e0eff;
          font-size: 0.75rem;
          font-weight: bold;
          margin-bottom: 0.2rem;
          padding-left: 0.5rem;

          @media screen and (max-width: 768px) {
            font-size: 0.7rem;
          }
        }

        .content {
          background-color: #ffffff34;
          border-radius: 1rem;
          padding: 0.8rem 1rem;
          position: relative;
          word-wrap: break-word;

          @media screen and (max-width: 768px) {
            padding: 0.6rem 0.8rem;
          }

          p {
            color: #ffffff;
            margin: 0;
            padding-right: 3rem;
            font-size: 0.95rem;

            @media screen and (max-width: 768px) {
              font-size: 0.9rem;
              padding-right: 2.5rem;
            }
          }

          .time {
            position: absolute;
            bottom: 0.5rem;
            right: 0.7rem;
            font-size: 0.65rem;
            color: #ffffffb3;

            @media screen and (max-width: 768px) {
              font-size: 0.6rem;
              bottom: 0.4rem;
              right: 0.5rem;
            }
          }
        }
      }

      &.sent {
        flex-direction: row-reverse;

        .message-content {
          .content {
            background-color: #4e0eff;
            border-bottom-right-radius: 0.3rem;

            p {
              color: white;
            }
          }
        }
      }

      &.received {
        .message-content .content {
          border-bottom-left-radius: 0.3rem;
        }
      }
    }

    .typing-indicator {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      opacity: 0.7;

      .typing-avatar {
        img {
          height: 2rem;
          width: 2rem;
          border-radius: 50%;
        }
      }

      .typing-content {
        background-color: #ffffff34;
        border-radius: 1rem;
        padding: 0.8rem 1rem;
        border-bottom-left-radius: 0.3rem;

        .typing-text {
          color: #ffffffb3;
          font-size: 0.85rem;
          font-style: italic;
        }
      }
    }

    .empty-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
      color: #ffffffb3;

      .empty-icon {
        font-size: 4rem;
        opacity: 0.3;
        color: #4e0eff;

        @media screen and (max-width: 768px) {
          font-size: 3rem;
        }
      }

      p {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 500;
        color: white;

        @media screen and (max-width: 768px) {
          font-size: 1rem;
        }
      }

      span {
        font-size: 0.9rem;
        opacity: 0.7;

        @media screen and (max-width: 768px) {
          font-size: 0.85rem;
        }
      }
    }
  }
`;

const DateDivider = styled.div`
  text-align: center;
  color: #ffffffb3;
  font-size: 0.75rem;
  margin: 1rem 0;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: #ffffff34;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
    margin: 0.7rem 0;
  }
`;

