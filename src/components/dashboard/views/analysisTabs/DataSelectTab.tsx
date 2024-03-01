import { FC } from "react";
import { Typography, Divider, FormGroup } from "@mui/material";
import CsvDataUploader, { DataMaps } from "./components/CsvDataUploader";

import AnalysisTabsProps from "./analysisTabProps";

const DataSelectTab: FC<AnalysisTabsProps> = (props) => {
  const onUpload = (dataMaps: DataMaps) => {
    if (!!!dataMaps) {
      return;
    }

    if (props.onUpload) {
      props.onUpload(dataMaps);
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Data Selection
      </Typography>

      <Typography variant="body1" gutterBottom>
        Upload a csv file downloaded from <a href="/searches">Searches</a> page
        that contains addresses to be analyzed or select from active searches.
      </Typography>
      <FormGroup>
        <CsvDataUploader onUpload={onUpload}></CsvDataUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default DataSelectTab;
