import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  AppBar,
  Toolbar,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../../App";
import { useSocket } from "../../Context/SocketContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
const ChatScreen = () => {
  const { chatId, mail } = useParams();
  const [isTranslating, setIsTranslating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { socket } = useSocket();
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width: 500px)");

  useEffect(() => {
    if (!socket) return;

    socket.emit("getPrivateChatMessages", { chatId, email: user.email });

    socket.on("privateChatMessages", async (chatMessages) => {
      setIsTranslating(true);
      const translatedMessages = await translateMessages(chatMessages);
      setMessages(translatedMessages);
      setIsTranslating(false);
    });

    socket.on("receivePrivateMessage", async (message) => {
      if (message.chatId === chatId) {
        const updatedMessage = await translateSingleMessage(message);
        setMessages((prev) => [...prev, updatedMessage]);
      }
    });

    return () => {
      socket.off("privateChatMessages");
      socket.off("receivePrivateMessage");
    };
  }, [socket, chatId, user.email]);

  const translateMessages = async (chatMessages) => {
    const translatedMessages = await Promise.all(
      chatMessages.map(async (msg) => {
        return user.email !== msg.senderEmail
          ? await translateSingleMessage(msg)
          : msg;
      })
    );
    return translatedMessages;
  };

  const translateSingleMessage = async (message) => {
    if (user.email === message.senderEmail) return message;

    try {
      const response = await axios.get("http://127.0.0.1:5000/translate", {
        params: {
          reciver_lang: user.preferredLanguage,
          message: message.messageText,
        },
      });

      return { ...message, translatedText: response.data.translated_message };
    } catch (error) {
      console.error("Translation error:", error);
      return { ...message, translatedText: "Translation failed" };
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      chatId,
      senderEmail: user.email,
      messageText: newMessage,
      updatedAt: new Date().toISOString(),
    };

    socket.emit("sendPrivateMessage", messageData);
    setNewMessage("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography
        sx={{
          fontWeight: "bold",
          background: "linear-gradient(to right, #7D19F3, #B015F3)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          pb: "1rem",
          borderBottom: "2px solid rgba(0, 0, 0, 0.4)",
        }}
        variant="h6"
      >
        {mail}
      </Typography>

      <Box
        sx={{
          my: 2,
          px: 2,
          display: "flex",
          flexDirection: "column",
          mb: 10,
          alignItems: isTranslating ? "center" : "",
          paddingTop: isTranslating ? "5rem" : "",
        }}
      >
        {isTranslating ? (
          <CircularProgress color="secondary" size={50} />
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUserMessage = msg.senderEmail === user.email;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: isUserMessage ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      minHeight: "2rem",
                      minWidth: isMobile ? "30%" : "20%",
                      maxWidth: "60%",
                      padding: "1rem",
                      borderRadius: "12px",
                      color: isUserMessage
                        ? "#fff"
                        : isDarkMode
                        ? "#ddd"
                        : "#333",
                      background: isUserMessage
                        ? "linear-gradient(to right, #7D19F3, #B015F3)"
                        : isDarkMode
                        ? "#2a2d31"
                        : "#f1f1f1",
                      textAlign: "left",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                    }}
                  >
                    <Typography sx={{ fontSize: "14px" }}>
                      {msg.messageText}
                    </Typography>
                    {msg.translatedText && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontStyle: "italic",
                          color: "gray",
                        }}
                      >
                        Translated: {msg.translatedText}
                      </Typography>
                    )}
                    {/* Timestamp */}
                    <Typography
                      sx={{
                        fontSize: "10px",
                        position: "absolute",
                        bottom: "2px",
                        right: "8px",
                      }}
                    >
                      {msg.updatedAt
                        ? dayjs(msg.updatedAt).format("HH:mm A")
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </>
        )}
      </Box>

      <AppBar
        position="fixed"
        sx={{
          top: "auto",
          bottom: 0,
          backgroundColor: isDarkMode ? "#1c1f20" : "#f5f5f5",
        }}
      >
        <Toolbar
          sx={{
            padding: "1rem",
            pb: 4,
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            sx={{
              input: {
                color: isDarkMode ? "#ddd" : "#333",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "20rem",
                "& fieldset": { borderColor: "#A052CC" },
                "&:hover fieldset": { borderColor: "#A052CC" },
                "&.Mui-focused fieldset": { borderColor: "#B015F3" },
              },
              "& .MuiInputBase-input::placeholder": {
                color: isDarkMode ? "#bbb" : "#666",
              },
            }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!newMessage.trim()}
            onClick={sendMessage}
            sx={{
              ml: 1,
              borderRadius: "500%",
              width: "4rem",
              height: "3rem",
              background: "linear-gradient(to right, #7D19F3, #B015F3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SendIcon sx={{ color: "white" }} />
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default ChatScreen;
