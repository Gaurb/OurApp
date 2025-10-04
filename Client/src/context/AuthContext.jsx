import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { refreshRoute, loginRoute, registerRoute,logoutRoute } from '../utils/APIRoutes';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    
  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const storedRefreshToken = JSON.parse(localStorage.getItem(process.env.REACT_APP_REFRESH_TOKEN));
        if(storedRefreshToken) {
            const response = await axios.post(refreshRoute, {
                refreshToken: storedRefreshToken
            }, { withCredentials: true });
            const { token: newAccessToken, user: userData, refreshToken: newRefreshToken } = response.data;
            if (isMounted) {
              setAccessToken(newAccessToken);             
              setUser(userData);
              setRefreshToken(newRefreshToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            }
        } else {
            throw new Error('No refresh token found');
        }
      } catch (error) {                     
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username, password) => {
    try {
        const response = await axios.post(loginRoute, { username, password }, { withCredentials: true });
        // console.log(response);
        
        setAccessToken(response.data.token);
        setUser(response.data.user);
        setRefreshToken(response.data.refreshToken);
        // console.log(accessToken, refreshToken, user);
        localStorage.setItem(process.env.REACT_APP_REFRESH_TOKEN, JSON.stringify(response.data.refreshToken));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
  }
  const logout = async () => {
    try {
        const response = await axios.post(logoutRoute, {}, { withCredentials: true });
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(process.env.REACT_APP_REFRESH_TOKEN);
        delete axios.defaults.headers.common['Authorization'];
        return response;
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
  }
  const register = async (username, password, email) => {
    try {
        const response = await axios.post(registerRoute, { username, password, email }, { withCredentials: true });
        const { token: newAccessToken, user: userData, refreshToken: newRefreshToken } = response.data;
        setAccessToken(newAccessToken);
        setUser(userData);
        setRefreshToken(newRefreshToken);
        localStorage.setItem(process.env.REACT_APP_REFRESH_TOKEN, JSON.stringify(newRefreshToken));
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;    
        return response;
    } catch (error) {
        console.error('Register failed:', error);
        throw error;
    }
  }

    const value = {
        accessToken,
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!accessToken
      };
    return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      );
}

export const UserAuth = () => {
    return useContext(AuthContext);
}
