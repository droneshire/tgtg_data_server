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

interface ResearchCostTableProps {
  costResults: CostResults;
}

const ResearchCostTable: React.FC<ResearchCostTableProps> = (props) => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const costResults = props.costResults;

  return (
    <>
      <Box
        sx={{
          flex: 1,
          minWidth: "250px",
          flexDirection: "column",
          width: "300px",
          alignItems: "left",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
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
                <TableCell>Estimated Cost</TableCell>
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
                <TableCell>{costResults.numberOfSquares.toFixed(0)}</TableCell>
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
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default ResearchCostTable;
