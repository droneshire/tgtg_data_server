import React, { FC } from "react";
import { useMatch, useResolvedPath } from "react-router-dom";

import { styled } from "@mui/material/styles";
import {
  Drawer as MuiDrawer,
  DrawerProps as MuiDrawerProps,
  Toolbar,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { DashbardViewSpec } from "./views/viewsList";

interface StyledDrawerProps extends MuiDrawerProps {
  drawerWidth: number;
}

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<StyledDrawerProps>(({ theme, open, drawerWidth }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

export interface DrawerProps extends StyledDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  viewsList: DashbardViewSpec[];
}

interface ViewButtonProps extends Pick<DashbardViewSpec, "label" | "icon"> {
  to: string;
}
const ViewButton: FC<ViewButtonProps> = ({ to, label, icon: Icon }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  return (
    <ListItemButton selected={!!match} href={to}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

const Drawer: FC<DrawerProps> = ({ setOpen, viewsList, ...props }) => {
  return (
    <StyledDrawer variant="permanent" {...props}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        <IconButton onClick={() => setOpen(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {viewsList.map(({ key, label, icon }) => (
          <ViewButton
            key={key}
            to={`/dashboard/${key}`}
            label={label}
            icon={icon}
          />
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Drawer;
