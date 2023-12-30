import { FC, useState } from "react";
import { Typography, Divider, FormGroup, Tooltip, Box } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import DemographicsUploader, { StoreStats } from "./DemographicsUploader";

const DemographicsTab: FC = () => {
  const [displayChart, setDisplayChart] = useState(false);
  const [xAxisData, setXAxisData] = useState<string[]>([]);
  const [yAxisData, setYAxisData] = useState<number[]>([]);
  const onUpload = (storeStats: StoreStats) => {
    const storeNames: string[] = Array.from(storeStats.keys());
    const storeCounts: number[] = Array.from(storeStats.values());
    setXAxisData(storeNames);
    setYAxisData(storeCounts);
    setDisplayChart(true);
    console.log("Updated stats for chart");
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Demographics Analysis
      </Typography>

      <Typography variant="body1" gutterBottom>
        Upload a csv file that contains addresses to be analyzed.
      </Typography>
      <FormGroup>
        <DemographicsUploader onUpload={onUpload}></DemographicsUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      {displayChart && (
        <>
          <Box sx={{ width: "100%" }}>
            <BarChart
              height={300}
              xAxis={[{ scaleType: "band", data: xAxisData }]}
              series={[{ data: yAxisData }]}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default DemographicsTab;
