import { FC } from "react";
import { Typography, Divider, Box, Paper } from "@mui/material";

import AnalysisTabsProps from "./analysisTabProps";
import CensusInformation from "./components/CensusInformation";

const CensusDataTab: FC<AnalysisTabsProps> = (props) => {
  return (
    <>
      <Box sx={{ padding: 2, height: "100%", width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Census Data
        </Typography>
        <Paper
          sx={{
            padding: 2,
            backgroundColor: "light-grey",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body1" gutterBottom>
            Explore the different types of census data available for analysis.
            `By Group` and `By Variable` are the two types of searches
            available.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <li>
              `By Variable` will display the census codes and their descriptions
              for a specific variable. Variables are a subset of groups.
            </li>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <li>
              `By Group` will display the census codes and their descriptions
              for a specific group. If you select `By Group`, it will search all
              variables within that group, so use this option wisely as it could
              incur a large amount of data.
            </li>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <li>
              Year lets you select the year for which you want to search the
              census data.
            </li>
          </Typography>
        </Paper>
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        <CensusInformation userConfigSnapshot={props.userConfigSnapshot} />
      </Box>
    </>
  );
};

export default CensusDataTab;
