import { FC } from "react";
import { Typography, Divider } from "@mui/material";
import DataAnalysis from "./components/DataAnalysis";
import AnalysisTabsProps from "./analysisTabProps";

const StoreAnalysisTab: FC<AnalysisTabsProps> = (props) => {
  const dataMaps = props.dataMaps;
  const displayChart = props.displayChart;
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Store Analysis
      </Typography>

      <Typography variant="body1" gutterBottom>
        Upload a csv file downloaded from <a href="/searches">Searches</a> page
        that contains addresses to be analyzed or select from active searches.
      </Typography>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      {displayChart && (
        <>
          <DataAnalysis dataMaps={dataMaps}></DataAnalysis>
        </>
      )}
    </>
  );
};

export default StoreAnalysisTab;
