import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Optimistic evaluation: Read from localStorage immediately during initial rendering
    const cachedUser = localStorage.getItem("user");
    try {
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  
  // Circuit Breaker: Guarantees startup authorization logic fires exactly once per tab instance
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      setIsInitializing(false);
      return;
    }

    const initAuth = async () => {
      const hasToken = localStorage.getItem("accessToken");

      // No token present on cold boot -> break out immediately, session is unauthenticated
      if (!hasToken) {
        setUser(null);
        localStorage.clear();
        setIsInitializing(false);
        isMounted.current = true;
        return;
      }

      try {
        console.log("Validating active session state with backend...");
        const data = await authService.refresh();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session sync validation failed:", err);
        setUser(null);
        localStorage.clear();
        navigate("/login");
      } finally {
        setIsInitializing(false);
        isMounted.current = true;
      }
    };

    initAuth();
  }, [navigate]);

  // Clean Session Invalidation Pipeline
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Remote session drop failure:", err);
    } finally {
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isInitializing, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};