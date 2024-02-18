import React from "react";
import { DataMaps } from "./CsvDataUploader";
import { Box, Button, Slider, Typography } from "@mui/material";
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
  const [costPerSearch, setCostPerSearch] = React.useState(0.04);
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
        <Typography id="radius-slider" gutterBottom>
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
        />

        <Button variant="contained" component="label" onClick={onClick}>
          ProximitySearchCoverage
        </Button>
      </Box>
    </>
  );
};

export default ProximitySearchCoverage;
