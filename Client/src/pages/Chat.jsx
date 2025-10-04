import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import styled from "styled-components";
import { allUsersRoute, host, getAllRoomsRoute, getGroupMessagesRoute } from "../utils/APIRoutes";
import ChatContainer from "../component/ChatContainer";
import GroupChatContainer from "../component/GroupChatContainer";
import Contacts from "../component/Contacts";
import GroupList from "../component/GroupList";
import Welcome from "../component/Welcome";
import MobileNav from "../component/MobileNav";
import SearchFriendModal from "../component/SearchFriendModal";
import CreateGroupModal from "../component/CreateGroupModal";
import GroupSettings from "../component/GroupSettings";
import { UserAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import axios from "axios";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, accessToken, logout } = UserAuth();
  
  // Determine if we're in group mode based on route
  const isGroupMode = location.pathname === '/groups';
  
  // Private chat states
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  
  // Group chat states
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(undefined);
  
  // Shared states
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showContacts, setShowContacts] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Debug: Track stompClient changes
  useEffect(() => {
    console.log('StompClient state changed:', JSON.stringify({
      hasStompClient: !!stompClient,
      isConnected: stompClient?.connected,
      connected,
      username: user?.username
    }, null, 2));
  }, [stompClient, connected, user]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowContacts(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load contacts for private chat
  const loadContacts = async () => {
    try {
      const response = await axios.get(allUsersRoute, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setContacts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    }
  };

  // Load rooms for group chat
  const loadRooms = async () => {
    try {
      const response = await axios.get(getAllRoomsRoute, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    }
  };

  // Load friends
  const loadFriends = async () => {
    try {
      const response = await axios.get(`${host}/api/user/getFriends`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setFriends(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadContacts();
      loadRooms();
      loadFriends();
    }
  }, [isAuthenticated, user]);

  // Load messages for private chat
  useEffect(() => {
    const loadPrivateMessages = async () => {
      if (currentChat && user && !isGroupMode) {
        try {
          const response = await axios.get(`${host}/messages/${user.username}/${currentChat.username}`);
          const sortedMessages = Array.isArray(response.data) 
            ? response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            : [];
          setMessages(sortedMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      } else if (!currentChat && !isGroupMode) {
        setMessages([]);
      }
    };
    loadPrivateMessages();
  }, [currentChat, user, isGroupMode]);

  // Load messages for group chat
  useEffect(() => {
    const loadGroupMessages = async () => {
      if (currentRoom && user && isGroupMode) {
        try {
          const response = await axios.get(getGroupMessagesRoute(currentRoom.roomName), {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          const sortedMessages = Array.isArray(response.data) 
            ? response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            : [];
          setMessages(sortedMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      } else if (!currentRoom && isGroupMode) {
        setMessages([]);
      }
    };
    loadGroupMessages();
  }, [currentRoom, user, accessToken, isGroupMode]);

  // WebSocket connection
  useEffect(() => {
    if (!user?.username || !accessToken) return;

    const socket = new SockJS(`${host}/gs-guide-websocket`, null, {
      transports: ['websocket'],
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const client = Stomp.over(() => socket);
    client.debug = () => {};

    const headers = {
      'Authorization': `Bearer ${accessToken}`
    };

    client.connect(headers, function(frame) {
      console.log('WebSocket connected successfully!');
      setConnected(true);
      setStompClient(client);
      console.log('StompClient set:', { connected: client.connected });
      
      // Subscribe to private messages
      client.subscribe(`/user/${user.username}/queue/private`, function(message) {
        const privateMessage = JSON.parse(message.body);
        
        if (!isGroupMode) {
          setMessages(prevMessages => {
            const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
            if (privateMessage.sender === currentChat?.username || 
                privateMessage.receiver === currentChat?.username) {
              return [...currentMessages, privateMessage].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
              );
            }
            return currentMessages;
          });
        }
      });

      // Subscribe to private typing status
      client.subscribe(`/user/${user.username}/queue/typing`, function(message) {
        const typingStatus = JSON.parse(message.body);
        
        if (!isGroupMode) {
          setTypingUsers(prevTypingUsers => {
            if (typingStatus.isTyping) {
              if (!prevTypingUsers.includes(typingStatus.sender)) {
                return [...prevTypingUsers, typingStatus.sender];
              }
            } else {
              return prevTypingUsers.filter(user => user !== typingStatus.sender);
            }
            return prevTypingUsers;
          });
        }
      });

      // Subscribe to suggestions
      client.subscribe(`/user/${user.username}/queue/suggestions`, function(message) {
        const suggestions = JSON.parse(message.body);
        setSuggestions(suggestions);
      });
    }, function(error) {
      console.error('WebSocket Connection Error:', error);
      setConnected(false);
      toast.error('WebSocket Connection Failed');
    });

    return () => {
      if (client) {
        client.disconnect(() => {
          setConnected(false);
        });
      }
    };
  }, [user, accessToken]);

  // Dynamic subscription for group room messages and typing
  useEffect(() => {
    if (!stompClient || !stompClient.connected || !currentRoom || !isGroupMode) return;

    console.log('Subscribing to room:', currentRoom.roomName);

    // Subscribe to group messages
    const messageSubscription = stompClient.subscribe(
      `/topic/room/${currentRoom.roomName}`, 
      function(message) {
        const groupMessage = JSON.parse(message.body);
        console.log('Received group message:', groupMessage);
        setMessages(prevMessages => {
          const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
          return [...currentMessages, groupMessage].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
        });
      }
    );

    // Subscribe to group typing
    const typingSubscription = stompClient.subscribe(
      `/topic/room/${currentRoom.roomName}/typing`, 
      function(message) {
        const typingStatus = JSON.parse(message.body);
        console.log('Received typing status:', typingStatus);
        console.log('Current user:', user.username);
        
        setTypingUsers(prevTypingUsers => {
          console.log('Previous typing users:', prevTypingUsers);
          
          if (typingStatus.isTyping && typingStatus.sender !== user.username) {
            if (!prevTypingUsers.includes(typingStatus.sender)) {
              const newTypingUsers = [...prevTypingUsers, typingStatus.sender];
              console.log('Adding user to typing list. New list:', newTypingUsers);
              return newTypingUsers;
            } else {
              console.log('User already in typing list');
            }
          } else {
            const newTypingUsers = prevTypingUsers.filter(u => u !== typingStatus.sender);
            console.log('Removing user from typing list. New list:', newTypingUsers);
            return newTypingUsers;
          }
          console.log('No change to typing users');
          return prevTypingUsers;
        });
      }
    );

    // Cleanup subscriptions when room changes
    return () => {
      console.log('Unsubscribing from room:', currentRoom.roomName);
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      if (typingSubscription) {
        typingSubscription.unsubscribe();
      }
    };
  }, [stompClient, currentRoom, isGroupMode, user]);

  // Handle chat selection
  const handleChatChange = (contact) => {
    setCurrentChat(contact);
    setCurrentRoom(undefined);
    setTypingUsers([]);
    if (window.innerWidth <= 768) {
      setShowContacts(false);
    }
  };

  // Handle room selection
  const handleRoomChange = (room) => {
    setCurrentRoom(room);
    setCurrentChat(undefined);
    setTypingUsers([]);
    if (window.innerWidth <= 768) {
      setShowContacts(false);
    }
  };

  // Send private message
  const sendPrivateMessage = (msg) => {
    if (!stompClient || !currentChat) return;

    const message = {
      sender: user.username,
      receiver: currentChat.username,
      content: msg
    };

    stompClient.send('/app/private-message', {}, JSON.stringify(message));
  };

  // Send group message
  const sendGroupMessage = (msg) => {
    if (!stompClient || !currentRoom) return;

    const message = {
      sender: user.username,
      roomName: currentRoom.roomName,
      content: msg
    };

    stompClient.send('/app/group-message', {}, JSON.stringify(message));
  };

  const handleBack = () => {
    if (isGroupMode) {
      setCurrentRoom(undefined);
    } else {
      setCurrentChat(undefined);
    }
    setShowContacts(true);
  };

  const handleLogout = async () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    const res = await logout();
    if (res.status === 200) {
      navigate("/login");
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Container>
      <div className="container">
        <MobileNav 
          showContacts={showContacts}
          onShowContacts={() => setShowContacts(true)}
          currentChat={isGroupMode ? currentRoom : currentChat}
          onLogout={handleLogout}
        />

        {/* Contacts/Groups Panel */}
        <div className={`contacts-panel ${showContacts ? 'show' : 'hide'}`}>
          {isGroupMode ? (
            <GroupList
              rooms={rooms}
              onSelectRoom={handleRoomChange}
              onCreateRoom={() => setShowCreateModal(true)}
              currentSelectedRoom={currentRoom}
            />
          ) : (
            <Contacts
              contacts={contacts}
              changeChat={handleChatChange}
              onShowSearchModal={() => setShowSearchModal(true)}
            />
          )}
        </div>

        {/* Chat Panel */}
        <div className={`chat-panel ${!showContacts ? 'show' : 'hide'}`}>
          {isGroupMode ? (
            currentRoom ? (
              <GroupChatContainer
                currentRoom={currentRoom}
                messages={messages}
                onSendMessage={sendGroupMessage}
                onBack={handleBack}
                onOpenSettings={() => setShowSettingsModal(true)}
                typingUsers={typingUsers}
                stompClient={stompClient}
              />
            ) : (
              <Welcome user={user} />
            )
          ) : (
            currentChat ? (
              <ChatContainer
                currentChat={currentChat}
                stompClient={stompClient}
                messages={messages}
                onBack={handleBack}
                suggestions={suggestions}
                typingUsers={typingUsers}
                user={user}
                sendMessage={sendPrivateMessage}
              />
            ) : (
              <Welcome user={user} />
            )
          )}
        </div>
      </div>

      {/* Modals */}
      <SearchFriendModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        friends={friends}
        accessToken={accessToken}
        onGroupCreated={(newRoom) => {
          loadRooms();
          setCurrentRoom(newRoom);
          if (window.innerWidth <= 768) {
            setShowContacts(false);
          }
        }}
      />

      <GroupSettings
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentRoom={currentRoom}
        friends={friends}
        accessToken={accessToken}
        onRoomUpdated={() => {
          loadRooms();
          setCurrentRoom(undefined);
          setShowSettingsModal(false);
        }}
      />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  @media screen and (max-width: 768px) {
    gap: 0;
    padding: 0;
  }

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    position: relative;
    border-radius: 1rem;
    overflow: hidden;

    @media screen and (max-width: 768px) {
      width: 100vw;
      height: calc(100vh - 60px);
      margin-top: 60px;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      border-radius: 0;
    }

    .contacts-panel {
      background-color: #080420;
      
      @media screen and (max-width: 768px) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        transition: transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
        will-change: transform;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        backface-visibility: hidden;

        &.hide {
          transform: translateX(-100%);
        }

        &.show {
          transform: translateX(0);
        }
      }
    }

    .chat-panel {
      @media screen and (max-width: 768px) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
        transition: transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
        will-change: transform;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        backface-visibility: hidden;

        &.hide {
          transform: translateX(100%);
        }

        &.show {
          transform: translateX(0);
        }
      }
    }
  }
`;
