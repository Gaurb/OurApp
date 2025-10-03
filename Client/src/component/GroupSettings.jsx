import React, { useState } from "react";
import styled from "styled-components";
import { FaTimes, FaUserPlus, FaTrash, FaEdit, FaImage, FaSignOutAlt, FaCrown, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import {
  updateRoomNameRoute,
  updateGroupPhotoRoute,
  addMembersRoute,
  removeMemberRoute,
  leaveRoomRoute,
  deleteRoomRoute
} from "../utils/APIRoutes";
import { UserAuth } from "../context/AuthContext";
import defaultAvatar from '../assets/generated-image.png';

export default function GroupSettings({ 
  isOpen, 
  onClose, 
  currentRoom, 
  friends = [],
  accessToken,
  onRoomUpdated 
}) {
  const { user } = UserAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState(currentRoom?.roomName || "");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !currentRoom) return null;

  const isAdmin = currentRoom.members?.find(
    m => m.username === user?.username && m.role === "GROUP_ADMIN"
  );

  const nonMembers = friends.filter(
    friend => !currentRoom.members?.some(m => m.username === friend.username)
  );

  const handleUpdateName = async () => {
    if (!isAdmin) {
      toast.error("Only admins can rename the group");
      return;
    }

    if (!newRoomName.trim() || newRoomName === currentRoom.roomName) {
      setIsEditingName(false);
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        updateRoomNameRoute,
        {
          currentRoomName: currentRoom.roomName,
          newRoomName: newRoomName.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      toast.success("Group name updated successfully!");
      setIsEditingName(false);
      onRoomUpdated();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update group name");
      setNewRoomName(currentRoom.roomName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!isAdmin) {
      toast.error("Only admins can update group photo");
      return;
    }

    if (!newPhotoUrl.trim()) {
      toast.error("Please enter a photo URL");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        updateGroupPhotoRoute,
        {
          roomName: currentRoom.roomName,
          photoUrl: newPhotoUrl.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      toast.success("Group photo updated successfully!");
      setNewPhotoUrl("");
      onRoomUpdated();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update group photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        addMembersRoute,
        {
          roomName: currentRoom.roomName,
          usernames: selectedMembers
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      toast.success("Members added successfully!");
      setSelectedMembers([]);
      setShowAddMembers(false);
      onRoomUpdated();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (username) => {
    if (!isAdmin) {
      toast.error("Only admins can remove members");
      return;
    }

    if (window.confirm(`Remove ${username} from the group?`)) {
      setIsLoading(true);
      try {
        await axios.delete(removeMemberRoute, {
          data: {
            roomName: currentRoom.roomName,
            username: username
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        toast.success(`${username} removed from group`);
        onRoomUpdated();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to remove member");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm(`Are you sure you want to leave "${currentRoom.roomName}"?`)) {
      setIsLoading(true);
      try {
        await axios.delete(leaveRoomRoute(currentRoom.roomName), {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        toast.success("You left the group");
        onClose();
        onRoomUpdated();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to leave group");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) {
      toast.error("Only admins can delete the group");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${currentRoom.roomName}"? This cannot be undone!`)) {
      setIsLoading(true);
      try {
        await axios.delete(deleteRoomRoute(currentRoom.roomName), {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        toast.success("Group deleted successfully");
        onClose();
        onRoomUpdated();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete group");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Group Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </ModalHeader>

        <ModalBody>
          {/* Group Photo */}
          <Section>
            <SectionTitle>Group Photo</SectionTitle>
            <PhotoSection>
              <img
                src={currentRoom.groupPhotoUrl || defaultAvatar}
                alt={currentRoom.roomName}
              />
              {isAdmin && (
                <div className="photo-input">
                  <input
                    type="text"
                    placeholder="Enter photo URL..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                  <button onClick={handleUpdatePhoto} disabled={isLoading}>
                    <FaImage /> Update
                  </button>
                </div>
              )}
            </PhotoSection>
          </Section>

          {/* Group Name */}
          <Section>
            <SectionTitle>Group Name</SectionTitle>
            <NameSection>
              {isEditingName ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    maxLength={50}
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button onClick={handleUpdateName} disabled={isLoading}>
                      Save
                    </button>
                    <button onClick={() => {
                      setIsEditingName(false);
                      setNewRoomName(currentRoom.roomName);
                    }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="name-display">
                  <span>{currentRoom.roomName}</span>
                  {isAdmin && (
                    <button onClick={() => setIsEditingName(true)}>
                      <FaEdit /> Edit
                    </button>
                  )}
                </div>
              )}
            </NameSection>
          </Section>

          {/* Members */}
          <Section>
            <SectionTitle>
              Members ({currentRoom.members?.length || 0})
              <button className="add-btn" onClick={() => setShowAddMembers(!showAddMembers)}>
                <FaUserPlus /> Add
              </button>
            </SectionTitle>

            {showAddMembers && nonMembers.length > 0 && (
              <AddMembersSection>
                <MembersList>
                  {nonMembers.map((friend) => (
                    <MemberItem key={friend.username}>
                      <div className="member-info">
                        <img src={friend.avatarUrl || defaultAvatar} alt={friend.username} />
                        <span>{friend.username}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend.username)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, friend.username]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(u => u !== friend.username));
                          }
                        }}
                      />
                    </MemberItem>
                  ))}
                </MembersList>
                <button 
                  className="add-selected" 
                  onClick={handleAddMembers}
                  disabled={selectedMembers.length === 0 || isLoading}
                >
                  Add Selected ({selectedMembers.length})
                </button>
              </AddMembersSection>
            )}

            <MembersList>
              {currentRoom.members?.map((member) => (
                <MemberItem key={member.username}>
                  <div className="member-info">
                    <img src={member.avatarUrl || defaultAvatar} alt={member.username} />
                    <div>
                      <span>{member.username}</span>
                      {member.role === "GROUP_ADMIN" ? (
                        <span className="role admin"><FaCrown /> Admin</span>
                      ) : (
                        <span className="role member"><FaUser /> Member</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && member.username !== user?.username && (
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveMember(member.username)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </MemberItem>
              ))}
            </MembersList>
          </Section>

          {/* Actions */}
          <Section>
            <DangerZone>
              <button className="leave-btn" onClick={handleLeaveGroup} disabled={isLoading}>
                <FaSignOutAlt /> Leave Group
              </button>
              {isAdmin && (
                <button className="delete-btn" onClick={handleDeleteGroup} disabled={isLoading}>
                  <FaTrash /> Delete Group
                </button>
              )}
            </DangerZone>
          </Section>
        </ModalBody>
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
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 768px) {
    max-width: 95%;
    max-height: 95vh;
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

  h2 {
    color: white;
    margin: 0;
    font-size: 1.3rem;

    @media screen and (max-width: 768px) {
      font-size: 1.1rem;
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

const Section = styled.div`
  margin-bottom: 2rem;

  @media screen and (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionTitle = styled.div`
  color: #4e0eff;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;

  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background-color: #4e0eff;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    transition: 0.3s ease-in-out;

    @media screen and (max-width: 768px) {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    &:hover {
      background-color: #6c3cff;
    }
  }
`;

const PhotoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4e0eff;

    @media screen and (max-width: 768px) {
      width: 60px;
      height: 60px;
    }
  }

  .photo-input {
    flex: 1;
    display: flex;
    gap: 0.5rem;

    @media screen and (max-width: 768px) {
      width: 100%;
    }

    input {
      flex: 1;
      padding: 0.7rem;
      border-radius: 0.5rem;
      border: 1px solid #ffffff34;
      background-color: #0f0f1e;
      color: white;
      outline: none;

      @media screen and (max-width: 768px) {
        padding: 0.6rem;
        font-size: 0.85rem;
      }

      &:focus {
        border-color: #4e0eff;
      }
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1rem;
      border-radius: 0.5rem;
      border: none;
      background-color: #4e0eff;
      color: white;
      cursor: pointer;
      transition: 0.3s ease-in-out;

      @media screen and (max-width: 768px) {
        padding: 0.6rem 0.8rem;
        font-size: 0.85rem;
      }

      &:hover:not(:disabled) {
        background-color: #6c3cff;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
`;

const NameSection = styled.div`
  .name-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem;
    background-color: #0f0f1e;
    border-radius: 0.5rem;

    span {
      color: white;
      font-size: 1rem;

      @media screen and (max-width: 768px) {
        font-size: 0.9rem;
      }
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: 1px solid #ffffff34;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: 0.3s ease-in-out;

      @media screen and (max-width: 768px) {
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
      }

      &:hover {
        background-color: #ffffff14;
      }
    }
  }

  .edit-name {
    input {
      width: 100%;
      padding: 0.8rem;
      margin-bottom: 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid #4e0eff;
      background-color: #0f0f1e;
      color: white;
      outline: none;

      @media screen and (max-width: 768px) {
        padding: 0.6rem;
        font-size: 0.9rem;
      }
    }

    .edit-buttons {
      display: flex;
      gap: 0.5rem;

      button {
        flex: 1;
        padding: 0.6rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        transition: 0.3s ease-in-out;

        @media screen and (max-width: 768px) {
          padding: 0.5rem;
          font-size: 0.85rem;
        }

        &:first-child {
          background-color: #4e0eff;
          color: white;

          &:hover:not(:disabled) {
            background-color: #6c3cff;
          }
        }

        &:last-child {
          background-color: transparent;
          border: 1px solid #ffffff34;
          color: white;

          &:hover {
            background-color: #ffffff14;
          }
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 250px;
  overflow-y: auto;

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
  padding: 0.8rem;
  background-color: #0f0f1e;
  border-radius: 0.5rem;

  @media screen and (max-width: 768px) {
    padding: 0.6rem;
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

    div {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      span {
        color: white;
        font-size: 0.95rem;

        @media screen and (max-width: 768px) {
          font-size: 0.85rem;
        }
      }

      .role {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.75rem;

        @media screen and (max-width: 768px) {
          font-size: 0.7rem;
        }

        &.admin {
          color: #ffd700;
        }

        &.member {
          color: #ffffffb3;
        }
      }
    }
  }

  .remove-btn {
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.3s ease-in-out;

    @media screen and (max-width: 768px) {
      padding: 0.4rem;
    }

    &:hover {
      background-color: #ff4444;
      color: white;
    }
  }

  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
`;

const AddMembersSection = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #0f0f1e;
  border-radius: 0.5rem;

  @media screen and (max-width: 768px) {
    padding: 0.8rem;
  }

  .add-selected {
    width: 100%;
    margin-top: 0.8rem;
    padding: 0.8rem;
    border-radius: 0.5rem;
    border: none;
    background-color: #4e0eff;
    color: white;
    cursor: pointer;
    transition: 0.3s ease-in-out;

    @media screen and (max-width: 768px) {
      padding: 0.6rem;
      font-size: 0.9rem;
    }

    &:hover:not(:disabled) {
      background-color: #6c3cff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const DangerZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: 0.3s ease-in-out;

    @media screen and (max-width: 768px) {
      padding: 0.7rem;
      font-size: 0.9rem;
    }

    &.leave-btn {
      background-color: transparent;
      border: 1px solid #ff9800;
      color: #ff9800;

      &:hover:not(:disabled) {
        background-color: #ff9800;
        color: white;
      }
    }

    &.delete-btn {
      background-color: transparent;
      border: 1px solid #ff4444;
      color: #ff4444;

      &:hover:not(:disabled) {
        background-color: #ff4444;
        color: white;
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

