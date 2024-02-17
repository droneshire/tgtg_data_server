import React, { useState, FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";

import { DashboardViewContext } from "components/dashboard/DashboardPage";
import analysisTabsList from "./analysisTabs/analysisTabsList";
import { TabPanel } from "components/utils/tabs";
import { DataMaps } from "./analysisTabs/CsvDataUploader";
import { CsvDataRow } from "workers/csvWorker";

const AnalysisView: FC = () => {
  const { userConfigSnapshot } = useOutletContext<DashboardViewContext>();
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    analysisTabsList[0].key
  );
  const [displayChart, setDisplayChart] = useState(false);
  const [dataMaps, setDataMaps] = useState<DataMaps>({
    storeMap: new Map<string, CsvDataRow[]>(),
    dateMap: new Map<string, CsvDataRow[]>(),
  });

  const onUpload = (dataMaps: DataMaps) => {
    if (!!!dataMaps) {
      return;
    }

    setDisplayChart(true);
    setDataMaps(dataMaps);
    console.log("Uploaded data for chart");
  };

  const selectTab = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTabIndex(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTabIndex} onChange={selectTab} centered>
            {analysisTabsList.map(({ key, label }) => {
              return (
                <Tab
                  label={label}
                  value={key}
                  key={key}
                  disabled={!displayChart && key !== analysisTabsList[0].key}
                />
              );
            })}
          </Tabs>
        </Box>
        {analysisTabsList.map(({ key, component: C }) => {
          return (
            <TabPanel selectedTabIndex={selectedTabIndex} index={key} key={key}>
              <C
                userConfigSnapshot={userConfigSnapshot!}
                displayChart={displayChart}
                dataMaps={dataMaps}
                onUpload={onUpload}
              />
            </TabPanel>
          );
        })}
      </>
    </Box>
  );
};

export default AnalysisView;
