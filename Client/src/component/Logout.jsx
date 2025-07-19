import React from "react";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Logout() {
  const navigate = useNavigate();
  const {logout} = UserAuth();


    const handleClick = async () => {
      const res = await logout();
      if(res.status === 200){
       navigate("/login");
      }
     };
     
  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
