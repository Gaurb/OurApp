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

  useEffect(() => {
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
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;

    h1 {
      color: white;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #a0a0a0;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #4e0eff;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      font-weight: 500;
      cursor: pointer;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      
      .refresh-icon {
        font-size: 1.2rem;
      }

      &:hover {
        background-color: #3b0dcc;
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .avatars {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 1rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.1);
      
      img {
        height: 8rem;
        width: 8rem;
        transition: all 0.3s ease;
        border-radius: 0.5rem;
      }

      &:hover {
        transform: translateY(-5px);
        background-color: rgba(255, 255, 255, 0.15);
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
      background-color: rgba(78, 14, 255, 0.1);
      
      &:hover {
        background-color: rgba(78, 14, 255, 0.15);
      }
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    text-transform: uppercase;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;

    &:hover:not(.disabled) {
      background-color: #3b0dcc;
      transform: translateY(-2px);
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }

    &.disabled {
      background-color: #2d2d2d;
      color: #666;
      cursor: not-allowed;
    }
  }
`;
