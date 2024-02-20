import {
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

interface ResearchParameterInputs {
  cityName: string;
  costPerSearch: number;
  searchRadiusMiles: number;
}

interface ResearchParameterInputsProps {
  onClick: (inputs: ResearchParameterInputs) => void;
}

const ResearchParameterInputs: React.FC<ResearchParameterInputsProps> = (
  props
) => {
  const [costPerSearch, setCostPerSearch] = React.useState(0.005);
  const [searchRadiusMiles, setSearchRadiusMiles] = React.useState(20.0);
  const [cityName, setCityName] = React.useState("");

  const onButtonClick = () => {
    props.onClick({
      cityName,
      costPerSearch,
      searchRadiusMiles,
    });
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
    <Box
      sx={{
        flex: 1,
        display: "flex",
        minWidth: "150px",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography id="city-name" gutterBottom sx={{ marginBottom: "16px" }}>
        City Name
      </Typography>
      <TextField
        id="city-name"
        label="City Name"
        onChange={(event) => {
          setCityName(event.target.value);
        }}
        sx={{ marginBottom: "16px" }}
      />
      <Typography id="radius-slider" gutterBottom sx={{ marginBottom: "16px" }}>
        Desired Search Radius (mi)
      </Typography>
      <Slider
        value={searchRadiusMiles}
        onChange={handleRadiusChange}
        min={1.0}
        max={20.0}
        step={0.5}
        aria-labelledby="radius-slider"
        valueLabelDisplay="auto"
        sx={{ marginBottom: "16px", width: "300px" }}
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
        onClick={onButtonClick}
        sx={{ marginBottom: "16px" }}
      >
        Analyze
      </Button>
    </Box>
  );
};

export default ResearchParameterInputs;
