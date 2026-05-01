import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const publicRoutes = ["/login", "/signup", "/register"];

      // Skip auth check for public pages
      if (publicRoutes.includes(location.pathname)) {
        setIsInitializing(false);
        return;
      }

      //   Only try refresh if token exists
      const hasToken = localStorage.getItem("accessToken");

      if (!hasToken) {
        setUser(null);
        navigate("/login");
        setIsInitializing(false);
        return;
      }

      try {
        //Try silent refresh
        const data = await authService.refresh();
        setUser(data.user);
      } catch (err) {
        //Refresh failed → logout user
        setUser(null);
        localStorage.clear();
        navigate("/login");
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [location.pathname, navigate]);

  // CLEAN LOGOUT
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Always clear everything
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isInitializing, handleLogout }}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};