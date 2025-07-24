import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { UserAuth } from "../context/AuthContext";
import Logout from "./Logout";
import defaultAvatar from '../assets/generated-image.png';
import chatBotAvatar from '../assets/chatbot.png';

export default function Contacts({ contacts, changeChat }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const { user } = UserAuth();

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {user && (
        <Container className="contacts-panel">
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>OurApp</h3>
          </div>
          <div className="contacts">
            {Array.isArray(contacts) && contacts.map((contact, index) => {
              return (
                <div
                  key={`${contact._id}-${index}`}
                  className={`contact ${index === currentSelected ? "selected" : ""
                    }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      style={{
                        height: "3rem",
                        borderRadius: "50%",
                        padding: "0.2rem",
                      }}
                      src={!contact.avatarUrl || contact.avatarUrl.trim() === "" ? (( contact.username==='Perplexity') ? chatBotAvatar : defaultAvatar ): contact.avatarUrl}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={user.avatarUrl}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{user.username}</h2>
            </div>
            <Logout />
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    img {
      height: 2.5rem;
      filter: brightness(1.2);
    }
    
    h3 {
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
  
  .contacts {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
    gap: 0.5rem;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
    
    .contact {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      position: relative;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      .avatar {
        position: relative;
        
        img {
          height: 3rem;
          width: 3rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #4CAF50;
          border-radius: 50%;
          border: 2px solid white;
        }
      }
      
      .username {
        flex: 1;
        
        h3 {
          color: white;
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
        }
      }
    }
    
    .selected {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: rgba(255, 255, 255, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
    }
  }

  .current-user {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    padding: 1.5rem;
    gap: 1rem;
    
    .avatar {
      img {
        height: 3.5rem;
        width: 3.5rem;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
    }
    
    .username {
      flex: 1;
      
      h2 {
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }
    }
    
    @media screen and (max-width: 1080px) {
      padding: 1rem;
      gap: 0.8rem;
      
      .username h2 {
        font-size: 1rem;
      }
      
      .avatar img {
        height: 3rem;
        width: 3rem;
      }
    }
  }
`;
