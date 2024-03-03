import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import USCensusAPI from "utils/us_census";
import { ClientConfig } from "types/user";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";

interface CensusInformationProps {
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}

interface CensusCodeRow {
  id: number;
  censusCode: string;
  codeDescription: string;
}

interface CensusGroupRow {
  id: number;
  censusCode: string;
  codeDescription: string;
  groupUniverse: string;
}

enum SearchType {
  GROUP = "By Group",
  VARIABLE = "By Variable",
}

const CensusInformation: React.FC<CensusInformationProps> = (props) => {
  const MAX_SELECTIONS = 25;
  const census = useMemo(() => new USCensusAPI(), []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchYear, setSearchYear] = useState<number>(2022);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.GROUP);
  const [censusCodeRows, setCensusCodeRows] = useState<any[]>([]);
  const [censusCodeColumns, setCensusCodeColumns] = useState<GridColDef[]>([]);
  const [selectedCensusCodes, setSelectedCensusCodes] = useState<
    Map<string, string>
  >(new Map());

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
          { field: "censusCode", headerName: "Group Code", width: 150 },
          {
            field: "groupUniverse",
            headerName: "Census Group Universe",
            width: 200,
          },
          {
            field: "codeDescription",
            headerName: "Census Group Description",
            flex: 1,
          },
        ];
        const rows: CensusGroupRow[] = Array.from(groupInfo.entries())
          .reduce(
            (acc: CensusGroupRow[], [censusCode, groupDetails], index) => {
              if (censusCode === "ucgid") {
                return acc;
              }
              acc.push({
                id: index,
                censusCode,
                codeDescription: groupDetails.description,
                groupUniverse: groupDetails.universe,
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

    getCensusCodeGroups();
  }, [memoizedSearchYear, memoizedSearchType]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSelectionChange = (selection: any[]) => {
    if (selection.length > MAX_SELECTIONS) {
      setIsDialogOpen(true);
      selection = selection.slice(0, MAX_SELECTIONS);
    }

    const selectedCodes = selection.reduce((map, index) => {
      const censusCode = censusCodeRows[index]?.censusCode;
      const codeDescription = censusCodeRows[index]?.codeDescription;
      if (censusCode && codeDescription) {
        map[censusCode] = codeDescription;
      }
      return map;
    }, {} as Record<string, string>);
    setSelectedCensusCodes(selectedCodes);
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

  const handleButtonClick = () => {
    const fieldsToUpdate = {
      "searchContext.censusDetails": {
        year: searchYear,
        sourcePath: ["acs", "acs5"],
        fields: selectedCensusCodes,
      },
    };
    updateDoc(props.userConfigSnapshot.ref, fieldsToUpdate);
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
        <>
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
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleButtonClick}
            sx={{ marginTop: "16px" }}
          >
            Add to Analysis
          </Button>
          <Dialog open={isDialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Warning</DialogTitle>
            <DialogContent>
              <p>The maximum number of selections is {MAX_SELECTIONS}.</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>OK</Button>
            </DialogActions>
          </Dialog>
          ;
        </>
      )}
    </>
  );
};

export default CensusInformation;
