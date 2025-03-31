import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";
import ChatIcon from "@mui/icons-material/Chat";
import GroupIcon from "@mui/icons-material/Group";
import MoreIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Button,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useAuth } from "../../App";

const StyledFab = styled(Fab)({
  position: "absolute",
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: "0 auto",
});

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { handleLogout } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    document.activeElement?.blur();
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    document.activeElement?.blur();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    document.activeElement?.blur();
  };

  const handleNavigate = (path) => {
    handleCloseModal();
    navigate(path);
  };

  const showBar = [
    "/chats",
    "/groups",
    "/create-chat",
    "/create-group",
  ].includes(location.pathname);

  return (
    <>
      {showBar && (
        <AppBar
          position="static"
          sx={{
            background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ChatCrest U!
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
            <Menu
              sx={{
                "& .MuiMenu-paper": {
                  background: isDarkMode ? "#0a1014" : "#FFFFFF",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                  minWidth: "200px",
                },
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/profile");
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/about");
                }}
              >
                About Us
              </MenuItem>
              <Box sx={{ px: 2, py: 1, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Menu>
          </Toolbar>
        </AppBar>
      )}

      <Paper
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          padding: 3,
          marginBottom: 1,
        }}
      >
        <Outlet />
      </Paper>

      {showBar && (
        <AppBar
          position="fixed"
          sx={{
            top: "auto",
            bottom: 0,
            background: "linear-gradient(to right, #5A2FAE, #7D19F3)",
          }}
        >
          <Toolbar>
            <IconButton color="inherit" onClick={() => navigate("/chats")}>
              <ChatIcon />
            </IconButton>
            <StyledFab
              sx={{
                background: "linear-gradient(to right, #7D19F3, #B015F3)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(to right, #7D19F3, #5A2FAE)",
                },
              }}
              aria-label="add"
              onClick={handleOpenModal}
            >
              <AddIcon />
            </StyledFab>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="inherit" onClick={() => navigate("/groups")}>
              <GroupIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Select Chat Type</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => handleNavigate("/create-chat")}
            variant="contained"
          >
            Create Private Chat
          </Button>
          <Button
            onClick={() => handleNavigate("/create-group")}
            variant="contained"
            color="secondary"
          >
            Create Group Chat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
