import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../App";
import { useSocket } from "../../Context/SocketContext";

const GroupChats = () => {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit("getGroupChatParticipants", { userEmail: user.email });

    const sortChats = (chats) =>
      [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const handleGroupChatParticipants = (chatList) => {
      setGroupChats(sortChats(chatList.groupChats));
      setLoading(false);
    };

    const handleReceiveMessage = (data) => {
      setGroupChats((prevChats) => {
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

    const handleNewGroupChatCreated = (newChat) => {
      setGroupChats((prevChats) => {
        const chatExists = prevChats.some((chat) => chat.id === newChat.id);
        const updatedChats = chatExists ? prevChats : [...prevChats, newChat];

        return sortChats(updatedChats);
      });
    };

    socket.on("groupChatParticipants", handleGroupChatParticipants);
    socket.on("receiveGroupMessage", handleReceiveMessage);
    socket.on("groupChatCreated", handleNewGroupChatCreated);

    return () => {
      socket.off("groupChatParticipants", handleGroupChatParticipants);
      socket.off("receiveGroupMessage", handleReceiveMessage);
      socket.off("groupChatCreated", handleNewGroupChatCreated);
    };
  }, [socket, user.email]);

  return (
    <Box sx={{ mb: 10 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Group Chats
      </Typography>

      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress color="inherit" size={24} />
          </Box>
        ) : groupChats.length === 0 ? (
          <Typography
            variant="h5"
            sx={{
              background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
            textAlign="center"
            fontWeight="bold"
            mt={5}
          >
            No Group Chats Available
          </Typography>
        ) : (
          groupChats.map((chat) => (
            <Button
              key={chat.id}
              component={Link}
              to={`/groups/${chat.id}/${chat.groupName}`}
              variant="outlined"
              fullWidth
              sx={{ margin: "8px 0" }}
            >
              {chat.groupName}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  ml: "auto",
                }}
              >
                {/* {chat.unreadCount > 0 && (
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
                )} */}
              </Box>
            </Button>
          ))
        )}
      </Box>
    </Box>
  );
};

export default GroupChats;
