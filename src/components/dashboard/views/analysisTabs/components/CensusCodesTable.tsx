import React, { useState } from "react";

import { Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { CensusDetails } from "types/user";

interface CensusCodesTableProps {
  censusCodeDetails: CensusDetails;
}
interface CensusVariablesCodeRow {
  id: number;
  censusCode: string;
  codeType: string;
  codeDescription: string;
}

const CensusCodesTable: React.FC<CensusCodesTableProps> = (props) => {
  const { censusCodeDetails } = props;
  const codesInfo = censusCodeDetails.fields;

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "censusCode", headerName: "Census Code", width: 150 },
    {
      field: "codeType",
      headerName: "Type",
      width: 150,
    },
    {
      field: "codeDescription",
      headerName: "Census Code Description",
      flex: 1,
    },
  ];

  const rows: CensusVariablesCodeRow[] = Array.from(Object.entries(codesInfo))
    .reduce(
      (acc: CensusVariablesCodeRow[], [censusCode, codeDescription], index) => {
        if (censusCode === "ucgid") {
          return acc;
        }
        const cleanedCodeDescription = codeDescription.replace(/!!/g, " ");
        let codeType = "Group";
        if (censusCode.includes("_")) {
          codeType = "Variable";
        }
        acc.push({
          id: index,
          censusCode,
          codeType: codeType,
          codeDescription: cleanedCodeDescription,
        });
        return acc;
      },
      []
    )
    .sort((a, b) => a.censusCode.localeCompare(b.censusCode));

  return (
    <>
      <DataGrid
        sx={{ height: "100%", width: "100%" }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 50]}
      />
    </>
  );
};

export default CensusCodesTable;
