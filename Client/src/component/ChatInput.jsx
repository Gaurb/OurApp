import React, { useState, useRef, useCallback, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { FaMagic } from "react-icons/fa";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import MagicReplies from "./MagicReplies";

export default function ChatInput({ handleSendMsg, currentChat, currentRoom, user, stompClient, lastMessage, suggestions = [] }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMagicReplies, setShowMagicReplies] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  
  // Determine if this is a group chat
  const isGroupChat = !!currentRoom;

  // Debug: Log stompClient status
  useEffect(() => {
    console.log('ChatInput - Props:', JSON.stringify({
      hasStompClient: !!stompClient,
      isConnected: stompClient?.connected,
      hasCurrentChat: !!currentChat,
      hasCurrentRoom: !!currentRoom,
      currentRoomName: currentRoom?.roomName || 'none',
      username: user?.username || 'none',
      isGroupChat
    }, null, 2));
  }, [stompClient, currentChat, currentRoom, isGroupChat, user]);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowMagicReplies(false); // Close magic replies when opening emoji picker
  };

  const handleMagicRepliesToggle = () => {
    const newShowState = !showMagicReplies;
    setShowMagicReplies(newShowState);
    setShowEmojiPicker(false); // Close emoji picker when opening magic replies
    
    // Request suggestions from backend when opening magic replies
    if (newShowState && stompClient && stompClient.connected && currentChat && user) {
      const requestData = {
        sender: user.username,
        receiver: currentChat.username,
        lastMessage: lastMessage?.content || ""
      };
      
      stompClient.send("/app/request-suggestions", {}, JSON.stringify(requestData));
    }
  };

  const handleEmojiClick = (_, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const handleMagicReplySelect = (reply) => {
    setMsg(reply);
    setShowMagicReplies(false);
  };

  // Send typing status
  const sendTypingStatus = useCallback((isTyping) => {
    if (!stompClient || !stompClient.connected || !user) {
      console.log('Cannot send typing status: stompClient not connected');
      return;
    }
    
    // Check if it's a group chat or private chat
    if (isGroupChat && currentRoom) {
      // Group chat typing status
      const typingData = {
        sender: user.username,
        roomName: currentRoom.roomName,
        isTyping: isTyping
      };
      console.log('Sending group typing status:', typingData);
      stompClient.send("/app/group-typing", {}, JSON.stringify(typingData));
    } else if (currentChat) {
      // Private chat typing status
      const typingData = {
        sender: user.username,
        receiver: currentChat.username,
        isTyping: isTyping
      };
      console.log('Sending private typing status:', typingData);
      stompClient.send("/app/typing-status", {}, JSON.stringify(typingData));
    }
  }, [stompClient, currentChat, currentRoom, user, isGroupChat]);

  // Handle input change with typing detection
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setMsg(value);
    
    // Send typing status if not already typing
    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      sendTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingStatus(false);
      }
    }, 2000);
    
    // If input is empty, immediately stop typing
    if (value.length === 0 && isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }
  }, [sendTypingStatus]);

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      // Stop typing when sending message
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingStatus(false);
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      handleSendMsg(msg);
      setMsg("");
    }
  };


  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
        <div className="magic-replies">
          <FaMagic 
            onClick={handleMagicRepliesToggle} 
            className={showMagicReplies ? 'active' : ''}
          />
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <label htmlFor="message-input" className="sr-only">Type your message</label>
        <input
          id="message-input"
          type="text"
          placeholder="type your message here"
          onChange={handleInputChange}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
      
      <MagicReplies
        isVisible={showMagicReplies}
        onSelectReply={handleMagicReplySelect}
        lastMessage={lastMessage}
        onClose={() => setShowMagicReplies(false)}
        suggestions={suggestions}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 0.8rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  min-height: 60px;
  
  @media screen and (max-width: 768px) {
    padding: 1rem;
    gap: 0.8rem;
    min-height: 65px;
  }
  
  .button-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .emoji {
      position: relative;
      
      svg {
        font-size: 1.5rem;
        color: #ffeb3b;
        cursor: pointer;
        transition: all 0.3s ease;
        // padding: 0.5rem;
        border-radius: 50%;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }
      }
      
      .emoji-picker-react {
        position: absolute;
        bottom: 60px;
        left: 0;
        z-index: 1000;
        background: rgba(30, 30, 30, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        
        .emoji-scroll-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        
        .emoji-scroll-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .emoji-scroll-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .emoji-categories button {
          filter: brightness(1.2);
        }
        
        .emoji-search {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
        }
        
        .emoji-group:before {
          background: rgba(30, 30, 30, 0.95);
        }
      }
    }
    
    .magic-replies {
      position: relative;
      
      svg {
        font-size: 1.4rem;
        color: #667eea;
        cursor: pointer;
        transition: all 0.3s ease;
        // padding: 0.5rem;
        border-radius: 50%;
        
        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.1);
          color: #764ba2;
        }
        
        &.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          transform: scale(1.1);
        }
      }
    }
  }
  
  .input-container {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem;
    transition: all 0.3s ease;
    
    &:focus-within {
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
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
    
    input {
      flex: 1;
      background: transparent;
      color: white;
      border: none;
      padding: 0.8rem 1.2rem;
      font-size: 1rem;
      line-height: 1.4;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      &::selection {
        background: rgba(102, 126, 234, 0.4);
      }
      
      &:focus {
        outline: none;
      }
    }
    
    button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      svg {
        font-size: 1.2rem;
        color: white;
      }
      
      @media screen and (max-width: 768px) {
        width: 40px;
        height: 40px;
        
        svg {
          font-size: 1rem;
        }
      }
    }
  }
`;
