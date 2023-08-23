import React, { FC } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Chip,
  ChipProps,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import Copyright from "components/Copyright";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { sendPasswordReset } from "hooks/firebase/auth";

interface LoginButtonProps extends ChipProps {
  clickHandler: () => void;
}
const ResetPasswordButton: FC<LoginButtonProps> = ({
  clickHandler,
  ...props
}) => <Chip onClick={clickHandler} {...props} />;

const ForgotPassword: React.FC = () => {
  const [resetEmail, setResetEmail] = React.useState("");
  const [didResetPassword, setDidResetPassword] = React.useState(false);
  const location = useLocation();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(event.target.value);
  };

  const handleResetPassword = () => {
    sendPasswordReset(resetEmail);
    setTimeout(() => {
      setDidResetPassword(true);
    }, 2000);
  };

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
          Unlock Account
        </Typography>
        <Box sx={{ mt: 3 }}>
          <TextField
            sx={{ marginBottom: 2 }}
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={resetEmail}
            onChange={handleEmailChange}
          />
        </Box>
        <Box sx={{ alignSelf: "center" }}>
          <ResetPasswordButton
            clickHandler={handleResetPassword}
            icon={<LockOpenIcon />}
            label="Reset Password"
            sx={{ marginBottom: 2, alignSelf: "center" }}
          />
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
      {didResetPassword && (
        <Navigate to={(location.state as any)?.from?.pathname || "/"} replace />
      )}
    </Container>
  );
};

export default ForgotPassword;
