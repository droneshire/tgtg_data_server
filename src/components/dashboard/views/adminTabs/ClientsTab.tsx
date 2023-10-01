import React, { FC } from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference,
} from "firebase/firestore";
import {
  CircularProgress,
  Box,
  Typography,
  Chip,
  Fab,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Button,
  Menu,
  Tooltip,
  ListItemIcon,
  MenuItem,
  ListItemText,
  Paper,
  Alert,
  Snackbar,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { DEFAULT_USER_CONFIG, ClientAction, ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";
import { isValidEmail } from "utils/validators";

interface ClientActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

interface ClientSpec {
  userId: string;
}

type ClientProps = ClientSpec & {
  actionButtons: ClientActionOption[];
};
const Client: FC<ClientProps> = ({ userId, actionButtons }) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`Client ${userId}`}>
          <Chip icon={<PersonIcon />} label={userId} variant="outlined" />
        </Tooltip>
      </TableCell>
      <TableCell sx={{ textAlign: "right" }}>
        <Button onClick={handleActionMenuClick}>Actions</Button>
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
        >
          {actionButtons.map(({ doAction, ActionIcon, title }, index) => (
            <MenuItem key={index} onClick={doAction}>
              {ActionIcon && (
                <ListItemIcon>
                  <ActionIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText>{title}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </TableCell>
    </TableRow>
  );
};

interface ClientGroupActionButton {
  doAction: (userId: string) => void;
  ActionIcon: React.ElementType;
  title: (userId: string) => string;
}

const ClientActivityGroup: FC<{
  users: ClientSpec[];
  actionButtons: ClientGroupActionButton[];
}> = ({ users, actionButtons }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {users.map((props) => (
            <Client
              key={props.userId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.userId),
                  title: title(props.userId),
                  ActionIcon: ActionIcon,
                })
              )}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  createClient: (user: ClientSpec) => Promise<void> | void;
  existinguserIds: ClientSpec[];
}
const NewClientModal: FC<ClientModalProps> = ({
  open,
  onClose,
  createClient,
  existinguserIds,
}) => {
  const modalRef = React.useRef<HTMLElement>(null);
  const [userId, setuserId] = React.useState("");
  const {
    runAction: doCreateClient,
    running: creatingClient,
    error,
    clearError,
  } = useAsyncAction(createClient);

  // need to check if the userId is in the existinguserIds which is a list of ClientSpec
  // and if the userId is a valid email

  const validuserId =
    userId &&
    !existinguserIds.some((userSpec) => userId === userSpec.userId) &&
    isValidEmail(userId);
  const disabled = creatingClient || !validuserId;

  const reset = React.useCallback(() => {
    setuserId("");
  }, [setuserId]);

  const doSubmit = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    const success = await doCreateClient({
      userId,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateClient, userId, disabled]);

  const keyHander = React.useCallback(
    ({ key }: KeyboardEvent) => {
      switch (key) {
        case "Enter":
          doSubmit();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    },
    [doSubmit, onClose]
  );
  useKeyPress(["Enter", "Escape"], keyHander);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          ref={modalRef}
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h2" textAlign="center">
            New Client
          </Typography>
          <TextField
            label="Client Email"
            variant="standard"
            value={userId}
            onChange={(e) => setuserId(e.target.value.toLowerCase())}
            error={!validuserId}
            inputProps={{ inputMode: "email" }}
          />
          <Box textAlign="center">
            {creatingClient ? (
              <CircularProgress />
            ) : (
              <Tooltip title="Add user">
                <span>
                  <Fab
                    color="primary"
                    variant="extended"
                    disabled={disabled}
                    onClick={doSubmit}
                  >
                    <AddIcon />
                    Add
                  </Fab>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Modal>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to create user: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
};

const ClientsTab: FC<{
  clientsSnapshot: QuerySnapshot<ClientConfig>;
  clientsConfigRef: CollectionReference<ClientConfig>;
  healthMonitorSnapshot: DocumentSnapshot<HealthMonitorConfig>;
}> = ({ clientsSnapshot, clientsConfigRef }) => {
  const clients = clientsSnapshot?.docs;
  const [modalOpen, setModalOpen] = React.useState(false);
  const [actionClientId, setActionClientId] = React.useState("");
  const [clientAction, setClientAction] = React.useState<ClientAction>(
    ClientAction.NONE
  );

  if (!clients) {
    return <CircularProgress />;
  }

  const existinguserIds: ClientSpec[] = React.useMemo(
    () =>
      (clients || {}).map((client) => ({
        userId: client.id,
      })),
    [clients]
  );
  React.useEffect(() => {
    if (actionClientId) {
      if (clientAction === ClientAction.DELETE) {
        deleteDoc(doc(clientsConfigRef, actionClientId));
      } else if (clientAction === ClientAction.ADD) {
        const default_new_user: ClientConfig = { ...DEFAULT_USER_CONFIG };
        default_new_user.preferences.notifications.email.email = actionClientId;
        setDoc(doc(clientsConfigRef, actionClientId), default_new_user);
      }
    }
  }, [clientAction, actionClientId, clientsConfigRef]);

  return (
    <>
      <Box alignItems="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <PersonIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Clients
          </Typography>
        </Box>
        <ClientActivityGroup
          users={existinguserIds}
          actionButtons={[
            {
              doAction: (userId: string) => {
                setActionClientId(userId);
                setClientAction(ClientAction.DELETE);
              },
              title: (userId: string) => `Delete user ${userId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
      </Box>
      <Box textAlign="right" sx={{ marginTop: 2 }}>
        <Tooltip title="Add user">
          <Fab color="primary" onClick={() => setModalOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <NewClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existinguserIds={existinguserIds}
        createClient={(ClientProps) => {
          const { userId } = ClientProps;
          setActionClientId(userId);
          setClientAction(ClientAction.ADD);
        }}
      />
    </>
  );
};

export default ClientsTab;
