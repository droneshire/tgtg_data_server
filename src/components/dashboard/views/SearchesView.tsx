import React, { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { CircularProgress, Box, Tab, Tabs } from "@mui/material";

import { TabPanel } from "components/utils/tabs";
import { DashboardViewContext } from "components/dashboard/DashboardPage";
import searchesTabsList from "./searchesTabs/searchesTabsList";

const SearchesView: FC = () => {
  const {
    user,
    userConfigSnapshot,
    userConfigRef,
    clientsSnapshot,
    clientsConfigRef,
  } = useOutletContext<DashboardViewContext>();

  const searches = userConfigSnapshot?.get("searches");
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    searchesTabsList[0].key
  );

  const selectTab = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabIndex(newValue);
  };

  if (!searches) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ width: "100%" }}>
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTabIndex} onChange={selectTab} centered>
            {searchesTabsList.map(({ key, label }) => {
              return <Tab label={label} value={key} key={key} />;
            })}
          </Tabs>
        </Box>
        {searchesTabsList.map(({ key, component: C }) => {
          return (
            <TabPanel selectedTabIndex={selectedTabIndex} index={key} key={key}>
              <C userConfigSnapshot={userConfigSnapshot!} />
            </TabPanel>
          );
        })}
      </>
    </Box>
  );
};

export default SearchesView;
