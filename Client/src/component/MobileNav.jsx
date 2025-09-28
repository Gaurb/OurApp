import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdMenu, IoMdClose, IoMdPersonAdd, IoMdChatbubbles, IoMdSettings, IoMdLogOut } from 'react-icons/io';
import SearchFriendModal from './SearchFriendModal';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

// Styled Components
const NavContainer = styled.nav`
  display: none; // Hidden by default on desktop
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 1rem;
  z-index: 1000;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const BackButton = styled(MenuButton)``;

const Title = styled.h1`
  color: white;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
`;

const Menu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1002;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: white;
  width: 100%;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1002;
  position: relative;

  svg {
    font-size: 1.3rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const MobileNav = ({ onShowContacts, showContacts,onLogout}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { logout } = UserAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <>
      <NavContainer>
        <MenuButton onClick={toggleMenu}>
          {isMenuOpen ? <IoMdClose /> : <IoMdMenu />}
        </MenuButton>
        <Title>{showContacts ? 'Contacts' : 'Chat'}</Title>
        {!showContacts && (
          <BackButton onClick={onShowContacts}>
            <IoMdChatbubbles />
          </BackButton>
        )}
      </NavContainer>

      {/* Slide-out Menu */}
      <MenuOverlay isOpen={isMenuOpen} onClick={toggleMenu}>
        <Menu isOpen={isMenuOpen} onClick={e => e.stopPropagation()}>
          <MenuItem 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSearchModal(true);
              setIsMenuOpen(false);
            }}
          >
            <IoMdPersonAdd />
            <span>Add Friend</span>
          </MenuItem>
          
          <MenuItem 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowContacts();
              setIsMenuOpen(false);
            }}
          >
            <IoMdChatbubbles />
            
            <span>Chats</span>
          </MenuItem>
          
          <MenuItem type="button">
            <IoMdSettings />
            <span>Settings</span>
          </MenuItem>
          
          <MenuItem 
            type="button"
            onClick={() => onLogout()}
          >
            <IoMdLogOut />
            <span>Logout</span>
          </MenuItem>
        </Menu>
      </MenuOverlay>

      {/* Search Friend Modal */}
      {showSearchModal && (
        <SearchFriendModal onClose={() => setShowSearchModal(false)} />
      )}
    </>
  );
};

export default MobileNav;