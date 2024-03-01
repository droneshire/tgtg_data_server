import React, { useEffect, useState } from "react";

import Plot from "react-plotly.js";
import { Data } from "plotly.js";
import { DataMaps } from "./CsvDataUploader";
import { Coordinates, getCityCenterCoordinates } from "utils/demographics";
import { HEADER_TITLES } from "utils/constants";
import { Divider } from "@mui/material";
import {
  GridSearchResults,
  findMaxGridSearchResultsWithinBudget,
} from "../logic/places_coverage";

interface ResearchSearchEstimateMapProps {
  dataMaps: DataMaps;
  costPerSearch: number;
  cityName: string;
  searchRadiusMeters: number;
  searchBudget: number;
  onMapComplete?: (gridSearchResults: GridSearchResults) => void;
}

interface PlotData {
  data: Data[];
  layout: any;
}

const ResearchSearchEstimateMap: React.FC<ResearchSearchEstimateMapProps> = (
  props
) => {
  const [data, setData] = useState<PlotData>({
    data: [],
    layout: {},
  });

  const storeMap = props.dataMaps.storeMap;
  const cityName = props.cityName;
  const searchRadiusMeters = props.searchRadiusMeters;
  const costPerSearch = props.costPerSearch;
  const searchBudget = props.searchBudget;

  const [subText, setSubText] = useState("");
  const [gridSearchResults, setGridSearchResults] = useState<GridSearchResults>(
    {
      radiusMiles: 0,
      grid: [],
      numberOfSquares: 0,
      totalCost: 0,
      gridWidthMeters: 0,
      cityCenter: { latitude: 0, longitude: 0 },
    }
  );
  const [cityCenterCoordinates, setCityCenterCoordinates] =
    useState<Coordinates | null>(null);

  const memoizedCityCenterCoordinates = React.useMemo(
    () => cityCenterCoordinates,
    [cityCenterCoordinates]
  );
  const memoizedCityName = React.useMemo(() => cityName, [cityName]);

  // Fetch city center coordinates
  useEffect(() => {
    if (!memoizedCityName) {
      return;
    }

    const fetchCityCenterCoordinates = async () => {
      const coordinates = await getCityCenterCoordinates(memoizedCityName);
      setCityCenterCoordinates(coordinates);
      console.log(
        `${memoizedCityName} center coordinates: ${coordinates.latitude}, ${coordinates.longitude}`
      );
    };

    fetchCityCenterCoordinates();
  }, [memoizedCityName]);

  // Calculate the grid search sizes and radius to fit within budget
  useEffect(() => {
    const fetchFindMaxRadiusWithinBudget = async () => {
      if (cityCenterCoordinates) {
        const gridSearchResults = await findMaxGridSearchResultsWithinBudget(
          cityCenterCoordinates.latitude,
          cityCenterCoordinates.longitude,
          searchRadiusMeters,
          costPerSearch,
          searchBudget
        );
        setGridSearchResults(gridSearchResults);
      }
    };

    fetchFindMaxRadiusWithinBudget();
  }, [
    memoizedCityCenterCoordinates,
    searchRadiusMeters,
    costPerSearch,
    searchBudget,
  ]);

  // Plot the grid search results
  useEffect(() => {
    if (gridSearchResults.grid.length <= 0) {
      return;
    }
    const names: string[] = Array.from(storeMap.keys()).sort();
    const counts: number[] = names.map((name) => {
      const dataList = storeMap.get(name);
      return dataList ? dataList.length : 0;
    });
    const zippedArray: string[] = names.map(
      (name, index) => `${name} (${counts[index]})`
    );
    const scaleFactor: number = 0.5;
    const defaultMinSize: number = 10;
    const dataLocal: Data[] = [
      {
        name: "Search Grid",
        type: "scattermapbox",
        lat: gridSearchResults.grid.map((coord) => coord.center.latitude),
        lon: gridSearchResults.grid.map((coord) => coord.center.longitude),
        mode: "markers",
        marker: {
          size: 2,
          color: "blue",
        },
      },
      {
        name: "Stores",
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
          color: counts
            ? counts.map((count) => count / Math.max(...counts))
            : 1,
          colorscale: "viridis",
          showscale: false,
          cmin: 0,
          cmax: 1,
          size: counts
            ? counts.map((count) =>
                Math.max(Math.sqrt(count) * scaleFactor, defaultMinSize)
              )
            : defaultMinSize,
        },
      },
    ];
    const layoutLocal = {
      autosize: true,
      hovermode: "closest",
      mapbox: {
        bearing: 0,
        center: {
          lat: cityCenterCoordinates?.latitude || 38,
          lon: cityCenterCoordinates?.longitude || -90,
        },
        pitch: 0,
        zoom: 9,
        style: "open-street-map",
      },
      legend: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: -0.2,
        yanchor: "bottom",
      },
    };

    setData({ data: dataLocal, layout: layoutLocal });
    setSubText(subText);
    props.onMapComplete?.(gridSearchResults);
  }, [storeMap, gridSearchResults]);

  return (
    <>
      <Plot
        data={data.data}
        layout={data.layout}
        useResizeHandler={true}
        style={{
          height: "600px",
          width: "100%",
        }}
      />
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default ResearchSearchEstimateMap;
