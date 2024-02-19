import React from "react";
import { DataMaps } from "./CsvDataUploader";
import {
  Box,
  Button,
  Slider,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  CostResults,
  calculateCostFromResults,
} from "../logic/places_coverage";
import { METERS_PER_MILE } from "../logic/constants";

interface ProximitySearchCoverageProps {
  dataMaps: DataMaps; // Replace 'any' with the appropriate type for your dataMaps
}

const ProximitySearchCoverage: React.FC<ProximitySearchCoverageProps> = ({
  dataMaps,
  ...props
}) => {
  const [searchGridWitdthMeters, setSearchGridWidthMeters] =
    React.useState(500.0);
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMiles, setSearchRadiusMiles] = React.useState(20.0);

  const onClick = () => {
    console.log("ProximitySearchCoverage clicked");

    const searchRadiusMeters = searchRadiusMiles * METERS_PER_MILE;

    const costResults: CostResults = calculateCostFromResults(
      searchGridWitdthMeters,
      costPerSearch,
      searchRadiusMeters,
      true
    );
  };

  const handleRadiusChange = (event: Event, value: number | number[]) => {
    setSearchRadiusMiles(value as number);
  };

  const handleCostPerSearchChange = (
    event: SelectChangeEvent<string>,
    child: React.ReactNode
  ) => {
    setCostPerSearch(parseFloat(event.target.value));
  };

  const step = 0.005;
  const max = 0.1;

  const costPerClickValues = [];
  for (let value = 0.005; value <= max; value += step) {
    costPerClickValues.push(value.toFixed(3));
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          alignItems: "flex-start",
        }}
      >
        <Typography
          id="radius-slider"
          gutterBottom
          sx={{ marginBottom: "16px" }}
        >
          Search Radius (mi)
        </Typography>
        <Slider
          value={searchRadiusMiles}
          onChange={handleRadiusChange}
          min={1.0}
          max={20.0}
          step={0.5}
          aria-labelledby="radius-slider"
          valueLabelDisplay="auto"
          sx={{ marginBottom: "16px" }}
        />
        <Typography
          id="cost-per-click-select"
          gutterBottom
          sx={{ marginBottom: "16px" }}
        >
          Price per Search
        </Typography>
        <Select
          value={costPerSearch.toFixed(3)}
          onChange={handleCostPerSearchChange}
          labelId="cost-per-click-select"
          id="cost-per-click-select"
          sx={{ marginBottom: "16px" }}
        >
          {costPerClickValues.map((value) => (
            <MenuItem key={value} value={value}>
              ${value}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          component="label"
          onClick={onClick}
          sx={{ marginBottom: "16px" }}
        >
          Analyze
        </Button>
      </Box>
    </>
  );
};

export default ProximitySearchCoverage;
