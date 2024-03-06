import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  Box,
  Button,
  CircularProgress,
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
  GridCallbackDetails,
  GridCellParams,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
  MuiEvent,
} from "@mui/x-data-grid";
import USCensusAPI, {
  CensusGroupDataType,
  CensusVariablesDataType,
} from "utils/us_census";
import { CensusDetails, CensusFields, ClientConfig } from "types/user";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";
import { useAsyncAction } from "hooks/async";
import CensusGroupModal, { CensusVariablesCodeRow } from "./CensusGroupModal";
import CensusCodesInputs, { SearchType } from "./CensusCodesInputs";
import CensusCodeChips from "./CensusCodeChips";

interface CensusInformationProps {
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}

interface CensusGroupRow {
  id: number;
  censusCode: string;
  codeDescription: string;
  groupUniverse: string;
}

const getSearchTypeFromText = (text: string): SearchType | undefined => {
  const searchTypes = Object.values(SearchType);
  const searchType = searchTypes.find((type) => type === text);
  return searchType as SearchType;
};

const MAX_SELECTIONS = 200;

const groupColumns: GridColDef[] = [
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

const variablesColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "censusCode", headerName: "Census Code", width: 150 },
  {
    field: "codeDescription",
    headerName: "Census Code Description",
    flex: 1,
  },
];

const CensusInformation: React.FC<CensusInformationProps> = (props) => {
  const census = useMemo(() => new USCensusAPI(), []);
  const lastClickWasOnCheckbox = useRef(false);

  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  const [searchYear, setSearchYear] = useState<number>(2022);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.GROUP);
  const [searchText, setSearchText] = useState<string>("");

  const [censusCodeRows, setCensusCodeRows] = useState<any[]>([]);
  const [filteredCensusCodeRows, setFilteredCensusCodeRows] = useState<any[]>(
    []
  );
  const [censusCodeColumns, setCensusCodeColumns] = useState<GridColDef[]>([]);
  const [censusVariablesRows, setCensusVariablesRows] = useState<
    CensusVariablesCodeRow[]
  >([]);
  const [censusGroupRows, setCensusGroupRows] = useState<CensusGroupRow[]>([]);
  const [censusVariablesColumns, setCensusVariablesColumns] = useState<
    GridColDef[]
  >([]);
  const [censusGroupColumns, setCensusGroupColumns] = useState<GridColDef[]>(
    []
  );

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>("");

  // Hold the cached data for the census variables and groups
  const [censusVariablesInfo, setCensusVariablesInfo] =
    useState<CensusVariablesDataType>(new Map());
  const [censusGroupInfo, setCensusGroupInfo] = useState<CensusGroupDataType>(
    new Map()
  );

  // Data to be sent to the server upon clicking the "Add to Analysis" button
  const [selectedCensusCodes, setSelectedCensusCodes] = useState<CensusFields>(
    {}
  );

  const memoizedSearchYear = useMemo(() => searchYear, [searchYear]);
  const memoizedSearchType = useMemo(() => searchType, [searchType]);

  // Update the user's configuration with the selected census codes
  // this provides a callback function that can be called to update the user's configuration
  const { runAction: update, running: updating } = useAsyncAction(
    (details: CensusDetails) => {
      const fieldsToUpdate = {
        "searchContext.censusDetails": details,
      };
      updateDoc(props.userConfigSnapshot.ref, fieldsToUpdate);
    }
  );

  // Load/cache the data from the US Census API
  useEffect(() => {
    const loadCensusVariablesData = async () => {
      const isModalOpen = isRowClicked;
      const isSearchVariable = memoizedSearchType !== SearchType.VARIABLE;
      if (!isModalOpen && !isSearchVariable) {
        return;
      }

      setIsLoading(true);

      try {
        const data: CensusVariablesDataType = await census.getAllVariables(
          memoizedSearchYear,
          ["acs", "acs5"]
        );
        setCensusVariablesInfo(data);
      } catch (error) {
        console.error("Failed to fetch census codes", error);
      } finally {
        setIsLoading(false);
        setSearchText("");
      }
    };

    loadCensusVariablesData();
  }, [memoizedSearchYear, memoizedSearchType, isRowClicked]);

  // Load/cache the data from the US Census API
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
        setCensusGroupInfo(groupInfo);
      } catch (error) {
        console.error("Failed to fetch census codes", error);
      } finally {
        setIsLoading(false);
        setSearchText("");
      }
    };

    getCensusCodeGroups();
  }, [memoizedSearchYear, memoizedSearchType]);

  // Table data for Variables type
  useEffect(() => {
    // we offset the id by the number of groups so that
    // the ids don't overlap between the groups and variables
    // and selections can be remembered between the two
    const idOffset = censusGroupInfo.size;

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
          const cleanedCodeDescription = codeDescription.replace(/!!/g, " ");
          acc.push({
            id: index + idOffset,
            censusCode,
            codeDescription: cleanedCodeDescription,
          });
          return acc;
        },
        []
      )
      .sort((a, b) => a.censusCode.localeCompare(b.censusCode));
    setCensusVariablesRows(rows);
    setCensusVariablesColumns(variablesColumns);
  }, [censusVariablesInfo]);

  // Table data for Groups type
  useEffect(() => {
    const rows: CensusGroupRow[] = Array.from(censusGroupInfo.entries())
      .reduce((acc: CensusGroupRow[], [censusCode, groupDetails], index) => {
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
      }, [])
      .sort((a, b) => a.censusCode.localeCompare(b.censusCode));
    setCensusGroupRows(rows);
    setCensusGroupColumns(groupColumns);
    // this is a bit of a hack to display the group data the first time
    // the component is rendered before the type select handle is called
    // since that manages all of the code rows and code columns
    if (memoizedSearchType === SearchType.GROUP) {
      setCensusCodeRows(censusGroupRows);
      setCensusCodeColumns(censusGroupColumns);
    }
  }, [censusGroupInfo]);

  useEffect(() => {
    setFilteredCensusCodeRows(censusCodeRows);
  }, [censusCodeRows]);

  const addAndRemoveSelectedCensusCodes = (
    newSelectionModel: GridRowSelectionModel
  ) => {
    const added = newSelectionModel.filter(
      (id) => !selectionModel.includes(id)
    );
    const removed = selectionModel.filter(
      (id) => !newSelectionModel.includes(id)
    );

    const newSelectedCensusCodes = { ...selectedCensusCodes };

    // Add variables for newly selected groups
    added.forEach((id) => {
      const row = censusCodeRows.find((row) => row.id === id);
      if (row) {
        let variables;
        if (memoizedSearchType === SearchType.GROUP) {
          variables = censusVariablesByGroup(row.censusCode);
        } else {
          variables = new Map([[row.censusCode, row.codeDescription]]);
        }
        variables.forEach((codeDescription, censusCode) => {
          newSelectedCensusCodes[censusCode] = codeDescription;
        });
      }
    });

    // Remove variables for deselected groups
    removed.forEach((id) => {
      const row = censusCodeRows.find((row) => row.id === id);
      if (row) {
        let variables;
        if (memoizedSearchType === SearchType.GROUP) {
          variables = censusVariablesByGroup(row.censusCode);
        } else {
          variables = new Map([[row.censusCode, row.codeDescription]]);
        }
        variables.forEach((codeDescription, censusCode) => {
          delete newSelectedCensusCodes[censusCode];
        });
      }
    });

    setSelectedCensusCodes({ ...newSelectedCensusCodes });
  };

  // This is a memoized function that returns the census variables for a given group
  // which is simply based on the prefix of the census code matching the group code
  const censusVariablesByGroup = useMemo(() => {
    const getCensusVariablesByGroup = (groupCode: string) => {
      const filteredInfo: CensusVariablesDataType = new Map();
      for (const [censusCode, codeDescription] of Array.from(
        censusVariablesInfo
      )) {
        const prefix = censusCode.split("_")[0];
        if (prefix === groupCode && censusCode !== "ucgid") {
          filteredInfo.set(censusCode, codeDescription);
        }
      }
      return filteredInfo;
    };

    return getCensusVariablesByGroup;
  }, [censusVariablesInfo]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Handle the selection/deletion of items from the DataGrid
  // This handles complex selections and deselections, such as when
  // a group is selected and all of its variables are added to the selection
  const handleRowSelectionModelChange = (
    newSelectionModel: GridRowSelectionModel
  ) => {
    if (
      !lastClickWasOnCheckbox.current &&
      memoizedSearchType === SearchType.GROUP
    ) {
      return;
    }

    if (newSelectionModel.length > MAX_SELECTIONS) {
      setIsDialogOpen(true);
      return;
    }

    addAndRemoveSelectedCensusCodes(newSelectionModel);
    setSelectionModel(newSelectionModel);
  };

  // Handle when the DataGrid row gets clicked or the checkbox gets clicked
  const handleCellClick = (
    params: GridCellParams,
    event: MuiEvent,
    details: GridCallbackDetails
  ) => {
    // Check if the click was on the checkbox
    const isCheckboxClick = params.field === "__check__";
    lastClickWasOnCheckbox.current = isCheckboxClick;

    if (memoizedSearchType === SearchType.GROUP) {
      setSelectedGroupCode(params.row.censusCode);
      if (!isCheckboxClick) {
        setIsRowClicked(true);
      }
    }
  };

  // Handle deletions from the chips component
  const updateSelectedCensusCodesAfterChipChanges = (
    newSelectedCensusCodes: CensusFields
  ) => {
    setSelectedCensusCodes(newSelectedCensusCodes);
    const previousNumCodes = Object.keys(selectedCensusCodes).length;
    const newNumCodes = Object.keys(newSelectedCensusCodes).length;
    console.log("Previousy selected codes:", previousNumCodes);
    console.log("Newly selected codes:", newNumCodes);
    if (searchType === SearchType.GROUP) {
      censusGroupRows.filter((row) =>
        Object.keys(newSelectedCensusCodes).includes(row.censusCode)
      );
    } else if (searchType === SearchType.VARIABLE) {
      setSelectionModel(
        censusCodeRows
          .filter((row) =>
            Object.keys(newSelectedCensusCodes).includes(row.censusCode)
          )
          .map((row) => row.id)
      );
    }
  };

  const handleSearchTypeChange = (event: SelectChangeEvent<string>) => {
    const searchType = getSearchTypeFromText(event.target.value);
    if (searchType) {
      setSearchType(searchType);

      if (searchType === SearchType.VARIABLE) {
        setCensusCodeRows(censusVariablesRows);
        setCensusCodeColumns(censusVariablesColumns);

        // simply select all the selected variables if the search type is changed to variable
        setSelectionModel(
          censusVariablesRows
            .filter((row) =>
              Object.keys(selectedCensusCodes).includes(row.censusCode)
            )
            .map((row) => row.id)
        );
      } else if (searchType === SearchType.GROUP) {
        setCensusCodeRows(censusGroupRows);
        setCensusCodeColumns(censusGroupColumns);

        const newSelectionModel: GridRowSelectionModel = [];

        // select all the groups that correspond to the selected variables
        Object.entries(selectedCensusCodes).forEach(
          (item: [string, string]) => {
            const [code, value] = item;
            const group = code.split("_")[0];
            newSelectionModel.push(
              ...censusGroupRows
                .filter((row) => row.censusCode === group)
                .map((row) => row.id)
            );
          }
        );
        setSelectionModel(newSelectionModel);
      }
      console.log("Search type changed to", searchType);
    } else {
      console.error("Invalid search type");
      setSearchType(SearchType.GROUP);
    }
  };

  const handleSearchYearChange = (event: SelectChangeEvent<string>) => {
    setSearchYear(parseInt(event.target.value, 10));
    setSelectedGroupCode("");
    setSelectedCensusCodes({});
    setSelectionModel([]);
    setSearchText("");
  };

  // Handle the "Add to Analysis" button click, this submits it to the database
  const handleButtonClick = () => {
    update({
      year: searchYear,
      sourcePath: ["acs", "acs5"].join("/"),
      fields: selectedCensusCodes,
    });
    setSelectionModel([]);
    setIsUpdating(true);
    setSelectedGroupCode("");
    setTimeout(() => {
      setIsUpdating(false);
    }, 10000);
  };

  // Handle the search bar input
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

  // Handle the modal closing
  const handleModalClosed = (selectedVariables: CensusFields) => {
    setIsRowClicked(false);
    if (modalSubmitted) {
      setModalSubmitted(false);
    }
  };

  // Handle the modal submit
  const handleModalSubmit = (selectedVariables: CensusFields) => {
    const selectedGroupSelectionId = censusGroupRows.find(
      (row) => row.censusCode === selectedGroupCode
    )?.id;

    console.log("Selected variables:", selectedVariables);
    console.log("Selected group selection id:", selectedGroupSelectionId);
    console.log("Selected group code:", selectedGroupCode);

    let newSelectionModel: Set<GridRowId> = new Set(selectionModel);

    if (selectedGroupSelectionId) {
      const selectedVariablesSize = Object.keys(selectedVariables).length;

      if (selectedVariablesSize > 0) {
        console.log("Adding group selection id to selection model");
        newSelectionModel.add(selectedGroupSelectionId);
      } else {
        console.log("Deleting group selection id from selection model");
        newSelectionModel.delete(selectedGroupSelectionId);
      }
    }

    const removed = Object.keys(selectedCensusCodes).filter(
      (code) => !Object.keys(selectedVariables).includes(code)
    );
    const added = Object.keys(selectedVariables).filter(
      (code) => !Object.keys(selectedCensusCodes).includes(code)
    );

    console.log("Added:", added);
    console.log("Removed:", removed);

    let newSelectedCensusCodes = { ...selectedCensusCodes };

    added.forEach((code) => {
      newSelectedCensusCodes[code] = selectedVariables[code];
    });

    removed.forEach((code) => {
      delete newSelectedCensusCodes[code];
    });

    setSelectedCensusCodes(newSelectedCensusCodes);

    setSelectionModel(Array.from(newSelectionModel));
    setModalSubmitted(true);
    setIsRowClicked(false);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Census Codes
      </Typography>
      <CensusCodesInputs
        onYearSelect={handleSearchYearChange}
        onTypeSelect={handleSearchTypeChange}
        disabled={isLoading || isUpdating}
      />
      {isLoading ? (
        <Box display="flex" justifyContent="center" marginTop="16px">
          <div>
            <CircularProgress />
          </div>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
            onCellClick={handleCellClick}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={handleRowSelectionModelChange}
          />
          <CensusGroupModal
            open={isRowClicked}
            onClose={handleModalClosed}
            onSave={handleModalSubmit}
            groupCode={selectedGroupCode}
            variablesData={censusVariablesByGroup(selectedGroupCode)}
            initSelectedVariables={selectedCensusCodes}
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
          <CensusCodeChips
            data={selectedCensusCodes}
            onChange={updateSelectedCensusCodesAfterChipChanges}
          />
          <Dialog open={isDialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Warning</DialogTitle>
            <DialogContent>
              <p>The maximum number of selections is {MAX_SELECTIONS}.</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>OK</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default CensusInformation;
