import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Logo from "../../assets/ChatCrest.svg";
import { Link } from "react-router-dom";
import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../../config/firebase";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();

  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/languages");
        setLanguages(response.data.languages);
      } catch (error) {
        setMessage({ text: "Failed to fetch languages.", type: "error" });
        console.error(error);
      }
    };
    fetchLanguages();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      preferredLanguage: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      phoneNumber: Yup.string()
        .matches(/^[0-9]+$/, "Phone number must be numeric")
        .min(10, "Must be at least 10 digits")
        .required("Phone number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      preferredLanguage: Yup.string().required("Select a language"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        const otpResponse = await axios.post(
          "http://localhost:5001/lstm/auth/send-otp",
          {
            email: values.email,
            username: values.name,
          }
        );

        if (otpResponse.status === 200) {
          setOtpSent(true);
          setMessage({
            text: "OTP has been sent to your email.",
            type: "success",
          });
        }
      } catch (error) {
        setMessage({ text: "Failed to send OTP.", type: "error" });
        console.log(error);
      }
      setLoading(false);
      setSubmitting(false);
    },
  });

  const handleOtpVerification = async () => {
    if (otp === "") {
      setOtpError("Please enter the OTP.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formik.values.email,
        formik.values.password
      );
      const user = userCredential.user;
      const otpVerifyResponse = await axios.post(
        "http://localhost:5001/lstm/auth/register",
        {
          id: user.uid,
          email: formik.values.email,
          preferredLanguage: formik.values.preferredLanguage,
          otp: otp,
          username: formik.values.name,
        }
      );

      await updateProfile(user, { displayName: formik.values.name });

      if (otpVerifyResponse.status === 201) {
        setMessage({
          text: "User created successfully. You can now login.",
          type: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      setOtpError("Invalid OTP or OTP expired.");
      console.error(error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={7}
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
          bgcolor: isDarkMode ? "#0a1014" : "#FFFFFF",
          color: "#8A2BE2",
          border: isDarkMode ? "1px solid #444" : "none",
        }}
      >
        <Box display="flex" justifyContent="center" mb={1}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              background:
                "linear-gradient(to right, #5A2FAE, #8A2BE2, #7D19F3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create User
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

        <form
          onSubmit={formik.handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            {...formik.getFieldProps("name")}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
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

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            {...formik.getFieldProps("email")}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
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

          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            {...formik.getFieldProps("phoneNumber")}
            error={
              formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
            }
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
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

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            {...formik.getFieldProps("password")}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
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

          <FormControl
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#A052CC" },
                "&.Mui-focused fieldset": { borderColor: "#B015F3" },
              },
              "& .MuiInputLabel-root": {
                "&:hover": { color: "#A052CC" },
                "&.Mui-focused": { color: "#B015F3" },
              },
            }}
            required
            error={
              formik.touched.preferredLanguage &&
              Boolean(formik.errors.preferredLanguage)
            }
          >
            <InputLabel>Preferred Language</InputLabel>
            <Select
              {...formik.getFieldProps("preferredLanguage")}
              label="Preferred Language"
              sx={{
                input: {
                  color: isDarkMode ? "#ddd" : "#333",
                },
                bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
                borderRadius: 1,
              }}
            >
              {languages.map((language, index) => (
                <MenuItem key={index} value={language.code}>
                  {language.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {formik.touched.preferredLanguage &&
                formik.errors.preferredLanguage}
            </Typography>
          </FormControl>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading || formik.isSubmitting}
            sx={{
              background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>

        {otpSent && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <TextField
              label="Enter OTP"
              variant="outlined"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={Boolean(otpError)}
              helperText={otpError}
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
              variant="contained"
              onClick={handleOtpVerification}
              fullWidth
              sx={{
                background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                mt: 1,
              }}
            >
              Verify OTP
            </Button>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Typography
            variant="body2"
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
              }}
            >
              Log In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateUser;
