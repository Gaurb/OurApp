import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute,getAvatarRoute } from "../utils/APIRoutes";
import { UserAuth } from "../context/AuthContext";
import { BsArrowRepeat } from "react-icons/bs";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const { user, isAuthenticated } = UserAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
   
    if (isAuthenticated && !isNavigating) {
      setIsNavigating(true);
      if (user.isAvatarSet) {
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [isAuthenticated]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      try {
        const id = selectedAvatar.split('=')[1];
        const setAvatarRes= await axios.post(`${setAvatarRoute}/${id}`);
        const data = setAvatarRes.data;
        console.log(setAvatarRes);
        if (data.avatarSet) {
          user.avatar = data.avatarUrl;
          user.isAvatarSet = true;
          navigate("/");
        } else {
          toast.error("Error setting avatar. Please try again.", toastOptions);
        }
      } catch (error) {
        console.error("Error setting avatar:", error);
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    }
  };

  const generateAvatars = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(getAvatarRoute);
      setAvatars(response.data);
    } catch (error) {
      console.error("Error generating avatars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAvatars();
  }, []);




  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Choose Your Avatar</h1>
            <p className="subtitle">Select a profile picture that represents you</p>
            <button className="refresh-btn" onClick={generateAvatars}>
              <BsArrowRepeat className="refresh-icon" />
              Refresh Avatars
            </button>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => {
              return (
                <div
                  key={index}
                  className={`avatar ${selectedAvatar === avatar ? "selected" : ""}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img
                    src={avatar}
                    alt="avatar"
                  />
                </div>
              );
            })}
          </div>
          <button 
            onClick={setProfilePicture} 
            className={`submit-btn ${selectedAvatar === undefined ? 'disabled' : ''}`}
            disabled={selectedAvatar === undefined}
          >
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  width: 100vw;
  padding: 2rem;

  .loader {
    max-width: 150px;
    filter: brightness(1.2);
  }

  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    h1 {
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
      margin: 0;
      font-weight: 400;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.8rem 1.5rem;
      border: none;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      
      .refresh-icon {
        font-size: 1.2rem;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .avatars {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    max-width: 600px;

    .avatar {
      border: 2px solid transparent;
      padding: 0.8rem;
      border-radius: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      
      img {
        height: 5rem;
        width: 5rem;
        border-radius: 12px;
        object-fit: cover;
        transition: all 0.3s ease;
      }

      &:hover {
        transform: translateY(-5px) scale(1.05);
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }
    }

    .selected {
      border-color: #ffeb3b;
      background: rgba(255, 235, 59, 0.1);
      box-shadow: 0 0 20px rgba(255, 235, 59, 0.3);
      
      &:hover {
        background: rgba(255, 235, 59, 0.15);
        border-color: #ffeb3b;
      }
    }
  }

  .submit-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1rem 2.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 12px;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

    &:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }

    &.disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  @media screen and (max-width: 768px) {
    padding: 1rem;
    
    .title-container {
      padding: 1.5rem;
      
      h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
    }
    
    .avatars {
      grid-template-columns: repeat(2, 1fr);
      padding: 1.5rem;
      
      .avatar img {
        height: 4rem;
        width: 4rem;
      }
    }
    
    .submit-btn {
      padding: 0.8rem 2rem;
      font-size: 0.9rem;
    }
  }
`;
