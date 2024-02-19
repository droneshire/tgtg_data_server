import { Typography } from "@mui/material";
import React from "react";
import AnalysisTabsProps from "./analysisTabProps";
import ResearchCoverage from "./components/ResearchCoverage";

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
          <ResearchCoverage dataMaps={dataMaps}></ResearchCoverage>
        </>
      )}
    </>
  );
};

export default ProximityTab;
