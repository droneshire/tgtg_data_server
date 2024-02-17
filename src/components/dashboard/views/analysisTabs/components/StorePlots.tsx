import React, { useEffect, useState, useRef } from "react";
import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Plot from "react-plotly.js";
import { Data } from "plotly.js";
import { DataMap, DataMaps } from "./CsvDataUploader";
import { CsvDataRow } from "workers/csvWorker";
import { HEADER_TITLES } from "utils/constants";
import { useTheme } from "@mui/material/styles";
import useResizeObserver from "utils/resize_observer";

export interface IndividualStoreProps extends AllStoreProps {
  name: string;
}

export interface AllStoreProps {
  dataMaps: DataMaps;
}

export interface StoreMapProps {
  storeMap: DataMap;
}

interface DistributionProps {
  name: string;
  dataList: CsvDataRow[];
}

interface PlotData {
  data: Data[];
  layout: any;
}

export const StoreMaps: React.FC<StoreMapProps> = ({ storeMap }) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const [data, setData] = useState<PlotData>({
    data: [],
    layout: {},
  });

  useEffect(() => {
    const names: string[] = Array.from(storeMap.keys()).sort();
    const counts: number[] = names.map((name) => {
      const dataList = storeMap.get(name);
      return dataList ? dataList.length : 0;
    });
    const zippedArray: string[] = names.map(
      (name, index) => `${name} (${counts[index]})`
    );
    const defaultLatitude =
      storeMap.values().next().value[0][HEADER_TITLES.latitude] || 38;
    const defaultLongitude =
      storeMap.values().next().value[0][HEADER_TITLES.longitude] || -90;

    const scaleFactor: number = 0.5;
    const dataLocal: Data[] = [
      {
        type: "scattermapbox",
        text: zippedArray,
        lon: names.map((key) => {
          const dataList = storeMap.get(key);
          return dataList ? dataList[0][HEADER_TITLES.longitude] : 0;
        }),
        lat: names.map((key) => {
          const dataList = storeMap.get(key);
          return dataList ? dataList[0][HEADER_TITLES.latitude] : 0;
        }),
        marker: {
          color: mainColor,
          size: counts
            ? counts.map((count) => Math.max(Math.sqrt(count) * scaleFactor, 1))
            : 1,
        },
      },
    ];
    const layoutLocal = {
      autosize: true,
      title: "Store Locations",
      dragmode: "zoom",
      mapbox: {
        style: "open-street-map",
        center: { lat: defaultLatitude, lon: defaultLongitude },
        zoom: 9,
      },
      margin: { r: 0, t: 0, b: 0, l: 0 },
    };
    setData({ data: dataLocal, layout: layoutLocal });
  }, [storeMap]);

  return (
    <>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Plot
          data={data.data}
          layout={data.layout}
          useResizeHandler={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      </Box>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export const StoreCounts: React.FC<StoreMapProps> = (props) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
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
        marker: { color: mainColor },
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

export const StoreRating: React.FC<IndividualStoreProps> = ({
  name,
  dataMaps,
}) => {
  const { storeMap } = dataMaps;
  const [data, setData] = useState<PlotData>({
    data: [],
    layout: {},
  });
  const [enabled, setEnabled] = useState<boolean>(false);

  if (!name || !storeMap) {
    setEnabled(false);
    return <></>;
  }

  useEffect(() => {
    const dataList = storeMap.get(name);
    const ratings = (
      dataList?.map((data) => {
        const rating = data[HEADER_TITLES.rating];
        return rating ? parseFloat(rating) : NaN;
      }) || []
    ).filter((rating) => !isNaN(rating));

    if (ratings.length === 0) {
      setEnabled(false);
      return;
    }

    const averageRating = ratings.reduce((a, b) => a + b) / ratings.length;
    const storeData: Data[] = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: averageRating,
        title: { text: "Average Overall Store Rating" },
        type: "indicator",
        mode: "gauge+number+delta",
        delta: { reference: 3.0 },
        gauge: { axis: { range: [0.0, 5.0] } },
      },
    ];

    const storeLayout = { width: 600, height: 400 };

    setData({ data: storeData, layout: storeLayout });
    setEnabled(true);
  }, [name, storeMap]);

  return (
    <>
      {enabled && (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            overflowX: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plot data={data.data} layout={data.layout} useResizeHandler={true} />
          <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        </Box>
      )}
    </>
  );
};

export const StoreDemographics: React.FC<IndividualStoreProps> = ({
  name,
  dataMaps,
}) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const { storeMap } = dataMaps;

  const [itemsListed, setItemsListed] = useState<number>(0);
  const [latLongText, setLatLongText] = useState<string>("");

  if (!name || !storeMap) {
    return <></>;
  }

  useEffect(() => {
    const dataList = storeMap.get(name);
    if (!dataList || dataList.length === 0) {
      return;
    }
    const count = dataList.length;
    const lat = dataList[0][HEADER_TITLES.latitude];
    const long = dataList[0][HEADER_TITLES.longitude];

    const strLatitude = lat.toString();
    const lattitudeText =
      strLatitude.slice(0, strLatitude.indexOf(".") + 3) +
      "°" +
      (strLatitude.includes("-") ? "S" : "N");
    const strLongitude = long.toString();
    const longitudeText =
      strLongitude.slice(0, strLongitude.indexOf(".") + 3) +
      "°" +
      (strLongitude.includes("-") ? "W" : "E");
    setItemsListed(count);
    setLatLongText(lattitudeText + ", " + longitudeText);
  }, [name, storeMap]);

  return (
    <>
      <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead style={{ backgroundColor: mainColor }}>
              <TableRow
                sx={{
                  marginLeft: "1rem",
                  "& > *": { textAlign: "center", border: "1px solid black" },
                }}
              >
                <TableCell> Lat, Long </TableCell>
                <TableCell> Items Listed </TableCell>
                <TableCell> Population Tract </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{
                  marginLeft: "1rem",
                  "& > *": { textAlign: "center", border: "1px solid black" },
                }}
              >
                <TableCell> {latLongText} </TableCell>
                <TableCell> {itemsListed} </TableCell>
                <TableCell> 12,3545 </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export const StoreUsageTime: React.FC<IndividualStoreProps> = ({
  name,
  dataMaps,
}) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
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
        marker: { color: mainColor },
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

export const PriceDistribution: React.FC<DistributionProps> = ({
  name,
  dataList,
}) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const [histogramData, setHistogramData] = useState<Data[]>([]);

  useEffect(() => {
    if (!dataList) {
      return;
    }

    const prices = dataList
      .map((entry) =>
        parseFloat(entry[HEADER_TITLES.priceIncludingTax].split(" ")[0])
      )
      .filter((price) => !isNaN(price));

    if (prices.length === 0) {
      return;
    }

    // Calculate max price using a loop
    let maxPrice = -Infinity;
    for (let price of prices) {
      if (price > maxPrice) {
        maxPrice = price;
      }
    }

    const dataObject: Data = {
      x: prices,
      type: "histogram",
      marker: { color: mainColor },
      xbins: {
        start: 0,
        end: maxPrice,
        size: 0.05,
      },
    };

    setHistogramData([dataObject]);
  }, [dataList]);

  if (!name || !dataList || dataList.length === 0) {
    return <Typography>No data available.</Typography>;
  }

  return (
    <>
      <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
        <Plot
          data={histogramData}
          layout={{
            autosize: true,
            title: "Price Distribution for " + name + "",
            xaxis: {
              title: "Price ($)",
            },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      </Box>
    </>
  );
};

export const StorePriceDistribution: React.FC<IndividualStoreProps> = ({
  name,
  dataMaps,
}) => {
  const { storeMap } = dataMaps;
  const [dataList, setDataList] = useState<CsvDataRow[]>([]);

  if (!name || !storeMap) {
    return <></>;
  }

  useEffect(() => {
    const dataList = storeMap.get(name);
    if (!dataList) {
      return;
    }
    setDataList(dataList);
  }, [name, storeMap]);

  return (
    <>
      <PriceDistribution name={name} dataList={dataList} />
    </>
  );
};

export const AllMealTypes: React.FC<StoreMapProps> = ({ storeMap }) => {
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
      <Box sx={{ height: "100%" }}>
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

      <Box sx={{ height: "100%" }}>
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
    </>
  );
};
