import React, { FC } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  AuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  Avatar,
  Box,
  Chip,
  ChipProps,
  Container,
  CssBaseline,
  Stack,
  Typography,
} from "@mui/material";
import Copyright from "components/Copyright";
import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  useAuthStateWatcher,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
} from "hooks/firebase/auth";
import EmailLoginModal from "./login/EmailLogin";

interface LoginButtonProps extends ChipProps {
  clickHandler: () => void;
}
const LoginButton: FC<LoginButtonProps> = ({ clickHandler, ...props }) => (
  <Chip onClick={clickHandler} {...props} />
);

const signIn = async (providerFactory: () => AuthProvider) => {
  await signInWithPopup(getAuth(), providerFactory());
};
const LoginPage: React.FC = () => {
  const [openModal, setOpenModal] = React.useState(false);
  const location = useLocation();
  const user = useAuthStateWatcher();

  if (user) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <LoginButton
              clickHandler={() => signIn(() => new GoogleAuthProvider())}
              icon={<GoogleIcon />}
              label="Google"
            />
            <LoginButton
              clickHandler={() => setOpenModal(true)}
              icon={<EmailIcon />}
              label="Email"
            />
          </Stack>
        </Box>
        <EmailLoginModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onLogin={(email, password) =>
            logInWithEmailAndPassword({ email: email, password: password })
          }
          onRegister={(email, password) =>
            registerWithEmailAndPassword({
              email: email,
              password: password,
            })
          }
        />
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
};

export default LoginPage;
