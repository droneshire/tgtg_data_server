import React from "react";
import { DataMaps } from "./CsvDataUploader";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CostResults, GridSearchResults } from "../logic/places_coverage";
import ResearchCostTable from "./ResearchCostTable";
import ResearchParameterInputs from "./ResearchParameterInputs";
import { METERS_PER_MILE } from "../logic/constants";
import ResearchSearchEstimateMap from "./ResearchSearchEstimateMap";
import { Grid } from "utils/demographics";
import ConfirmationDialog from "components/utils/confirmationDialog";
import { DocumentSnapshot, FieldPath, updateDoc } from "firebase/firestore";
import { ClientConfig } from "types/user";

interface ResearchCoverageProps {
  dataMaps: DataMaps;
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}

const ResearchCoverage: React.FC<ResearchCoverageProps> = ({
  dataMaps,
  userConfigSnapshot,
}) => {
  const searches = userConfigSnapshot?.data()?.searches;
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMeters, setSearchRadiusMeters] = React.useState(0);
  const [cityName, setCityName] = React.useState("");
  const [cityCenter, setCityCenter] = React.useState({
    latitude: 0,
    longitude: 0,
  });
  const [searchBudget, setSearchBudget] = React.useState(0);
  const [costResults, setCostResults] = React.useState<CostResults>({
    numberOfSquares: 0,
    totalCost: 0,
    searchBlockArea: 0,
    totalAreaMeters: 0,
    searchRadiusMiles: 0,
  });
  const [grid, setGrid] = React.useState<Grid>([]);

  const [displayResearchResults, setDisplayResearchResults] =
    React.useState(false);
  const [displaySearchMap, setDisplaySearchMap] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  if (!searches) {
    return <CircularProgress />;
  }

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
    setGrid([]);
    setCityName("");
    setCityCenter({ latitude: 0, longitude: 0 });
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
    setGrid(gridSearchResults.grid);
    setCityCenter(gridSearchResults.cityCenter);
    setDisplayResearchResults(true);
  };

  const handleTriggerSearchButtonClick = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = () => {
    console.log("Triggering search");
    updateDoc(userConfigSnapshot.ref, new FieldPath("searchContext"), {
      city: cityName,
      cityCenter: cityCenter,
      radiusMiles: costResults.searchRadiusMiles,
      totalCost: costResults.totalCost,
      numberOfSquares: costResults.numberOfSquares,
      gridWidthMeters: costResults.searchBlockArea,
      triggerSearch: true,
      autoUpload: true,
      costResults: searchBudget,
      maxCostPerCity: costPerSearch,
    });
    setButtonDisabled(true);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 10000);
    setOpenDialog(false);
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
          <Button
            variant="contained"
            component="label"
            disabled={buttonDisabled}
            onClick={handleTriggerSearchButtonClick}
            sx={{ marginBottom: "16px", width: "20%" }}
          >
            Kick off Search
          </Button>
          <ConfirmationDialog
            open={openDialog}
            onClose={handleDialogClose}
            onConfirm={handleDialogConfirm}
            message="Are you sure you want to proceed? This will make Google API calls and may incur costs."
          />
        </Box>
      )}
    </>
  );
};

export default ResearchCoverage;
