  import { createContext, useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import authService from "../services/authService";

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const initAuth = async () => {
        // 1. Check if an access token exists
        const hasToken = localStorage.getItem("accessToken");

        if (!hasToken) {
          setUser(null);
          setIsInitializing(false);
          return;
        }

        // 2. Try to restore the session via refresh token
        try {
          const data = await authService.refresh();
          setUser(data.user);
        } catch (err) {
          console.error("Auth initialization failed:", err);
          setUser(null);
          localStorage.clear();
          navigate("/login");
        } finally {
          setIsInitializing(false);
        }
      };

      initAuth();
    }, [navigate]); // REMOVED location.pathname so this runs ONLY once on load/refresh

    // CLEAN LOGOUT
    const handleLogout = async () => {
      try {
        await authService.logout();
      } catch (err) {
        console.error("Logout error:", err);
      }
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    };

    return (
      <AuthContext.Provider value={{ user, setUser, isInitializing, handleLogout }}>
        {children} 
      </AuthContext.Provider>
    );
  };
