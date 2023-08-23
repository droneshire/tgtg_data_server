import React, { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { CircularProgress, Box, Tab, Tabs } from "@mui/material";

import { TabPanel } from "components/utils/tabs";
import { DashboardViewContext } from "components/dashboard/DashboardPage";
import adminTabsList from "./adminTabs/adminTabsList";

const AdminView: FC = () => {
  const {
    userConfigSnapshot,
    clientsSnapshot,
    clientsConfigRef,
    healthMonitorSnapshot,
  } = useOutletContext<DashboardViewContext>();

  const preferences = userConfigSnapshot?.get("preferences");
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    adminTabsList[0].key
  );

  const selectTab = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabIndex(newValue);
  };

  // Admin must have preferences set as a minimal requirement
  if (!preferences) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ width: "100%" }}>
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTabIndex} onChange={selectTab} centered>
            {adminTabsList.map(({ key, label }) => {
              return <Tab label={label} value={key} key={key} />;
            })}
          </Tabs>
        </Box>
        {adminTabsList.map(({ key, component: C }) => {
          return (
            <TabPanel selectedTabIndex={selectedTabIndex} index={key} key={key}>
              <C
                clientsSnapshot={clientsSnapshot!}
                clientsConfigRef={clientsConfigRef!}
                healthMonitorSnapshot={healthMonitorSnapshot!}
              />
            </TabPanel>
          );
        })}
      </>
    </Box>
  );
};

export default AdminView;
