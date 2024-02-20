import React from "react";
import { DataMaps } from "./CsvDataUploader";
import { Box, Typography } from "@mui/material";
import { CostResults, GridSearchResults } from "../logic/places_coverage";
import ResearchCostTable from "./ResearchCostTable";
import ResearchParameterInputs from "./ResearchParameterInputs";
import { METERS_PER_MILE } from "../logic/constants";
import ResearchSearchEstimateMap from "./ResearchSearchEstimateMap";

interface ResearchCoverageProps {
  dataMaps: DataMaps;
}

const ResearchCoverage: React.FC<ResearchCoverageProps> = ({ dataMaps }) => {
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMeters, setSearchRadiusMeters] = React.useState(0);
  const [cityName, setCityName] = React.useState("");
  const [searchBudget, setSearchBudget] = React.useState(0);

  const [displayResearchResults, setDisplayResearchResults] =
    React.useState(false);
  const [displaySearchMap, setDisplaySearchMap] = React.useState(false);

  const [costResults, setCostResults] = React.useState<CostResults>({
    numberOfSquares: 0,
    totalCost: 0,
    searchBlockArea: 0,
    totalAreaMeters: 0,
    searchRadiusMiles: 0,
  });

  const handleAnalyzeClick = (inputs: ResearchParameterInputs) => {
    setCostPerSearch(inputs.costPerSearch);
    setCityName(inputs.cityName);
    setSearchBudget(inputs.searchBudget);

    const updatedSearchRadiusMeters =
      inputs.searchRadiusMiles * METERS_PER_MILE;

    setSearchRadiusMeters(updatedSearchRadiusMeters);
    setDisplaySearchMap(true);
  };

  const handleOnClear = () => {
    setDisplayResearchResults(false);
    setDisplaySearchMap(false);
    setCostResults({
      numberOfSquares: 0,
      totalCost: 0,
      searchBlockArea: 0,
      totalAreaMeters: 0,
      searchRadiusMiles: 0,
    });
  };

  const handleMapComplete = (gridSearchResults: GridSearchResults) => {
    const totalWidthMeters =
      gridSearchResults.radiusMiles * METERS_PER_MILE * 2;
    const totalAreaMeters = totalWidthMeters * totalWidthMeters;

    const gridWidthMeters = gridSearchResults.gridWidthMeters;
    const gridAreaMeters = gridWidthMeters * gridWidthMeters;

    setCostResults({
      numberOfSquares: gridSearchResults.numberOfSquares,
      totalCost: gridSearchResults.totalCost,
      searchBlockArea: gridAreaMeters,
      totalAreaMeters: totalAreaMeters,
      searchRadiusMiles: gridSearchResults.radiusMiles,
    });
    setDisplayResearchResults(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          gap: "20px",
          padding: "20px",
        }}
      >
        <ResearchParameterInputs
          onClick={handleAnalyzeClick}
          onClear={handleOnClear}
        />
      </Box>
      {displaySearchMap && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            gap: "20px",
            padding: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Search Grid for {cityName}
          </Typography>
          <ResearchSearchEstimateMap
            cityName={cityName}
            dataMaps={dataMaps}
            costPerSearch={costPerSearch}
            searchRadiusMeters={searchRadiusMeters}
            searchBudget={searchBudget}
            onMapComplete={handleMapComplete}
          />
        </Box>
      )}
      {displayResearchResults && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: "auto",
            gap: "20px",
            padding: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Estimated Search Cost
          </Typography>
          <ResearchCostTable costResults={costResults} />
        </Box>
      )}
    </>
  );
};

export default ResearchCoverage;
