import React, { FC, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { User } from "firebase/auth";
import {
  collection,
  getFirestore,
  doc,
  CollectionReference,
  DocumentSnapshot,
  DocumentReference,
  QuerySnapshot,
} from "firebase/firestore";

import { Box, CssBaseline, Toolbar, Container } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";

import Copyright from "components/Copyright";
import myApp from "firebaseApp";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import { useViewsList } from "./views/viewsList";
import { ErrorFallback } from "components/utils/errors";
import { ADMIN_USERS } from "utils/constants";
import { ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";
import {
  useDocumentSnapshot,
  useCollectionSnapshot,
} from "hooks/firebase/firestore";
const drawerWidth: number = 240;

export interface DashboardViewContext {
  user?: User;
  userConfigSnapshot?: DocumentSnapshot<ClientConfig>;
  userConfigRef?: DocumentReference<ClientConfig>;
  clientsSnapshot?: QuerySnapshot<ClientConfig>;
  clientsConfigRef?: CollectionReference<ClientConfig>;
  healthMonitorSnapshot?: DocumentSnapshot<HealthMonitorConfig>;
}

export interface DashboardProps {
  user: User | null;
}
const DashboardPage: FC<DashboardProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const viewsList = useViewsList(user);
  const db = getFirestore(myApp);
  const userConfigRef = useMemo(() => {
    if (!user) {
      return undefined;
    }
    return doc(
      collection(db, "user") as CollectionReference<ClientConfig>,
      user?.email ?? ""
    );
  }, [user, db]);
  const healthMonitorRef = useMemo(() => {
    if (!user) {
      return undefined;
    }
    return doc(
      collection(db, "admin") as CollectionReference<HealthMonitorConfig>,
      "health_monitor"
    );
  }, [user, db]);
  const clientsConfigRef = useMemo(() => {
    if (user && ADMIN_USERS.includes(user.email ?? "")) {
      return collection(db, "user") as CollectionReference<ClientConfig>;
    }
    return undefined;
  }, [user, db]);
  const userConfigSnapshot = useDocumentSnapshot(userConfigRef);
  const clientsSnapshot = useCollectionSnapshot(clientsConfigRef);
  const healthMonitorSnapshot = useDocumentSnapshot(healthMonitorRef);
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        drawerIsOpen={open}
        openDrawer={() => setOpen(true)}
        drawerWidth={drawerWidth}
        user={user}
      />
      <Drawer
        open={open}
        viewsList={viewsList}
        setOpen={setOpen}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet
              context={
                {
                  user,
                  userConfigSnapshot,
                  userConfigRef,
                  clientsSnapshot,
                  clientsConfigRef,
                  healthMonitorSnapshot,
                } as DashboardViewContext
              }
            />
          </ErrorBoundary>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
