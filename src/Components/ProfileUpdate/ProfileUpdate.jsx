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
import { useAuth } from "../../App";

const ProfileUpdate = () => {
  const { user } = useAuth();
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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
      name: user.username || "",
      email: user.email || "",
      profilePicture: user.profilePicture || "",
      preferredLanguage: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      preferredLanguage: Yup.string().required(
        "Preferred language is required"
      ),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.put("http://localhost:5001/lstm/auth/update", values, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setMessage({ text: "Profile updated successfully!", type: "success" });
      } catch (error) {
        setMessage({ text: "Profile update failed.", type: "error" });
        console.error(error);
      }
      setLoading(false);
    },
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={7}
      gap={3}
      mb={8}
    >
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
            Update Profile
          </Typography>
        </Box>

        {message.text && <Alert severity={message.type}>{message.text}</Alert>}

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
              input: { color: isDarkMode ? "#ddd" : "#333" },
              bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
              borderRadius: 1,
            }}
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={formik.values.email}
            disabled
            sx={{
              bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
              borderRadius: 1,
            }}
          />

          {/* <TextField
            label="Profile Picture URL"
            variant="outlined"
            fullWidth
            {...formik.getFieldProps("profilePicture")}
            sx={{
              input: { color: isDarkMode ? "#ddd" : "#333" },
              bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
              borderRadius: 1,
            }}
          /> */}

          <FormControl fullWidth>
            <InputLabel>Preferred Language</InputLabel>
            <Select
              {...formik.getFieldProps("preferredLanguage")}
              label="Preferred Language"
              sx={{
                bgcolor: isDarkMode ? "#2E2E2E" : "#FFFFFF",
                borderRadius: 1,
              }}
              error={
                formik.touched.preferredLanguage &&
                Boolean(formik.errors.preferredLanguage)
              }
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
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: "#8A2BE2",
              ":hover": { bgcolor: "#7D19F3" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ProfileUpdate;
