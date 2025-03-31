import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../../config/firebase";
import Logo from "../../assets/ChatCrest.svg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../App";

const LogIn = () => {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loader, setLoader] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const validationSchema = Yup.object({
    username: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (values) => {
    setLoader(true);
    setMessage({ text: "", type: "" });

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.username,
        values.password
      );

      const user = userCredential.user;
      if (!user) {
        setMessage({
          text: "User not found.",
          type: "error",
        });
        setLoader(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5001/lstm/auth/login",
        {
          email: values.username,
        }
      );

      setUser(response.data.user);
      console.log("Fetched User:", response.data.user);
      setMessage({ text: "Login successful!", type: "success" });

      setTimeout(() => navigate("/chats"), 1000);
    } catch (error) {
      setMessage({
        text: error.message || "Login failed. Try again.",
        type: "error",
      });
      console.error("Login Error:", error);
    }

    setLoader(false);
  };

  const handleForgotPassword = async (username) => {
    if (!username) {
      console.log("Please enter your email first.");
      setMessage({ text: "Please enter your email first.", type: "warning" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, username);
      setMessage({
        text: "Password reset email sent successfully!",
        type: "success",
      });
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={8}
      gap={3}
    >
      <Box display="flex" justifyContent="center">
        <img
          src={Logo}
          alt="ChatCrest U!"
          style={{
            width: isMobile ? "13rem" : "18rem",
            height: isMobile ? "5rem" : "8rem",
          }}
        />
      </Box>

      <Box
        width={{ xs: "90%", sm: "50%", md: "30%" }}
        display="flex"
        flexDirection="column"
        gap={2}
        p={4}
        borderRadius={2}
        boxShadow={3}
        sx={{
          bgcolor: isDarkMode ? " #0a1014" : "#FFFFFF",
          color: "#8A2BE2",
        }}
      >
        <Box display="flex" justifyContent="center" mb={1}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Log In
          </Typography>
        </Box>

        {message.text && (
          <Alert
            severity={message.type}
            sx={{
              mb: 2,
              fontSize: isMobile ? "0.7rem" : "1rem",
            }}
          >
            {message.text}
          </Alert>
        )}

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Field
                name="username"
                as={TextField}
                label="Email"
                variant="outlined"
                fullWidth
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
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

              <Field
                name="password"
                type="password"
                as={TextField}
                label="Password"
                variant="outlined"
                fullWidth
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
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

              <Box display="flex" justifyContent="flex-end" mb={1}>
                <Button
                  sx={{
                    background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleForgotPassword(values.username);
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                }}
                disabled={loader || isSubmitting}
              >
                {loader ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  "Log In"
                )}
              </Button>
            </Form>
          )}
        </Formik>

        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Typography
            variant="body2"
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          >
            {"Don't have an account? "}
            <Link
              to="/signup"
              sx={{
                background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LogIn;
