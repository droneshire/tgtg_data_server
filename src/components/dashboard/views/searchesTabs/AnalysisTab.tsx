import React, { FC, useState, useEffect } from "react";
import {
  Typography,
  Divider,
  FormGroup,
  Tooltip,
  Box,
  Menu,
  Button,
  Fade,
  MenuItem,
} from "@mui/material";
import { Data } from "plotly.js";
import Plot from "react-plotly.js";
import CsvUploader from "./CsvUploader";
import { StoreStats } from "workers/csvWorker";
import { ArrowDropDown } from "@mui/icons-material";

const AnalysisTab: FC = () => {
  const [displayChart, setDisplayChart] = useState(false);
  const [data, setData] = useState<Data[]>([]);
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const openMenu = Boolean(menuAnchorEl);
  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuButtonClose = (name: string) => {
    setMenuAnchorEl(null);
    setSelectedStore(name);
  };

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
    setSelectedStore("");
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
          <FormGroup>
            <Button
              id="fade-button"
              aria-controls={openMenu ? "fade-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
              onClick={handleMenuButtonClick}
              variant="contained"
            >
              Select Store
              <ArrowDropDown />
            </Button>
            <Menu
              id="fade-menu-stores"
              MenuListProps={{
                "aria-labelledby": "fade-button",
              }}
              anchorEl={menuAnchorEl}
              open={openMenu}
              onClose={handleMenuButtonClose}
              TransitionComponent={Fade}
            >
              {storeNames.map((name) => (
                <MenuItem
                  key={name}
                  onClick={() => {
                    handleMenuButtonClose(name);
                  }}
                >
                  {name}
                </MenuItem>
              ))}
            </Menu>
          </FormGroup>
        </>
      )}
    </>
  );
};

export default AnalysisTab;
