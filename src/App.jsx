import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, signOut } from "./config/firebase";
import axios from "axios";
import CreateUser from "./Components/CreateUser/CreateUser";
import LogIn from "./Components/LogIn/LogIn";
import Dashboard from "./Components/Dashboard/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import CreateChat from "./Components/CreateChat/CreateChat";
import { SocketProvider } from "./Context/SocketContext";
import ChatScreen from "./Components/ChatScreen/ChatScreen";
import Chats from "./Components/Chats/Chats";
import CreateGroupChat from "./Components/CreateGroupChat/CreateGroupChat";
import GroupChats from "./Components/GroupChats/GroupChats";
import GroupChatScreen from "./Components/GroupChatScreen/GroupChatScreen";
import ProfileUpdate from "./Components/ProfileUpdate/ProfileUpdate";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    setUser(null);
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await axios.post(
            "http://localhost:5001/lstm/auth/login",
            {
              id: firebaseUser.uid,
              email: firebaseUser.email,
            }
          );

          console.log("Fetched User:", response.data);

          if (response.data?.user) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error("Auth Error:", error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="secondary" size={50} />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout, loading }}>
      <SocketProvider>
        {" "}
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                user ? <Navigate to="/chats" /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/chats" /> : <LogIn />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/chats" /> : <CreateUser />}
            />
            <Route
              path="*"
              element={<ProtectedRoute element={<div>404 Not Found</div>} />}
            />
            <Route path="/" element={<Dashboard />}>
              <Route
                path="chats"
                element={<ProtectedRoute element={<Chats />} />}
              />
              <Route
                path="groups"
                element={<ProtectedRoute element={<GroupChats />} />}
              />
              <Route
                path="create-chat"
                element={<ProtectedRoute element={<CreateChat />} />}
              />
              <Route
                path="create-group"
                element={<ProtectedRoute element={<CreateGroupChat />} />}
              />
              <Route
                path="chats/:chatId/:mail"
                element={<ProtectedRoute element={<ChatScreen />} />}
              />
              <Route
                path="groups/:chatId/:groupName"
                element={<ProtectedRoute element={<GroupChatScreen />} />}
              />
              <Route
                path="update-profile/"
                element={<ProtectedRoute element={<ProfileUpdate />} />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthContext.Provider>
  );
}

export default App;
