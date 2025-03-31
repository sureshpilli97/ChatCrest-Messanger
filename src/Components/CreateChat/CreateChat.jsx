import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../App";
import { useSocket } from "../../Context/SocketContext";

const CreateChat = () => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { user } = useAuth();
  const { socket } = useSocket();

  const validationSchema = Yup.object({
    receiverEmail: Yup.string()
      .email("Invalid email format")
      .required("Receiver email is required"),
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("newChatCreated", (chat) => {
      if (chat.error) {
        setMessage({
          text: "Chat creation failed user not found.",
          type: "error",
        });
      } else {
        setMessage({
          text: "Chat created successfully!",
          type: "success",
        });
      }
    });

    return () => {
      socket.off("newChatCreated");
    };
  }, [socket]);

  const handleCreateChat = async (values, { resetForm }) => {
    setLoading(true);
    setMessage(null);

    try {
      if (!socket) throw new Error("Socket connection is not available.");

      socket.emit("createPrivateChat", {
        senderEmail: user.email,
        receiverEmail: values.receiverEmail,
      });

      resetForm();
    } catch (error) {
      setMessage({
        text: error.message || "An error occurred. Try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mt={8}
    >
      <Box
        p={4}
        borderRadius={2}
        boxShadow={3}
        sx={{
          bgcolor: isDarkMode ? "#0a1014" : "#FFFFFF",
          color: "#8A2BE2",
          display: "flex",
          gap: 2,
          flexDirection: "column",
        }}
        width={{ xs: "90%", sm: "50%", md: "30%" }}
      >
        <Typography
          variant="h5"
          textAlign="center"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          Create Private Chat
        </Typography>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Formik
          initialValues={{ receiverEmail: "" }}
          validationSchema={validationSchema}
          onSubmit={handleCreateChat}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Field
                name="receiverEmail"
                as={TextField}
                label="Receiver Email"
                variant="outlined"
                fullWidth
                error={touched.receiverEmail && Boolean(errors.receiverEmail)}
                helperText={touched.receiverEmail && errors.receiverEmail}
                sx={{
                  input: {
                    color: isDarkMode ? "#ddd" : "#333",
                  },
                  bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#A052CC" },
                    "&.Mui-focused fieldset": { borderColor: "#B015F3" },
                  },
                  "& .MuiInputLabel-root": {
                    "&:hover": { color: "#A052CC" },
                    "&.Mui-focused": { color: "#B015F3" },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                }}
                disabled={loading || isSubmitting}
              >
                {loading ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  "Create Chat"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default CreateChat;
