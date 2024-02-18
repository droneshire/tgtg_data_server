import React from "react";
import { DataMaps } from "./CsvDataUploader";
import { Box, Button, Slider } from "@mui/material";
import { calculateCostFromResults } from "../logic/places_coverage";

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
  const [searchRadius, setSearchRadius] = React.useState(20.0);

  const onClick = () => {
    console.log("ProximitySearchCoverage clicked");

    calculateCostFromResults(
      searchGridWitdthMeters,
      costPerSearch,
      searchRadius,
      true
    );
  };

  const handleRadiusChange = (event: Event, value: number | number[]) => {
    setSearchRadius(value as number);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Slider
          value={searchRadius}
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
