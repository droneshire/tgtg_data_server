import { FC } from "react";
import { Typography, Divider, Box } from "@mui/material";

import AnalysisTabsProps from "./analysisTabProps";
import CensusInformation from "./components/CensusInformation";

const CensusDataTab: FC<AnalysisTabsProps> = (props) => {
  return (
    <>
      <Box sx={{ padding: 2, height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Census Data
        </Typography>
        <Typography variant="body1" gutterBottom>
          This tab will contain the census data analysis.
        </Typography>
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        <CensusInformation />
      </Box>
    </>
  );
};

export default CensusDataTab;
