import React, { useEffect, useState } from "react";

import Plot from "react-plotly.js";
import { Data } from "plotly.js";
import { DataMaps } from "./CsvDataUploader";
import {
  Coordinates,
  Grid,
  getCityCenterCoordinates,
  getGridCoordinates,
} from "utils/demographics";
import GooglePlacesAPI, { TextSearchData } from "utils/google_places";
import {
  ADVANCED_FIELDS,
  MAX_COST_PER_CITY,
  METERS_PER_KILOMETER,
  METERS_PER_MILE,
} from "../logic/constants";
import { calculateCostFromResults } from "../logic/places_coverage";
import { HEADER_TITLES } from "utils/constants";
import { Box, Divider, Typography, useTheme } from "@mui/material";

interface ResearchSearchEstimateMapProps {
  dataMaps: DataMaps;
  costPerSearch: number;
  cityName: string;
  searchRadiusMeters: number;
}

interface GridSearchResults {
  radiusMiles: number;
  grid: Grid;
  numberOfSquares: number;
  totalCost: number;
  gridWidthMeters: number;
}

interface PlotData {
  data: Data[];
  layout: any;
}

const findMaxRadiusWithinBudget = async (
  centerLat: number,
  centerLon: number,
  initialRadiusMeters: number,
  costPerSearch: number
): Promise<GridSearchResults> => {
  let radiusMeters = initialRadiusMeters;
  let totalCost = MAX_COST_PER_CITY + 1;
  let grid: Grid = [];
  let numberOfSquares = 0;

  const googlePlacesApi: GooglePlacesAPI = new GooglePlacesAPI(
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    true
  );

  const maxGridResolutionWidthMeters =
    await googlePlacesApi.findMaximumViewpointWidth(
      centerLat,
      centerLon,
      "All Restaurants"
    );

  console.log(`Max viewpoint width: ${maxGridResolutionWidthMeters}m`);

  if (maxGridResolutionWidthMeters <= 0) {
    console.error("Error: Unable to find maximum viewpoint width");
    return {
      radiusMiles: 0,
      grid: [],
      numberOfSquares: 0,
      totalCost: 0,
      gridWidthMeters: 0,
    };
  }

  while (totalCost > MAX_COST_PER_CITY && radiusMeters > METERS_PER_KILOMETER) {
    ({ numberOfSquares, totalCost } = calculateCostFromResults(
      maxGridResolutionWidthMeters,
      costPerSearch,
      radiusMeters,
      false
    ));
    radiusMeters -= METERS_PER_KILOMETER;
  }
  grid = getGridCoordinates(
    centerLat,
    centerLon,
    radiusMeters,
    maxGridResolutionWidthMeters
  );
  const radiusMiles = radiusMeters / METERS_PER_MILE;

  console.log(`Final radius: ${radiusMiles.toFixed(2)} miles`);
  console.log(`Final cost: $${totalCost}`);
  return {
    radiusMiles,
    grid,
    numberOfSquares,
    totalCost,
    gridWidthMeters: maxGridResolutionWidthMeters,
  };
};

const ResearchSearchEstimateMap: React.FC<ResearchSearchEstimateMapProps> = (
  props
) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;

  const [data, setData] = useState<PlotData>({
    data: [],
    layout: {},
  });

  const storeMap = props.dataMaps.storeMap;
  const cityName = props.cityName;
  const searchRadiusMeters = props.searchRadiusMeters;
  const costPerSearch = props.costPerSearch;

  const [displayPlot, setDisplayPlot] = useState(false);
  const [subText, setSubText] = useState("");
  const [gridSearchResults, setGridSearchResults] = useState<GridSearchResults>(
    {
      radiusMiles: 0,
      grid: [],
      numberOfSquares: 0,
      totalCost: 0,
      gridWidthMeters: 0,
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
        const gridSearchResults = await findMaxRadiusWithinBudget(
          cityCenterCoordinates.latitude,
          cityCenterCoordinates.longitude,
          searchRadiusMeters,
          costPerSearch
        );
        console.log(gridSearchResults);
        setGridSearchResults(gridSearchResults);
      }
    };

    fetchFindMaxRadiusWithinBudget();
  }, [memoizedCityCenterCoordinates, searchRadiusMeters, costPerSearch]);

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

    const dataLocal: Data[] = [
      {
        type: "scattermapbox",
        lat: gridSearchResults.grid.map((coord) => coord[0]),
        lon: gridSearchResults.grid.map((coord) => coord[1]),
        mode: "markers",
        marker: {
          size: 2,
          color: "blue",
        },
      },
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
          color: counts
            ? counts.map((count) => count / Math.max(...counts))
            : 1,
          colorscale: "viridis",
          showscale: false,
          cmin: 0,
          cmax: 1,
          size: counts
            ? counts.map((count) => Math.max(Math.sqrt(count) * scaleFactor, 1))
            : 1,
        },
      },
    ];

    const subText = `${gridSearchResults.radiusMiles.toFixed(
      1
    )}mi radius, ${gridSearchResults.numberOfSquares.toFixed(
      0
    )} blocks, ${gridSearchResults.gridWidthMeters.toFixed(0)}m blocks`;
    const layoutLocal = {
      autosize: true,
      hovermode: "closest",
      title: `Search Grid for ${cityName} [${gridSearchResults.totalCost}]`,
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
    };

    setData({ data: dataLocal, layout: layoutLocal });
    setSubText(subText);
    setDisplayPlot(true);
  }, [storeMap, gridSearchResults]);

  return displayPlot ? (
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
        <Typography variant="caption">{subText}</Typography>
      </Box>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  ) : (
    <></>
  );
};

export default ResearchSearchEstimateMap;
