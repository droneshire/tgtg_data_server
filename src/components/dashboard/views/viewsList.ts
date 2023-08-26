import React, { useMemo } from "react";

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from "@mui/icons-material/Settings";
import { SvgIconComponent } from "@mui/icons-material";

import AdminView from "./AdminView";
import PreferencesView from "./PreferencesView";
import SearchesView from "./SearchesView";
import { User } from "firebase/auth";
import { ADMIN_USERS } from "utils/constants";

export interface DashbardViewSpec {
  key: string;
  label: string;
  icon: SvgIconComponent;
  component: React.ComponentType;
  adminOnly?: boolean;
}

const viewsList: DashbardViewSpec[] = [
  {
    key: "searches",
    label: "Searches",
    icon: MapIcon,
    component: SearchesView,
    adminOnly: false,
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: SettingsIcon,
    component: PreferencesView,
    adminOnly: false,
  },
  {
    key: "admin",
    label: "Admin",
    icon: AdminPanelSettingsIcon,
    component: AdminView,
    adminOnly: true,
  },
];

export const useViewsList = (user: User | null | undefined) => {
  return useMemo(() => {
    if (user && ADMIN_USERS.includes(user.email ?? "")) {
      return viewsList;
    }
    return viewsList.filter((view) => !view.adminOnly);
  }, [user]);
};
