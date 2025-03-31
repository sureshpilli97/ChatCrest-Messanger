import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Add, Remove } from "@mui/icons-material";
import { useAuth } from "../../App";
import { useSocket } from "../../Context/SocketContext";

const CreateGroupChat = () => {
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { user } = useAuth();
  const { socket } = useSocket();

  const validationSchema = Yup.object({
    groupName: Yup.string().required("Group name is required"),
    members: Yup.array()
      .of(
        Yup.string().email("Invalid email format").required("Email is required")
      )
      .min(1, "At least one member is required"),
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("groupChatCreated", (response) => {
      console.log("Group chat created response:", response);
      if (response.error) {
        setMessage({ text: response.error, type: "error" });
      } else {
        setMessage({
          text: "Group chat created successfully!",
          type: "success",
        });
      }
    });

    return () => {
      socket.off("groupChatCreated");
    };
  }, [socket]);

  const handleCreateGroupChat = async (values, { resetForm }) => {
    setLoading(true);
    setMessage(null);

    try {
      if (!socket) throw new Error("Socket connection is not available.");

      socket.emit("createGroupChat", {
        groupName: values.groupName,
        adminEmail: user.email,
        users: values.members,
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
      mt={7}
      mb={10}
    >
      <Box
        p={3}
        borderRadius={2}
        boxShadow={3}
        sx={{
          bgcolor: isDarkMode ? "#0a1014" : "#FFFFFF",
          color: "#8A2BE2",
          display: "flex",
          gap: 2,
          flexDirection: "column",
        }}
        width={{ xs: "100%", sm: "50%", md: "30%" }}
      >
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
        >
          Create Group Chat
        </Typography>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Formik
          initialValues={{ groupName: "", members: [""] }}
          validationSchema={validationSchema}
          onSubmit={handleCreateGroupChat}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Field
                name="groupName"
                as={TextField}
                label="Group Name"
                variant="outlined"
                fullWidth
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
                error={touched.groupName && Boolean(errors.groupName)}
                helperText={touched.groupName && errors.groupName}
              />

              <FieldArray name="members">
                {({ push, remove }) => (
                  <>
                    {values.members.map((_, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Field
                          name={`members.${index}`}
                          as={TextField}
                          label="Member Email"
                          variant="outlined"
                          fullWidth
                          sx={{
                            input: {
                              color: isDarkMode ? "#ddd" : "#333",
                            },
                            bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
                            borderRadius: 1,
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": { borderColor: "#A052CC" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#B015F3",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              "&:hover": { color: "#A052CC" },
                              "&.Mui-focused": { color: "#B015F3" },
                            },
                          }}
                          error={
                            touched.members?.[index] &&
                            Boolean(errors.members?.[index])
                          }
                          helperText={
                            touched.members?.[index] && errors.members?.[index]
                          }
                        />
                        <IconButton
                          onClick={() => remove(index)}
                          disabled={values.members.length === 1}
                        >
                          <Remove
                            sx={{ color: isDarkMode ? "white" : "black" }}
                          />
                        </IconButton>
                        <IconButton onClick={() => push("")}>
                          {" "}
                          <Add
                            sx={{ color: isDarkMode ? "white" : "black" }}
                          />{" "}
                        </IconButton>
                      </Box>
                    ))}
                  </>
                )}
              </FieldArray>

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
                  "Create Group"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default CreateGroupChat;
