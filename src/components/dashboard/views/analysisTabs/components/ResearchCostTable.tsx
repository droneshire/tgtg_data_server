import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import React from "react";
import { CostResults } from "../logic/places_coverage";
import { DEFAULT_PROMPTS } from "../logic/constants";

interface ResearchCostTableProps {
  costResults: CostResults;
}

const ResearchCostTable: React.FC<ResearchCostTableProps> = (props) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const costResults = props.costResults;

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead
            style={{
              backgroundColor: mainColor,
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  color: "white",
                },
              }}
            >
              <TableCell> Description </TableCell>
              <TableCell> Value </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Estimated Total Cost</TableCell>
              <TableCell>${costResults.totalCost.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Estimated Searches</TableCell>
              <TableCell>
                {Number(
                  costResults.numberOfSquares.toFixed(0)
                ).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Single Search Box Width (m)</TableCell>
              <TableCell>
                {Number(
                  Math.sqrt(costResults.searchBlockArea).toFixed(2)
                ).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Estimated Coverage (m²)</TableCell>
              <TableCell>
                {Number(
                  costResults.totalAreaMeters.toFixed(0)
                ).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Actual Search Radius (mi)</TableCell>
              <TableCell>
                {Number(
                  costResults.searchRadiusMiles.toFixed(2)
                ).toLocaleString()}
              </TableCell>
            </TableRow>
            <TableRow
              sx={{
                marginLeft: "1rem",
                "& > *": {
                  textAlign: "left",
                },
              }}
            >
              <TableCell>Search Prompts (run on each grid)</TableCell>
              <TableCell>{DEFAULT_PROMPTS.join(", ")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ResearchCostTable;
