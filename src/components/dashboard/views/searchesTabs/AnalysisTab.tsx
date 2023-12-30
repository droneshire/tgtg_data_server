import { FC, useState } from "react";
import { Typography, Divider, FormGroup, Box } from "@mui/material";
import { Data } from "plotly.js";
import Plot from "react-plotly.js";
import CsvUploader from "./CsvUploader";
import { StoreStats } from "workers/csvWorker";
import StoreAnalysis from "./StoreAnalysis";

const AnalysisTab: FC = () => {
  const [displayChart, setDisplayChart] = useState(false);
  const [data, setData] = useState<Data[]>([]);
  const [storeNames, setStoreNames] = useState<string[]>([]);

  const onUpload = (storeStats: StoreStats) => {
    // storeNames and counts by alphabetical order
    const names: string[] = Array.from(storeStats.keys()).sort();
    const counts: number[] = names.map((name) => storeStats.get(name) || 0);
    const storeData: Data[] = [
      {
        x: names,
        y: counts,
        type: "bar",
        marker: { color: "blue" },
      },
    ];
    setStoreNames(names);
    setData(storeData);
    setDisplayChart(true);
    console.log("Updated stats for chart");
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Data Analysis
      </Typography>

      <Typography variant="body1" gutterBottom>
        Upload a csv file that contains addresses to be analyzed.
      </Typography>
      <FormGroup>
        <CsvUploader onUpload={onUpload}></CsvUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      {displayChart && (
        <>
          <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
            <Plot
              data={data}
              layout={{ autosize: true, title: "Store Counts" }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
            <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
          </Box>
          <StoreAnalysis storeNames={storeNames}></StoreAnalysis>
        </>
      )}
    </>
  );
};

export default AnalysisTab;
