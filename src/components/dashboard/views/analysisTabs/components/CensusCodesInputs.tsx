import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { useState } from "react";
import { validCensusYears } from "utils/us_census";

type CensusCodesInputsProps = {
  onYearSelect: (event: SelectChangeEvent<string>) => void;
  onTypeSelect: (event: SelectChangeEvent<string>) => void;
  disabled: boolean;
};

export enum SearchType {
  GROUP = "By Group",
  VARIABLE = "By Variable",
}

const CensusCodesInputs: React.FC<CensusCodesInputsProps> = ({
  onYearSelect,
  onTypeSelect,
  disabled,
}) => {
  const [searchYear, setSearchYear] = useState<number>(
    validCensusYears[validCensusYears.length - 1]
  );
  const [searchType, setSearchType] = useState<string>(SearchType.GROUP);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSearchYear(parseInt(event.target.value));
    onYearSelect(event);
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setSearchType(event.target.value);
    onTypeSelect(event);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
          marginBottom: "16px",
        }}
      >
        <Select
          value={searchYear.toString()}
          disabled={disabled}
          onChange={handleYearChange}
          labelId="yea1-select"
          id="year-select"
          sx={{ width: "100px" }}
        >
          {validCensusYears.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={searchType}
          disabled={disabled}
          onChange={handleTypeChange}
          labelId="type-select"
          id="type-select"
          sx={{ width: "150" }}
        >
          {Object.values(SearchType).map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </>
  );
};

export default CensusCodesInputs;
