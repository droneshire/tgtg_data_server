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
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import USCensusAPI, {
  CensusGroupDataType,
  CensusVariablesDataType,
} from "utils/us_census";
import { CensusDetails, ClientConfig } from "types/user";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";
import { useAsyncAction } from "hooks/async";
import CensusGroupModal, { CensusVariablesCodeRow } from "./CensusGroupModal";

interface CensusInformationProps {
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
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
  const MAX_SELECTIONS = 200;
  const census = useMemo(() => new USCensusAPI(), []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchYear, setSearchYear] = useState<number>(2022);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.GROUP);
  const [censusCodeRows, setCensusCodeRows] = useState<any[]>([]);
  const [filteredCensusCodeRows, setFilteredCensusCodeRows] = useState<any[]>(
    []
  );
  const [censusCodeColumns, setCensusCodeColumns] = useState<GridColDef[]>([]);
  const [selectedCensusCodes, setSelectedCensusCodes] = useState<
    Record<string, string>
  >({});
  const [searchText, setSearchText] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const memoizedSearchYear = useMemo(() => searchYear, [searchYear]);
  const memoizedSearchType = useMemo(() => searchType, [searchType]);

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );
  const [rowIsClicked, setIsRowClicked] = useState<boolean>(false);

  const { runAction: update, running: updating } = useAsyncAction(
    (details: CensusDetails) => {
      const fieldsToUpdate = {
        "searchContext.censusDetails": details,
      };
      updateDoc(props.userConfigSnapshot.ref, fieldsToUpdate);
    }
  );

  useEffect(() => {
    const getCensusCodeData = async () => {
      const isModalOpen = rowIsClicked;
      if (memoizedSearchType !== SearchType.VARIABLE) {
        return;
      }
      setIsLoading(true);
      try {
        const censusVariablesInfo: CensusVariablesDataType =
          await census.getAllVariables(memoizedSearchYear, ["acs", "acs5"]);
        const columns: GridColDef[] = [
          { field: "id", headerName: "ID", width: 70 },
          { field: "censusCode", headerName: "Census Code", width: 150 },
          {
            field: "codeDescription",
            headerName: "Census Code Description",
            flex: 1,
          },
        ];
        const rows: CensusVariablesCodeRow[] = Array.from(censusVariablesInfo)
          .reduce(
            (
              acc: CensusVariablesCodeRow[],
              [censusCode, codeDescription],
              index
            ) => {
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
        setSearchText("");
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
        const groupInfo: CensusGroupDataType = await census.getAllGroups(
          memoizedSearchYear,
          ["acs", "acs5"]
        );
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
        setSearchText("");
      }
    };

    getCensusCodeGroups();
  }, [memoizedSearchYear, memoizedSearchType]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleRowClick = (params: any, event: React.MouseEvent) => {
    if (params.field === "__check__") {
      if (selectionModel.length >= MAX_SELECTIONS) {
        setIsDialogOpen(true);
        return;
      }
      const selectionExists = selectionModel.includes(params.id);
      const newSelectionModel = selectionExists
        ? selectionModel.filter((id) => id !== params.id) // Unselect
        : [...selectionModel, params.id]; // Select

      setSelectionModel(newSelectionModel);
    } else {
      setIsRowClicked(true);
    }

    // Prevent row selection when clicking on other cells
    event.stopPropagation();
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
    update({
      year: searchYear,
      sourcePath: ["acs", "acs5"].join("/"),
      fields: selectedCensusCodes,
    });
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 10000);
  };

  useEffect(() => {
    setFilteredCensusCodeRows(censusCodeRows);
  }, [censusCodeRows]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);

    if (!searchValue) {
      setFilteredCensusCodeRows(censusCodeRows);
      return;
    }

    const filteredRows = censusCodeRows.filter((row) => {
      return row.codeDescription
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });
    setFilteredCensusCodeRows(filteredRows);
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
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            value={searchText}
            onChange={handleSearch}
            fullWidth
            sx={{ mb: 2 }}
          />
          <DataGrid
            sx={{ height: "100%" }}
            rows={filteredCensusCodeRows}
            columns={censusCodeColumns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 50, 100]}
            checkboxSelection
            onRowSelectionModelChange={(newModel) =>
              setSelectionModel(newModel)
            }
            onCellClick={handleRowClick}
          />
          <CensusGroupModal
            open={rowIsClicked}
            onClose={() => setIsRowClicked(false)}
            groupCode="B01001"
            variablesData={selectedCensusCodes}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={updating || isUpdating}
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
        </>
      )}
    </>
  );
};

export default CensusInformation;
