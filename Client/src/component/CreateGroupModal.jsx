import React, { useState } from "react";
import styled from "styled-components";
import { FaTimes, FaUserPlus, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { createRoomRoute } from "../utils/APIRoutes";
import defaultAvatar from '../assets/generated-image.png';

export default function CreateGroupModal({ isOpen, onClose, friends = [], onGroupCreated, accessToken }) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (username) => {
    setSelectedMembers(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const handleCreateGroup = async () => {
    console.log("Creating group with name:", groupName);
    console.log("Members:", selectedMembers);
    console.log("Access token:", accessToken ? "Present" : "Missing");
    
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (groupName.length < 3 || groupName.length > 50) {
      toast.error("Group name must be between 3 and 50 characters");
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending request to:", createRoomRoute);
      const response = await axios.post(
        createRoomRoute,
        {
          roomName: groupName.trim(),
          memberUsernames: selectedMembers
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log("Group created successfully:", response.data);
      toast.success(`Group "${groupName}" created successfully!`);
      setGroupName("");
      setSelectedMembers([]);
      setSearchQuery("");
      onGroupCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message
        || "Failed to create group";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div className="header-title">
            <FaUsers />
            <h2>Create New Group</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>

        <ModalBody>
          <InputGroup>
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={50}
            />
            <span className="char-count">{groupName.length}/50</span>
          </InputGroup>

          <InputGroup>
            <label>Add Members (Optional)</label>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <MembersList>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <MemberItem key={friend.username}>
                  <div className="member-info">
                    <img
                      src={friend.avatarUrl || defaultAvatar}
                      alt={friend.username}
                    />
                    <span>{friend.username}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(friend.username)}
                    onChange={() => toggleMember(friend.username)}
                  />
                </MemberItem>
              ))
            ) : (
              <EmptyState>
                <FaUserPlus />
                <p>No friends found. Add friends to create groups with them!</p>
              </EmptyState>
            )}
          </MembersList>

          {selectedMembers.length > 0 && (
            <SelectedMembers>
              <span className="selected-label">
                Selected ({selectedMembers.length}):
              </span>
              <div className="selected-list">
                {selectedMembers.map((username) => (
                  <SelectedTag key={username}>
                    {username}
                    <button onClick={() => toggleMember(username)}>×</button>
                  </SelectedTag>
                ))}
              </div>
            </SelectedMembers>
          )}
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <CreateButton onClick={handleCreateGroup} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Group"}
          </CreateButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;

  @media screen and (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const ModalContent = styled.div`
  background-color: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

  @media screen and (max-width: 768px) {
    max-width: 96%;
    max-height: 92vh;
    border-radius: 0.8rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ffffff34;

  @media screen and (max-width: 768px) {
    padding: 1rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: white;

    svg {
      font-size: 1.5rem;
      color: #4e0eff;
    }

    h2 {
      margin: 0;
      font-size: 1.3rem;

      @media screen and (max-width: 768px) {
        font-size: 1.1rem;
      }
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: 0.3s ease-in-out;

    &:hover {
      background-color: #ffffff34;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;

  @media screen and (max-width: 768px) {
    padding: 1rem;
  }

  &::-webkit-scrollbar {
    width: 0.3rem;
    &-thumb {
      background-color: #ffffff39;
      border-radius: 1rem;
    }
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;

  label {
    display: block;
    color: white;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;

    @media screen and (max-width: 768px) {
      font-size: 0.85rem;
    }
  }

  input {
    width: 100%;
    padding: 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid #ffffff34;
    background-color: #0f0f1e;
    color: white;
    font-size: 1rem;
    outline: none;
    transition: 0.3s ease-in-out;

    @media screen and (max-width: 768px) {
      padding: 0.7rem;
      font-size: 0.9rem;
    }

    &:focus {
      border-color: #4e0eff;
    }

    &::placeholder {
      color: #ffffffb3;
    }
  }

  .char-count {
    position: absolute;
    right: 0.8rem;
    top: 2.5rem;
    font-size: 0.75rem;
    color: #ffffffb3;
  }
`;

const MembersList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ffffff34;
  border-radius: 0.5rem;
  padding: 0.5rem;

  @media screen and (max-width: 768px) {
    max-height: 200px;
  }

  &::-webkit-scrollbar {
    width: 0.3rem;
    &-thumb {
      background-color: #ffffff39;
      border-radius: 1rem;
    }
  }
`;

const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem;
  border-radius: 0.5rem;
  transition: 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: #ffffff14;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;

      @media screen and (max-width: 768px) {
        width: 2rem;
        height: 2rem;
      }
    }

    span {
      color: white;
      font-size: 0.95rem;

      @media screen and (max-width: 768px) {
        font-size: 0.9rem;
      }
    }
  }

  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #ffffffb3;
  text-align: center;

  svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.9rem;

    @media screen and (max-width: 768px) {
      font-size: 0.85rem;
    }
  }
`;

const SelectedMembers = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #0f0f1e;
  border-radius: 0.5rem;

  .selected-label {
    color: #4e0eff;
    font-size: 0.85rem;
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }

  .selected-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const SelectedTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4e0eff;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;

  @media screen and (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.7rem;
  }

  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: 0.2s ease-in-out;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #ffffff34;

  @media screen and (max-width: 768px) {
    padding: 1rem;
    gap: 0.8rem;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #ffffff34;
  background: transparent;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s ease-in-out;

  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.7rem;
  }

  &:hover {
    background-color: #ffffff14;
  }
`;

const CreateButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #4e0eff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease-in-out;

  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.7rem;
  }

  &:hover:not(:disabled) {
    background-color: #6c3cff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

