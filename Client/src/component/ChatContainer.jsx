import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import defaultAvatar from '../assets/generated-image.png';

export default function ChatContainer({ currentChat, messages = [], sendMessage, stompClient, user }) {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    if (Array.isArray(timestamp)) {
      // Convert array [year, month, day, hour, minute, second, nanoseconds] to Date
      const [year, month, day, hour, minute, second] = timestamp;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleTimeString();
    } else if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString();
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString();
    }
    return 'Invalid Date';
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
      <div className="chat-messages">
        {Array.isArray(messages) && messages.map((message, index) => {
          const isFromSelf = message.sender === user.username;
          return (
            <div 
              ref={index === messages.length - 1 ? scrollRef : null} 
              key={`${message.sender}-${message.timestamp}-${index}`}
            >
              <div
                className={`message ${
                  isFromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>{message.content}</p>
                  <span className="timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={sendMessage} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
        .timestamp {
          font-size: 0.7rem;
          color: #ffffff80;
          margin-top: 0.5rem;
          display: block;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
