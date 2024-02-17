import { Typography } from "@mui/material";
import React from "react";
import AnalysisTabsProps from "./analysisTabProps";

const ProximityTab: React.FC<AnalysisTabsProps> = (props) => {
  // Add your component logic here

  return (
    // Add your JSX code for the ProximityTab component here
    <Typography variant="h6" gutterBottom>
      Contextual Proximity Analysis
    </Typography>
  );
};

export default ProximityTab;
