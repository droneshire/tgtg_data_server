import React from "react";

import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/system";

import countryCodesList from "utils/country_codes";

// Styled component for the code element
const Code = styled("span")(({ theme }) => ({
  // Add your custom styles for the code element
  // For example:
  width: "80px",
  marginRight: theme.spacing(1),
}));

// Styled component for the divider element
const Divider = styled("div")(({ theme }) => ({
  // Add your custom styles for the divider element
  // For example:
  borderLeft: "1px solid black",
  flex: "1",
  height: "100%",
  marginRight: theme.spacing(1),
}));

export default function SimpleCountryCodeSelect(props: FormControlProps) {
  const [countryCode, setCountryCode] = React.useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setCountryCode(event.target.value as string);
    console.log(event.target.value);
  };

  return (
    <FormControl {...props}>
      <InputLabel>Country Code</InputLabel>
      <Select
        labelId="country-code-select-label"
        id="country-code-select"
        value={countryCode}
        label="Country Code"
        onChange={handleChange}
        renderValue={(selected) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Code>{selected}</Code>
          </div>
        )}
      >
        {countryCodesList.map(({ value, code, name }) => (
          <MenuItem key={value} value={code}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Code>{code}</Code>
              <Divider />
              <span>{name}</span>
            </div>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
