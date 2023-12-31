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
import { HEADER_TITLES } from "utils/constants";

interface StoreAnalysisProps {
  dataMaps: DataMaps;
}

interface StoreCountsProps {
  storeMap: DataMap;
}

interface IndividualStoreProps extends StoreAnalysisProps {
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

const StoreUsageTime: React.FC<IndividualStoreProps> = ({ name, dataMaps }) => {
  const { storeMap, dateMap } = dataMaps;
  const [data, setData] = useState<Data[]>([]);
  const [layout, setLayout] = useState<any>({
    autosize: true,
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
    const margin = maxYValue * 0.1;
    const storeLayout = {
      ...layout, // Extend the existing layout object
      title: "Daily Listings for " + name + "",
      yaxis: {
        title: "Listings",
        range: [0, maxYValue + margin],
      },
    };
    setLayout(storeLayout);
  }, [name, storeMap, dateMap]);

  return (
    <>
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

const StorePriceDistribution: React.FC<IndividualStoreProps> = ({
  name,
  dataMaps,
}) => {
  const { storeMap, dateMap } = dataMaps;
  const [data, setData] = useState<Data[]>([]);
  if (!name || !dateMap) {
    return <></>;
  }

  useEffect(() => {
    const dataList = storeMap.get(name);
    if (!dataList) {
      return;
    }
    const prices: number[] = dataList.map((entry) => {
      console.log(entry, entry[HEADER_TITLES.priceIncludingTax]);
      return parseFloat(entry[HEADER_TITLES.priceIncludingTax].split(" ")[0]);
    });
    const priceData: Data[] = [
      {
        x: prices,
        type: "histogram",
        marker: { color: "blue" },
      },
    ];

    setData(priceData);
  }, [name, storeMap, dateMap]);

  return (
    <>
      <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
        <Plot
          data={data}
          layout={{
            autosize: true,
            title: "Price Distribution for " + name + "",
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      </Box>
    </>
  );
};

const AllMealTypes: React.FC<StoreCountsProps> = ({ storeMap }) => {
  const [dataTypes, setDataTypes] = useState<Data[]>([]);
  const [dataCategories, setDataCategories] = useState<Data[]>([]);
  if (!storeMap) {
    return <></>;
  }

  useEffect(() => {
    const mealTypes: string[] = [];
    const mealCategories: string[] = [];

    storeMap.forEach((value, key) => {
      value.forEach((entry) => {
        mealTypes.push(entry[HEADER_TITLES.mealType]);
        mealCategories.push(entry[HEADER_TITLES.mealCategory]);
      });
    });

    const mealTypeData: Data[] = [
      {
        labels: mealTypes,
        type: "pie",
      },
    ];
    const mealCategoryData: Data[] = [
      {
        labels: mealCategories,
        type: "pie",
      },
    ];

    setDataTypes(mealTypeData);
    setDataCategories(mealCategoryData);
  }, [storeMap]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
          height: "500px",
          overflowX: "auto",
        }}
      >
        <Box sx={{ flex: 1, paddingRight: 1, height: "100%" }}>
          <Plot
            data={dataTypes}
            layout={{
              autosize: true,
              title: "Meal Types",
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>

        <Box sx={{ flex: 1, paddingLeft: 1, height: "100%" }}>
          <Plot
            data={dataCategories}
            layout={{
              autosize: true,
              title: "Meal Categories",
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>

        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      </Box>
    </>
  );
};

const StorePlots: React.FC<IndividualStoreProps> = (props) => {
  const { name, dataMaps } = props;
  const { storeMap } = dataMaps;
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {name}
      </Typography>
      <StoreUsageTime name={name} dataMaps={dataMaps} />
      <StorePriceDistribution name={name} dataMaps={dataMaps} />
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
      <AllMealTypes storeMap={storeMap} />
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
            <StorePlots name={selectedStore} dataMaps={{ storeMap, dateMap }} />
          )}
        </Box>
      </FormGroup>
    </>
  );
};

export default StoreAnalysis;
