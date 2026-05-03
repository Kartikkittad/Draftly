import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "./store/authSlice";
import type { RootState } from "./store/store";
import { useNavigate } from "react-router-dom";

const INDIGO = "#4f46e5";

export default function Register() {
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

    const res = await dispatch(registerUser({ email, password }));
    if (registerUser.fulfilled.match(res)) {
      navigate("/login");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img
            src="/logo.svg"
            width="220"
            alt="Draftly logo"
            style={{
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              marginLeft: "15%",
            }}
          />
        </Box>

        <Typography variant="h6" fontWeight={500} textAlign="center" mb={3}>
          Create your account
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
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: "inherit", mr: 1 }} />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          <Typography textAlign="center" fontSize={13} mt={3}>
            Already have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/login")}
              sx={{ fontWeight: 600 }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
