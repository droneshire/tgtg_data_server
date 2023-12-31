import React, { useEffect, useState } from "react";
import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Fade,
  FormGroup,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Plot from "react-plotly.js";
import { Data, Layout } from "plotly.js";
import { DataMap, DataMaps } from "./CsvDataUploader";
import { CsvDataRow } from "workers/csvWorker";

interface StoreAnalysisProps {
  dataMaps: DataMaps;
}

interface StoreCountsProps {
  storeMap: DataMap;
}

interface StoreUsageTimeProps extends StoreAnalysisProps {
  name: string;
}

const StoreCounts: React.FC<StoreCountsProps> = (props) => {
  const { storeMap } = props;
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    // storeNames and counts by alphabetical order
    const names: string[] = Array.from(storeMap.keys()).sort();
    const counts: number[] = names.map((name) => {
      const dataList = storeMap.get(name);
      return dataList ? dataList.length : 0;
    });
    const storeData: Data[] = [
      {
        x: names,
        y: counts,
        type: "bar",
        marker: { color: "blue" },
      },
    ];
    setData(storeData);
  }, [storeMap]);

  return (
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
    </>
  );
};

const StoreUsageTime: React.FC<StoreUsageTimeProps> = ({ name, dataMaps }) => {
  const { storeMap, dateMap } = dataMaps;
  const [data, setData] = useState<Data[]>([]);
  const [layout, setLayout] = useState<any>({
    autosize: true,
    title: "Daily Listings for " + name + "",
    xaxis: {
      title: "Date",
      tickangle: -45,
      automargin: true,
    },
    yaxis: {
      title: "Listings",
    },
  });

  if (!name || !dateMap) {
    return <></>;
  }

  useEffect(() => {
    const dataList = storeMap.get(name);
    const dates: string[] = Array.from(dateMap.keys()).sort();
    const counts = dates.map((date) => {
      // Count occurrences for each date
      return (
        dataList?.filter((data) => {
          // Extract just the date part from the timestamp
          const timestampDate = data["timestamp"].split(" ")[0]; // Assuming 'YYYY-MM-DD' format
          return timestampDate === date;
        }).length || 0
      );
    });
    const storeData: Data[] = [
      {
        x: dates,
        y: counts,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "blue" },
      },
    ];

    setData(storeData);

    const maxYValue = Math.max(...counts);
    console.log("maxYValue: " + maxYValue, counts, dataList);
    const margin = maxYValue * 0.1;
    const storeLayout = {
      ...layout, // Extend the existing layout object
      yaxis: {
        title: "Listings",
        range: [0, maxYValue + margin],
      },
    };
    setLayout(storeLayout);
  }, [name, storeMap, dateMap]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {name}
      </Typography>
      <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
        <Plot
          data={data}
          layout={layout}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      </Box>
    </>
  );
};

const StoreAnalysis: React.FC<StoreAnalysisProps> = ({ dataMaps }) => {
  const { storeMap, dateMap } = dataMaps;
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [storeNames, setStoreNames] = useState<string[]>([]);

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

  useEffect(() => {
    setSelectedStore("");
    setStoreNames(Array.from(storeMap.keys()).sort());
  }, [storeMap]);

  return (
    <>
      <StoreCounts storeMap={storeMap} />
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
          onClose={() => {
            handleMenuButtonClose("");
          }}
          TransitionComponent={Fade}
        >
          {storeNames.map((name, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleMenuButtonClose(name);
              }}
            >
              {name}
            </MenuItem>
          ))}
        </Menu>
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
          {selectedStore && (
            <StoreUsageTime
              name={selectedStore}
              dataMaps={{ storeMap, dateMap }}
            />
          )}
        </Box>
      </FormGroup>
    </>
  );
};

export default StoreAnalysis;
