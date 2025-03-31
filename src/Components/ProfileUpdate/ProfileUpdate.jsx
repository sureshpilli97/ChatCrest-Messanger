import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

const ProfileUpdate = () => {
    const [user, setUser] = useState({ name: "", email: "", profilePicture: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch the user's current data from the backend
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get("http://localhost:5000/lstm/auth/userProfile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.put(
                "http://localhost:5000/lstm/auth/updateProfile",
                user,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    },
                }
            );
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Profile update failed.");
        }
        setLoading(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Update Profile
            </Typography>
            <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={user.email}
                disabled
                sx={{ marginTop: "1rem" }}
            />
            <TextField
                label="Profile Picture URL"
                variant="outlined"
                fullWidth
                value={user.profilePicture}
                onChange={(e) => setUser({ ...user, profilePicture: e.target.value })}
                sx={{ marginTop: "1rem" }}
            />
            <Button variant="contained" onClick={handleUpdateProfile} sx={{ marginTop: "1rem" }} disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
            </Button>
        </Box>
    );
};

export default ProfileUpdate;
