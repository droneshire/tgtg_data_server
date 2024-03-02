import { FC } from "react";
import { Typography, Divider } from "@mui/material";

import AnalysisTabsProps from "./analysisTabProps";
import USCensusAPI from "utils/us_census";

const CensusDataTab: FC<AnalysisTabsProps> = (props) => {
  const census = new USCensusAPI(
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""
  );

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
