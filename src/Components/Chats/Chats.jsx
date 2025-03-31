import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../App";
import { useSocket } from "../../Context/SocketContext";

const Chats = () => {
  const [privateChats, setPrivateChats] = useState([]);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [statusMessage, setStatusMessage] = useState("");
  // const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    if (!socket) return;

    socket.emit("getChatParticipants", { userEmail: user.email });

    const sortChats = (chats) =>
      [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const handleChatParticipants = (chatList) => {
      // console.log("Chat participants received:", chatList.privateChats);
      setPrivateChats(sortChats(chatList.privateChats));
    };

    const handleReceiveMessage = (data) => {
      console.log("New message received for chatId:", data);
      setPrivateChats((prevChats) => {
        return sortChats(
          prevChats.map((chat) =>
            chat.id === data.chatId
              ? {
                  ...chat,
                  updatedAt: data.updatedAt,
                  unreadCount: chat.unreadCount + 1,
                }
              : chat
          )
        );
      });
    };

    const handleNewChatCreated = (newChat) => {
      setPrivateChats((prevChats) => {
        const chatExists = prevChats.some((chat) => chat.id === newChat.id);
        const updatedChats = chatExists ? prevChats : [...prevChats, newChat];

        return sortChats(updatedChats);
      });
    };

    const handleUserStatusUpdate = (data) => {
      setPrivateChats((prevChats) =>
        prevChats.map((chat) =>
          chat.receiverEmail === data.email
            ? { ...chat, isOnline: data.isOnline }
            : chat
        )
      );
    };

    socket.on("chatParticipants", handleChatParticipants);
    socket.on("receivePrivateMessage", handleReceiveMessage);
    socket.on("newChatCreated", handleNewChatCreated);
    socket.on("userStatusUpdate", handleUserStatusUpdate);

    return () => {
      socket.off("chatParticipants", handleChatParticipants);
      socket.off("receivePrivateMessage", handleReceiveMessage);
      socket.off("newChatCreated", handleNewChatCreated);
      socket.off("userStatusUpdate", handleUserStatusUpdate);
    };
  }, [socket, user.email]);

  useEffect(() => {
    if (isConnected) {
      setStatusMessage("You are online");
    } else {
      setStatusMessage("You are offline");
    }

    const timer = setTimeout(() => {
      setStatusMessage("");
    }, 20000);

    return () => clearTimeout(timer);
  }, [isConnected]);

  return (
    <Box sx={{ position: "relative", mb: 10 }}>
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              border: "1px solid #7D19F3",
              color: "#7D19F3",
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "14px" }}>
              {isConnected ? "🟢 You are Online" : "🔴 You are Offline"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <Typography
        // color={isDarkMode ? "#000000" : "black"}
        variant="h5"
        fontWeight="bold"
        gutterBottom
      >
        Chats
      </Typography>

      <Box sx={{ mt: 3 }}>
        {privateChats.length === 0 ? (
          <Typography
            variant="h5"
            sx={{
              background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              mt: 5,
            }}
            textAlign="center"
            fontWeight="bold"
          >
            No Chats Available
          </Typography>
        ) : (
          privateChats.map((chat) => (
            <Button
              key={chat.id}
              component={Link}
              to={`/chats/${chat.id}/${chat.receiverEmail}`}
              variant="outlined"
              fullWidth
              sx={{ margin: "8px 0" }}
            >
              {chat.receiverEmail}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  ml: "auto",
                }}
              >
                {chat.unreadCount > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "secondary.main",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {chat.unreadCount}
                  </Box>
                )}
                <Box
                  sx={{
                    ml: "auto",
                    borderRadius: "50%",
                    width: 10,
                    height: 10,
                  }}
                  bgcolor={chat.isOnline ? "success.main" : "error.main"}
                ></Box>
              </Box>
            </Button>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Chats;
