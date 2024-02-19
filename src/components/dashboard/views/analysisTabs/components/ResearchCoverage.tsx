import React from "react";
import { DataMaps } from "./CsvDataUploader";
import { Box } from "@mui/material";
import {
  CostResults,
  calculateCostFromResults,
} from "../logic/places_coverage";
import ResearchCostTable from "./ResearchCostTable";
import ResearchParameterInputs from "./ResearchParameterInputs";
import { METERS_PER_MILE } from "../logic/constants";
import ResearchSearchEstimateMap from "./ResearchSearchEstimateMap";

interface ResearchCoverageProps {
  dataMaps: DataMaps; // Replace 'any' with the appropriate type for your dataMaps
}

const ResearchCoverage: React.FC<ResearchCoverageProps> = ({ dataMaps }) => {
  const [searchGridWidthMeters, setSearchGridWidthMeters] =
    React.useState(500.0);
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMiles, setSearchRadiusMiles] = React.useState(20.0);

  const [displayResearchResults, setDisplayResearchResults] =
    React.useState(false);

  const [costResults, setCostResults] = React.useState<CostResults>({
    numberOfSquares: 0,
    totalCost: 0,
    searchBlockArea: 0,
    totalAreaMeters: 0,
  });

  const handleAnalyzeClick = (
    updatedSearchGridWidthMeters: number,
    updatedCostPerSearch: number,
    updatedSearchRadiusMiles: number
  ) => {
    setCostPerSearch(updatedCostPerSearch);
    setSearchRadiusMiles(updatedSearchRadiusMiles);
    setSearchGridWidthMeters(updatedSearchGridWidthMeters);

    const searchRadiusMeters = updatedSearchRadiusMiles * METERS_PER_MILE;

    const newCostResults: CostResults = calculateCostFromResults(
      searchGridWidthMeters,
      costPerSearch,
      searchRadiusMeters,
      true
    );

    setCostResults(newCostResults);

    setDisplayResearchResults(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          gap: "20px",
          padding: "20px",
        }}
      >
        <ResearchParameterInputs
          onClick={handleAnalyzeClick}
        ></ResearchParameterInputs>
        {displayResearchResults && (
          <ResearchCostTable costResults={costResults}></ResearchCostTable>
        )}
      </Box>
      {displayResearchResults && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            gap: "20px",
            padding: "20px",
          }}
        >
          <ResearchSearchEstimateMap></ResearchSearchEstimateMap>
        </Box>
      )}
    </>
  );
};

export default ResearchCoverage;
