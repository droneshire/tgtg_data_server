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
  dataMaps: DataMaps;
}

const ResearchCoverage: React.FC<ResearchCoverageProps> = ({ dataMaps }) => {
  const [searchGridWidthMeters, setSearchGridWidthMeters] =
    React.useState(500.0);
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMeters, setSearchRadiusMeters] = React.useState(0);
  const [cityName, setCityName] = React.useState("");

  const [displayResearchResults, setDisplayResearchResults] =
    React.useState(false);

  const [costResults, setCostResults] = React.useState<CostResults>({
    numberOfSquares: 0,
    totalCost: 0,
    searchBlockArea: 0,
    totalAreaMeters: 0,
  });

  const handleAnalyzeClick = (inputs: ResearchParameterInputs) => {
    setCostPerSearch(inputs.costPerSearch);
    setCityName(inputs.cityName);

    const updatedSearchRadiusMeters =
      inputs.searchRadiusMiles * METERS_PER_MILE;

    const newCostResults: CostResults = calculateCostFromResults(
      searchGridWidthMeters,
      costPerSearch,
      updatedSearchRadiusMeters,
      true
    );

    setCostResults(newCostResults);
    setSearchRadiusMeters(updatedSearchRadiusMeters);
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
          <ResearchSearchEstimateMap
            cityName={cityName}
            dataMaps={dataMaps}
            costPerSearch={costPerSearch}
            searchRadiusMeters={searchRadiusMeters}
          ></ResearchSearchEstimateMap>
        </Box>
      )}
    </>
  );
};

export default ResearchCoverage;
