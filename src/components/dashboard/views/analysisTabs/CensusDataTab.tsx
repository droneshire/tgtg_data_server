import { FC } from "react";
import { Typography, Divider } from "@mui/material";

import AnalysisTabsProps from "./analysisTabProps";

const CensusDataTab: FC<AnalysisTabsProps> = (props) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Census Data
      </Typography>
      <Typography variant="body1" gutterBottom>
        This tab will contain the census data analysis.
      </Typography>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default CensusDataTab;
