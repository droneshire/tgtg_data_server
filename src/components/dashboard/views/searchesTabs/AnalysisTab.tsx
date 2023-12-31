import { FC, useState } from "react";
import { Typography, Divider, FormGroup, Box } from "@mui/material";
import CsvDataUploader, { DataMaps } from "./CsvDataUploader";
import { CsvDataRow } from "workers/csvWorker";
import DataAnalysis from "./DataAnalysis";

const AnalysisTab: FC = () => {
  const [displayChart, setDisplayChart] = useState(false);
  const [dataMaps, setDataMaps] = useState<DataMaps>({
    storeMap: new Map<string, CsvDataRow[]>(),
    dateMap: new Map<string, CsvDataRow[]>(),
  });

  const onUpload = (dataMaps: DataMaps) => {
    if (!!!dataMaps) {
      return;
    }

    setDisplayChart(true);
    setDataMaps(dataMaps);
    console.log("Updated stats for chart");
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Data Analysis
      </Typography>

      <Typography variant="body1" gutterBottom>
        Upload a csv file downloaded from <a href="/searches">Searches</a> page
        that contains addresses to be analyzed.
      </Typography>
      <FormGroup>
        <CsvDataUploader onUpload={onUpload}></CsvDataUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      {displayChart && (
        <>
          <DataAnalysis dataMaps={dataMaps}></DataAnalysis>
        </>
      )}
    </>
  );
};

export default AnalysisTab;
