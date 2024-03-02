import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import USCensusAPI from "utils/us_census";

interface CensusInformationProps {
  // Define the props for the component here
}

interface CensusCodeRow {
  id: number;
  censusCode: string;
  codeDescription: string;
}

interface CensusGroupRow {
  id: number;
  groupCode: string;
  groupDescription: string;
  groupUniverse: string;
}

enum SearchType {
  GROUP = "By Group",
  VARIABLE = "By Variable",
}

const CensusInformation: React.FC<CensusInformationProps> = (props) => {
  const census = useMemo(() => new USCensusAPI(), []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchYear, setSearchYear] = useState<number>(2022);

  const [searchType, setSearchType] = useState<SearchType>(SearchType.GROUP);
  const [censusCodeRows, setCensusCodeRows] = useState<any[]>([]);
  const [censusCodeColumns, setCensusCodeColumns] = useState<GridColDef[]>([]);

  const memoizedSearchYear = useMemo(() => searchYear, [searchYear]);
  const memoizedSearchType = useMemo(() => searchType, [searchType]);

  useEffect(() => {
    const getCensusCodeData = async () => {
      if (memoizedSearchType !== SearchType.VARIABLE) {
        return;
      }
      setIsLoading(true);
      try {
        const codesInfo = await census.getAllDescriptions(memoizedSearchYear, [
          "acs",
          "acs5",
        ]);
        const columns: GridColDef[] = [
          { field: "id", headerName: "ID", width: 70 },
          { field: "censusCode", headerName: "Census Code", width: 150 },
          {
            field: "codeDescription",
            headerName: "Census Code Description",
            width: 400,
          },
        ];
        const rows: CensusCodeRow[] = Array.from(codesInfo)
          .reduce(
            (acc: CensusCodeRow[], [censusCode, codeDescription], index) => {
              if (censusCode === "ucgid") {
                return acc;
              }
              const cleanedCodeDescription = codeDescription.replace(
                /!!/g,
                " "
              );
              acc.push({
                id: index,
                censusCode,
                codeDescription: cleanedCodeDescription,
              });
              return acc;
            },
            []
          )
          .sort((a, b) => a.censusCode.localeCompare(b.censusCode));
        setCensusCodeRows(rows);
        setCensusCodeColumns(columns);
      } catch (error) {
        console.error("Failed to fetch census codes", error);
      } finally {
        setIsLoading(false);
      }
    };

    getCensusCodeData();
  }, [memoizedSearchYear, memoizedSearchType]);

  useEffect(() => {
    const getCensusCodeGroups = async () => {
      if (memoizedSearchType !== SearchType.GROUP) {
        return;
      }
      setIsLoading(true);
      try {
        const groupInfo = await census.getAllGroups(memoizedSearchYear, [
          "acs",
          "acs5",
        ]);
        const columns: GridColDef[] = [
          { field: "id", headerName: "ID", width: 70 },
          { field: "groupCode", headerName: "Group Code", width: 150 },
          {
            field: "groupDescription",
            headerName: "Census Group Description",
            width: 400,
          },
          {
            field: "groupUniverse",
            headerName: "Census Group Universe",
            width: 200,
          },
        ];
        const rows: CensusGroupRow[] = Array.from(groupInfo.entries())
          .reduce((acc: CensusGroupRow[], [groupCode, groupDetails], index) => {
            if (groupCode === "ucgid") {
              return acc;
            }
            acc.push({
              id: index,
              groupCode,
              groupDescription: groupDetails.description,
              groupUniverse: groupDetails.universe,
            });
            return acc;
          }, [])
          .sort((a, b) => a.groupCode.localeCompare(b.groupCode));
        setCensusCodeRows(rows);
        setCensusCodeColumns(columns);
      } catch (error) {
        console.error("Failed to fetch census codes", error);
      } finally {
        setIsLoading(false);
      }
    };

    getCensusCodeGroups();
  }, [memoizedSearchYear, memoizedSearchType]);

  const handleSelectionChange = (selection: any[]) => {
    const selectedCodes = selection.map(
      (index) => censusCodeRows[index]?.censusCode
    );
  };

  const getSearchTypeFromText = (text: string): SearchType | undefined => {
    const searchTypes = Object.values(SearchType);
    const searchType = searchTypes.find((type) => type === text);
    return searchType as SearchType;
  };

  const handleSearchTypeChange = (event: SelectChangeEvent<string>) => {
    const searchType = getSearchTypeFromText(event.target.value);
    if (searchType) {
      setSearchType(searchType);
    } else {
      console.error("Invalid search type");
      setSearchType(SearchType.GROUP);
    }
  };

  const validCensusYears = [
    2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2020, 2022,
  ];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Census Codes
      </Typography>
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
          disabled={isLoading}
          onChange={(event: SelectChangeEvent<string>) => {
            setSearchYear(parseInt(event.target.value, 10));
          }}
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
          disabled={isLoading}
          onChange={handleSearchTypeChange}
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

      {isLoading ? (
        <Box display="flex" justifyContent="center" marginTop="16px">
          <div>
            <CircularProgress />
          </div>
        </Box>
      ) : (
        <DataGrid
          sx={{ height: "100%" }}
          rows={censusCodeRows}
          columns={censusCodeColumns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
        />
      )}
    </>
  );
};

export default CensusInformation;
