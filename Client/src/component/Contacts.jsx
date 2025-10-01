import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { UserAuth } from "../context/AuthContext";
import Logout from "./Logout";
import defaultAvatar from '../assets/generated-image.png';
import chatBotAvatar from '../assets/chatbot.png';
import { FaUserPlus, FaSearch } from "react-icons/fa";
import SearchFriendModal from "./SearchFriendModal";

export default function Contacts({ contacts, changeChat, onShowSearchModal }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = UserAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };


  const handleAddFriend = () => {
    if (onShowSearchModal) {
      onShowSearchModal();
    }
  };

  return (
    <>
      {user && (
        <Container className="contacts-panel">
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>OurApp</h3>
          </div>
          <div className="search-bar">
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <AddFriendButton onClick={handleAddFriend} className="mobile-add">
              <FaUserPlus />
            </AddFriendButton>
          </div>
          <div className="contacts">
            {Array.isArray(contacts) && filteredContacts.map((contact, index) => {
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
                      src={!contact.avatarUrl || contact.avatarUrl.trim() === "" ? ((contact.username === 'Perplexity') ? chatBotAvatar : defaultAvatar) : contact.avatarUrl}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <div className="no-results">
                <p>No contacts found</p>
                <AddFriendButton onClick={handleAddFriend}>
                  <FaUserPlus />
                  <span>Add New Friend</span>
                </AddFriendButton>
              </div>
            )}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={user.avatarUrl}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{`${user.username} (You)`}</h2>
            </div>
            <AddFriendButton
              onClick={(e) => {
                e.stopPropagation();
                handleAddFriend();
              }}
              className="contact-add"
            >
              <FaUserPlus />
            </AddFriendButton>
            <SearchFriendModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            <Logout />
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  overflow: hidden;
  
  @media screen and (max-width: 768px) {
    background: rgba(30, 30, 30, 0.98);
    border-right: none;
    border-radius: 0;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .search-input {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.8rem 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      
      &:focus-within {
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
      }
      
      svg {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1rem;
      }
      
      input {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        font-size: 0.95rem;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        &:focus {
          outline: none;
        }
      }
    }
    
    .mobile-add {
      padding: 0.8rem;
      border-radius: 12px;
      
      span {
        display: none;
      }
      
      @media screen and (min-width: 769px) {
        display: none;
      }
    }
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    @media screen and (max-width: 768px) {
      padding: 1rem;
      justify-content: flex-start;
    }
    
    img {
      height: 2.5rem;
      filter: brightness(1.2);
      
      @media screen and (max-width: 768px) {
        height: 2rem;
      }
    }
    
    h3 {
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      
      @media screen and (max-width: 768px) {
        font-size: 1.2rem;
      }
    }
  }
  
  .contacts {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
    gap: 0.5rem;
    flex: 1;
    
    @media screen and (max-width: 768px) {
      padding: 0.8rem;
      gap: 0.3rem;
    }
    
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
    
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      
      p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;
      }
      
      button {
        width: auto;
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
      
      @media screen and (max-width: 768px) {
        padding: 0.8rem;
        border-radius: 8px;
        gap: 0.8rem;
        min-height: 60px;
      }
      
      .contact-add {
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.3s ease;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        
        @media screen and (max-width: 768px) {
          opacity: 1;
          transform: translateX(0);
          padding: 0.4rem;
        }
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
        
        .contact-add {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .avatar {
        position: relative;
        flex-shrink: 0;
        
        img {
          height: 3rem;
          width: 3rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          
          @media screen and (max-width: 768px) {
            height: 2.5rem;
            width: 2.5rem;
          }
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
        min-width: 0; // Allow text to truncate
        
        h3 {
          color: white;
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          
          @media screen and (max-width: 768px) {
            font-size: 0.95rem;
          }
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
    padding: 1rem;
    gap: 1rem;
    // margin-bottom: 2rem;
    
    @media screen and (max-width: 768px) {
      padding: 1rem;
      gap: 0.8rem;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 0;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100vw;
      z-index: 10;
    }
    
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


const AddFriendButton = styled.button`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea,rgb(149, 102, 196));
  color: white;
  padding: 0.8rem 0.8rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1rem;
  }
  
  @media screen and (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
    border-radius: 8px;
    gap: 0.5rem;
    
    svg {
      font-size: 1rem;
    }
    
    &.mobile-add {
      padding: 0.6rem;
      min-width: 44px;
      height: 44px;
      
      span {
        display: none;
      }
    }
    
    &.contact-add {
      padding: 0.4rem;
      min-width: 36px;
      height: 36px;
      
      span {
        display: none;
      }
    }
  }
  
  @media screen and (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }
`;
