import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";
import { host, addFriendRoute, searchFriendRoute } from "../utils/APIRoutes";
import axiosInstance from "../utils/axiosConfig";
import defaultAvatar from '../assets/generated-image.png'

export default function SearchFriendModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const getusers = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${searchFriendRoute}?query=${encodeURIComponent(searchQuery.trim())}`);
        console.log("response", response.data);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(getusers);
  }, [searchQuery]);

  const handleAddFriend = async (userId) => {
    try {
      await axiosInstance.post(`${addFriendRoute}/${userId}`);
      setSearchResults(prev => prev.filter(user => user.username !== userId));
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <h2>Add Friend</h2>
        <SearchForm onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-friend" className="sr-only">Search by username</label>
          <SearchInput
            id="search-friend"
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </SearchForm>
        
        <ResultsContainer>
          {loading ? (
            <LoadingText>Searching...</LoadingText>
          ) : searchResults.length > 0 ? (
            searchResults.map((user,index) => (
              <UserCard key={index}>
                <UserInfo>
                  <Avatar src={!user.avatarUrl || user.avatarUrl.trim === "" ? defaultAvatar : user.avatarUrl} alt="" />
                  <Username>{user.username}</Username>
                </UserInfo>
                <AddButton onClick={() => handleAddFriend(user.username)}>
                  Add
                </AddButton>
              </UserCard>
            ))
          ) : searchQuery ? (
            <NoResults>No users found</NoResults>
          ) : null}
        </ResultsContainer>
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
`;

const ModalContent = styled.div`
  background-color: #2d2d2d;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  position: relative;
  color: white;

  h2 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #4e0eff;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #4e0eff;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #3d3d3d;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4e0eff;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

const SearchButton = styled.button`
  background-color: #4e0eff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a0cc9;
  }
`;

const ResultsContainer = styled.div`
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 0.3rem;
    &-thumb {
      background-color: #4e0eff;
      border-radius: 1rem;
    }
  }
`;

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #3d3d3d;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  border-radius: 50%;
  width: 2.5rem;
  max-height : 2.5rem;
  margin-right: 1rem;
`;

const Username = styled.span`
  font-size: 1rem;
  color: white;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #4e0eff;
  padding: 1rem;
`;

const NoResults = styled.div`
  text-align: center;
  color: #666;
  padding: 1rem;
`;

const AddButton = styled.button`
  background-color: #4e0eff;
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a0cc9;
  }
`; 