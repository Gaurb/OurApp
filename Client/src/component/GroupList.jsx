import React, { useState } from "react";
import styled from "styled-components";
import { FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import Logo from "../assets/logo.svg";
import ChatToggle from "./ChatToggle";
import defaultGroupAvatar from '../assets/generated-image.png';

export default function GroupList({ 
  rooms = [], 
  onSelectRoom, 
  onCreateRoom, 
  currentSelectedRoom 
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter(room =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoomClick = (room) => {
    onSelectRoom(room);
  };

  return (
    <Container className="group-list-panel">
      <div className="brand">
        <img src={Logo} alt="logo" />
        <h3>Groups</h3>
      </div>
      <ChatToggle />

      <div className="search-bar">
        <div className="search-input">
          <FaSearch />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <CreateGroupButton onClick={onCreateRoom} title="Create New Group">
          <span className="button-text">Group:</span>
          <FaPlus />
        </CreateGroupButton>
      </div>

      <div className="groups">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <div
              key={room.id || index}
              className={`group ${currentSelectedRoom?.id === room.id ? "selected" : ""}`}
              onClick={() => handleRoomClick(room)}
            >
              <div className="avatar">
                <img
                  src={room.groupPhotoUrl || defaultGroupAvatar}
                  alt={room.roomName}
                />
              </div>
              <div className="group-info">
                <h3>{room.roomName}</h3>
                <p className="members-count">
                  <FaUsers /> {room.members?.length || 0} members
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-groups">
            <FaUsers className="empty-icon" />
            <p>No groups found</p>
            <CreateGroupButton onClick={onCreateRoom} className="create-first">
              <FaPlus />
              <span>Create Your First Group</span>
            </CreateGroupButton>
          </div>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #080420;

  @media screen and (max-width: 768px) {
    height: 100%;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 1rem 0;
    flex-shrink: 0;
    
    @media screen and (max-width: 768px) {
      padding: 0.7rem 0;
      gap: 0.5rem;
    }
    
    img {
      height: 2rem;
      
      @media screen and (max-width: 768px) {
        height: 1.5rem;
      }
    }
    
    h3 {
      color: white;
      text-transform: uppercase;
      font-size: 1.1rem;
      margin: 0;
      
      @media screen and (max-width: 768px) {
        font-size: 0.9rem;
      }
    }
  }

  .search-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 1rem 1rem 1rem;
    align-items: center;
    flex-shrink: 0;

    @media screen and (max-width: 768px) {
      padding: 0.5rem;
      gap: 0.4rem;
    }

    .search-input {
      flex: 1;
      display: flex;
      align-items: center;
      background-color: #ffffff34;
      border-radius: 0.5rem;
      padding: 0.6rem 0.8rem;
      gap: 0.5rem;
      min-height: 40px;
      
      @media screen and (max-width: 768px) {
        padding: 0.5rem 0.7rem;
        min-height: 36px;
      }
      
      svg {
        color: #ffffffb3;
        font-size: 0.9rem;
        flex-shrink: 0;
        
        @media screen and (max-width: 768px) {
          font-size: 0.8rem;
        }
      }

      input {
        background-color: transparent;
        border: none;
        outline: none;
        color: white;
        width: 100%;
        font-size: 0.9rem;

        @media screen and (max-width: 768px) {
          font-size: 0.85rem;
        }

        &::placeholder {
          color: #ffffffb3;
        }
      }
    }
  }

  .groups {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 0.5rem;
    padding: 0.5rem 0;
    flex: 1;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .group {
      background-color: #ffffff34;
      min-height: 4rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.5rem;
      padding: 0.7rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.3s ease-in-out;

      &:hover {
        background-color: #4e0eff;
      }

      .avatar {
        img {
          height: 3rem;
          width: 3rem;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #4e0eff;
        }
      }

      .group-info {
        flex: 1;
        overflow: hidden;

        h3 {
          color: white;
          margin: 0;
          font-size: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .members-count {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #ffffffb3;
          font-size: 0.8rem;
          margin: 0.2rem 0 0 0;

          svg {
            font-size: 0.7rem;
          }
        }
      }
    }

    .selected {
      background-color: #9a86f3;
    }

    .no-groups {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      color: #ffffffb3;

      .empty-icon {
        font-size: 3rem;
        opacity: 0.3;
      }

      p {
        margin: 0;
        font-size: 1rem;
      }

      .create-first {
        margin-top: 1rem;
      }
    }

    @media screen and (max-width: 768px) {
      gap: 0.3rem;
      padding: 0.3rem 0;

      .group {
        min-height: 3.5rem;
        padding: 0.5rem;
        gap: 0.7rem;
        width: 95%;

        .avatar img {
          height: 2.5rem;
          width: 2.5rem;
        }

        .group-info {
          h3 {
            font-size: 0.9rem;
          }

          .members-count {
            font-size: 0.75rem;
          }
        }
      }

      .no-groups {
        padding: 1rem;

        .empty-icon {
          font-size: 2rem;
        }

        p {
          font-size: 0.9rem;
        }
      }
    }
  }
`;

const CreateGroupButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  background-color: #4e0eff;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: 0.3s ease-in-out;
  white-space: nowrap;
  flex-shrink: 0;
  min-height: 40px;

  svg {
    font-size: 1rem;
  }

  .button-text {
    font-size: 0.9rem;
  }

  span:not(.button-text) {
    font-size: 0.9rem;
  }

  &:hover {
    background-color: #6c3cff;
  }

  &.create-first {
    padding: 0.8rem 1.5rem;
    gap: 0.5rem;
    
    svg {
      font-size: 1.2rem;
    }

    span {
      font-size: 1rem;
    }
  }

  @media screen and (max-width: 768px) {
    padding: 0.5rem 0.7rem;
    min-height: 36px;
    gap: 0.2rem;
    
    .button-text {
      display: none;
    }

    svg {
      font-size: 0.9rem;
    }

    &.create-first {
      padding: 0.7rem 1.2rem;
      gap: 0.5rem;
      
      svg {
        font-size: 1rem;
      }
      
      .button-text {
        display: inline;
      }
      
      span {
        display: inline;
        font-size: 0.9rem;
      }
    }
  }
`;

