import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (_, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
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
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <label htmlFor="message-input" className="sr-only">Type your message</label>
        <input
          id="message-input"
          type="text"
          placeholder="type your message here"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media screen and (max-width: 768px) {
    padding: 1rem;
    gap: 0.8rem;
  }
  
  .button-container {
    display: flex;
    align-items: center;
    
    .emoji {
      position: relative;
      
      svg {
        font-size: 1.5rem;
        color: #ffeb3b;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 0.5rem;
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
