import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "./store/authSlice";
import type { RootState } from "./store/store";
import { useNavigate } from "react-router-dom";

const INDIGO = "#4f46e5";

export default function Login() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    const res = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(res)) {
      navigate("/");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img src="./logo.png" width="120" />
        </Box>

        <Typography variant="h6" fontWeight={500} textAlign="center" mb={3}>
          Sign in to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email address"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" fontSize={13} mt={1}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              backgroundColor: "#000",
              border: "1px solid #000",
              color: "#fff",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "transparent",
                border: "1px solid #000",
                color: "#000",
              },
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <Typography textAlign="center" fontSize={13} mt={3}>
            Don’t have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/register")}
              sx={{ fontWeight: 600 }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
