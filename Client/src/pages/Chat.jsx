import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../component/ChatContainer";
import Contacts from "../component/Contacts";
import Welcome from "../component/Welcome";
import { UserAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import axiosInstance, { setAuthToken } from "../utils/axiosConfig";
import axios from "axios";

export default function Chat() {
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = UserAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Add useEffect to load messages when currentChat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (currentChat && user) {
        try {
          const response = await axios.get(`${host}/messages/${user.username}/${currentChat.username}`);
          // Sort messages by timestamp before setting state
          const sortedMessages = Array.isArray(response.data) 
            ? response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            : [];
          setMessages(sortedMessages);
          console.log('Messages loaded:', messages);
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([]); // Clear messages when no chat is selected
      }
    };
    loadMessages();
  }, [currentChat, user]);



  useEffect(() => {
    function connect() {
      const socket = new SockJS(`${host}/gs-guide-websocket`, null, {
        transports: ['websocket'],
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const client = Stomp.over(() => socket);
      
      // Disable debug logs
      client.debug = () => {};

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Custom-Header': 'value'
      };

      client.connect(headers, function(frame) {
        if (!user?.username) return; // Don't proceed if no username
        
        setConnected(true);
        setConnectionStatus('Connected');
        
        // Subscribe to private messages
        client.subscribe(`/user/${user.username}/queue/private`, function(message) {
          const privateMessage = JSON.parse(message.body);
          
          // Update messages state by adding the new message to the existing array
          setMessages(prevMessages => {
            const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
            // If the message is for the current chat, add it to the messages
            if (privateMessage.sender === currentChat?.username || 
                privateMessage.receiver === currentChat?.username) {
              return [...currentMessages, privateMessage].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
              );
            }
            return currentMessages;
          });
        });
        
        setStompClient(client);
      }, function(error) {
        console.error('WebSocket Connection Error:', error);
        setConnected(false);
        setConnectionStatus('Connection Failed');
        toast.error('WebSocket Connection Failed');
      });
    }

    let mounted = true;
    
    if (mounted && user?.username && accessToken) {
      connect();
    }

    return () => {
      mounted = false;
      if (stompClient) {
        stompClient.disconnect(() => {
          if (mounted) {
            setConnected(false);
            setConnectionStatus('Disconnected');
          }
        });
      }
    };
  }, [isAuthenticated, user, accessToken, currentChat]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (isAuthenticated && user && accessToken && !isNavigating) {
        try {
          setIsNavigating(true);
          setAuthToken(accessToken);
          if(user.isAvatarSet){
            // user.avatarUrl=user.avatarUrl;
            const res = await axiosInstance.get(allUsersRoute);
            // console.log('Contacts response:', res.data);
            setContacts(res.data);
          }
        } catch (error) {
          console.error('Error fetching contacts:', error);
          toast.error('Failed to fetch contacts');
        } finally {
          setIsNavigating(false);
        }
      }
    };
    if (!isAuthenticated) {
      navigate("/login");
    }
    else if(user && user.isAvatarSet){
      fetchContacts();
    }else if(user && !user.isAvatarSet){
      navigate("/setAvatar");
    }
  }, [isAuthenticated, user, accessToken]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // Add connection status check function
  const checkConnection = () => {
    if (stompClient) {
      const isConnected = stompClient.connected;
      console.log('STOMP Client Connection Status:', isConnected);
      return isConnected;
    }
    return false;
  };

  // Modify sendMessage to update local state immediately
  const sendMessage = (message) => {
    if (!checkConnection()) {
      toast.error('Not connected to chat server');
      return;
    }

    const now = new Date();
    const privateMessage = {
      sender: user?.username,
      receiver: currentChat?.username,
      content: message,
      timestamp: now.toISOString() // Use ISO string format for consistent timestamp
    };

    // Add message to local state immediately
    setMessages(prevMessages => {
      const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
      const newMessages = [...currentMessages, privateMessage];
      // Sort messages by timestamp
      return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    stompClient.send("/app/private-message", {}, JSON.stringify(privateMessage));
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Container connected={connected}>
        
        <div className="container">
          <div className="connection-status">
            {connectionStatus}
          </div>
          <div className="contacts-panel">
            <Contacts contacts={contacts} changeChat={handleChatChange} />
          </div>
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer 
              currentChat={currentChat} 
              messages={messages}
              sendMessage={sendMessage}
              stompClient={stompClient}
              user={user}
            />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  
  .container {
    height: 95vh;
    width: 95vw;
    max-width: 1400px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
    
    @media screen and (max-width: 1080px) {
      grid-template-columns: 280px 1fr;
      width: 98vw;
      height: 92vh;
    }
    
    @media screen and (max-width: 768px) {
      grid-template-columns: 1fr;
      .contacts-panel {
        display: none;
      }
    }
    
    .connection-status {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      background: ${props => props.connected ? 
        'linear-gradient(135deg, #4CAF50, #45a049)' : 
        'linear-gradient(135deg, #f44336, #d32f2f)'};
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      backdrop-filter: blur(10px);
      margin-right: 60px; /* Add space for logout button */
    }
  }
`;
