import { FC, useMemo } from "react";
import { Typography, Divider, FormGroup } from "@mui/material";
import CsvDataUploader, { DataMaps } from "./CsvDataUploader";
import { SearchSpec } from "components/dashboard/views/searchesTabs/Search";

import AnalysisTabsProps from "./analysisTabProps";

const DataSelectTab: FC<AnalysisTabsProps> = (props) => {
  const searches = props.userConfigSnapshot?.data()?.searches;

  const searchItems: SearchSpec[] = useMemo(() => {
    const items: SearchSpec[] = [];
    Object.entries(searches?.items || {}).forEach((t) => {
      const [searchId, item] = t;
      items.push({ searchId, ...item });
    });
    return items;
  }, [searches]);

  const onUpload = (dataMaps: DataMaps) => {
    if (!!!dataMaps) {
      return;
    }

    if (props.onUpload) {
      props.onUpload(dataMaps);
    }

    console.log("Updated stats for chart");
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
        <CsvDataUploader
          onUpload={onUpload}
          searchItems={searchItems}
        ></CsvDataUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default DataSelectTab;
