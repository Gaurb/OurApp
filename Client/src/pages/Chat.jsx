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
          setMessages(Array.isArray(response.data) ? response.data : []);
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
      const socket = new SockJS(`${host}/gs-guide-websocket`, null,
         {
        transports: ['websocket'],
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const client = Stomp.over(() => socket);
      
      // Enable debug mode
      // client.debug = function(str) {
      //     console.log(str);
      // };

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Custom-Header': 'value'
      };

      client.connect(headers, function(frame) {
          setConnected(true);
          setConnectionStatus('Connected');
          // console.log('Connected: ' + frame);
          const username = user?.username;
          // Subscribe to private messages
          const subscription = client.subscribe('/user/' + username + '/queue/private', function(message) {
              // console.log('Received message:', message);
              const privateMessage = JSON.parse(message.body);
              // console.log('Parsed message:', privateMessage);
              
              // Update messages state by adding the new message to the existing array
              setMessages(prevMessages => {
                const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
                // If the message is for the current chat, add it to the messages
                if (privateMessage.sender === currentChat?.username || 
                    privateMessage.receiver === currentChat?.username) {
                  return [...currentMessages, privateMessage];
                }
                return currentMessages;
              });
          });
          setStompClient(client);
          // console.log('Subscribed to: /user/' + username + '/queue/private');
      }, function(error) {
          console.error('Error: ' + error);
          setConnected(false);
          setConnectionStatus('Connection Failed');
          toast.error('WebSocket Connection Failed');
      });
    }

    connect();

    return () => {
      if (stompClient) {
        stompClient.disconnect(() => {
          setConnected(false);
          setConnectionStatus('Disconnected');
          // console.log('Disconnected from WebSocket');
        });
      }
    };
    
  }, [isAuthenticated, user, accessToken]);

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

    const content = message;
    const privateMessage = {
      sender: user?.username,
      receiver: currentChat?.username,
      content: content,
      timestamp: new Date().toISOString()
    };

    // Add message to local state immediately
    setMessages(prevMessages => {
      const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
      return [...currentMessages, privateMessage];
    });

    // console.log('Sending message:', privateMessage);
    stompClient.send("/app/private-message", {}, JSON.stringify(privateMessage));
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Container>
        
        <div className="container">
          <div className="connection-status" style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            padding: '5px 10px',
            backgroundColor: connected ? '#4CAF50' : '#f44336',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {connectionStatus}
          </div>
          <Contacts contacts={contacts} changeChat={handleChatChange} />
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
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
