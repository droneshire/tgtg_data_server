import { Typography } from "@mui/material";
import React from "react";
import AnalysisTabsProps from "./analysisTabProps";
import ProximitySearchCoverage from "./components/ProximitySearchCoverage";

const ProximityTab: React.FC<AnalysisTabsProps> = (props) => {
  const dataMaps = props.dataMaps;
  const displayChart = props.displayChart;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Contextual Proximity Analysis
      </Typography>
      {displayChart && (
        <>
          <ProximitySearchCoverage
            dataMaps={dataMaps}
          ></ProximitySearchCoverage>
        </>
      )}
    </>
  );
};

export default ProximityTab;
