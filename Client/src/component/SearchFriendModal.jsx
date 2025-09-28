import React, { useState, useEffect} from "react";
import styled, { keyframes } from "styled-components";
import { FaSearch, FaTimes, FaUserPlus, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { addFriendRoute, searchFriendRoute,allUsersRoute } from "../utils/APIRoutes";
import axiosInstance from "../utils/axiosConfig";
import defaultAvatar from '../assets/generated-image.png'

export default function SearchFriendModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingFriends, setAddingFriends] = useState(new Set());
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const getusers = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${searchFriendRoute}?query=${encodeURIComponent(searchQuery.trim())}`);
        const friendsResponse = await axios.get(`${allUsersRoute}`);
        setFriends(friendsResponse.data);
        console.log("response", response.data);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(getusers);
  }, [searchQuery]);

  const handleAddFriend = async (userId) => {
    try {
      setAddingFriends(prev => new Set(prev).add(userId));
      await axiosInstance.post(`${addFriendRoute}/${userId}`);
      setSearchResults(prev => prev.filter(user => user.username !== userId));
    } catch (error) {
      console.error("Error adding friend:", error);
    } finally {
      setAddingFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <Header>
          <Title>
            <FaUserPlus />
            Add New Friend
          </Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <SearchSection>
          <SearchForm onSubmit={(e) => e.preventDefault()}>
            <SearchInputWrapper>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {loading && (
                <LoadingSpinner>
                  <FaSpinner />
                </LoadingSpinner>
              )}
            </SearchInputWrapper>
          </SearchForm>
        </SearchSection>
        
        <ResultsSection>
          {loading && searchQuery ? (
            <LoadingState>
              <FaSpinner />
              <span>Searching for users...</span>
            </LoadingState>
          ) : searchResults.length > 0 ? (
            <ResultsList>
              {searchResults.map((user, index) => (
                <UserCard key={index}>
                  <UserInfo>
                    <Avatar 
                      src={!user.avatarUrl || user.avatarUrl.trim === "" ? defaultAvatar : user.avatarUrl} 
                      alt={`${user.username}'s avatar`}
                    />
                    <UserDetails>
                      <Username>{user.username}</Username>
                      <UserStatus>{ friends.find(friend => friend.username === user.username) ? "Already a friend" : "Available to connect"}</UserStatus>
                    </UserDetails>
                  </UserInfo>
                  <AddButton 
                    onClick={() => handleAddFriend(user.username)}
                    disabled={addingFriends.has(user.username)}
                  >
                    {addingFriends.has(user.username) ? (
                      <>
                        <FaSpinner />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        Add Friend
                      </>
                    )}
                  </AddButton>
                </UserCard>
              ))}
            </ResultsList>
          ) : searchQuery && !loading ? (
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyTitle>No users found</EmptyTitle>
              <EmptyText>Try searching with a different username</EmptyText>
            </EmptyState>
          ) : (
            <InitialState>
              <InitialIcon>👋</InitialIcon>
              <InitialTitle>Find New Friends</InitialTitle>
              <InitialText>Start typing a username to search for new connections</InitialText>
            </InitialState>
          )}
        </ResultsSection>
      </ModalContent>
    </ModalOverlay>
  );
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(8px) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 9999 !important;
  padding: 1rem !important;
  margin: 0 !important;
  transform: none !important;
  
  @media (max-width: 768px) {
    padding: 0.5rem !important;
    align-items: flex-start !important;
    padding-top: 2rem !important;
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, rgba(30, 30, 30, 0.95), rgba(40, 40, 40, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    border-radius: 12px;
    max-height: 95vh;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 1rem 0.5rem 1rem;
  }
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  
  svg {
    color: #667eea;
    font-size: 1.3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    
    svg {
      font-size: 1.1rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    gap: 0.6rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const SearchSection = styled.div`
  padding: 1rem 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const SearchForm = styled.form`
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
  font-size: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.9rem 0.9rem 0.9rem 2.8rem;
    font-size: 0.95rem;
  }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  right: 1rem;
  color: #667eea;
  
  svg {
    animation: ${spin} 1s linear infinite;
  }
`;

const ResultsSection = styled.div`
  flex: 1;
  padding: 0 2rem 2rem 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0 1rem 1rem 1rem;
  }
`;

const ResultsList = styled.div`
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.5);
    border-radius: 10px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.7);
    }
  }
`;

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 0.8rem;
  transition: all 0.3s ease;
  animation: ${slideUp} 0.3s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Avatar = styled.img`
  width: 3rem !important;
  height: 3rem !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  flex-shrink: 0 !important;
  filter: none !important;
  animation: none !important;
  display: block !important;
  
  @media (max-width: 480px) {
    width: 2.5rem !important;
    height: 2.5rem !important;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

const Username = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const UserStatus = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    
    svg {
      animation: ${spin} 1s linear infinite;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 0.9rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #667eea;
  gap: 1rem;
  
  svg {
    font-size: 2rem;
    animation: ${spin} 1s linear infinite;
  }
  
  span {
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const EmptyTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const InitialState = styled(EmptyState)``;
const InitialIcon = styled(EmptyIcon)``;
const InitialTitle = styled(EmptyTitle)``;
const InitialText = styled(EmptyText)``;