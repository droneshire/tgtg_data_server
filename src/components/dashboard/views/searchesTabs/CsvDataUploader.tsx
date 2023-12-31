import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import { CsvDataRow } from "workers/csvWorker";
import { HEADER_TITLES } from "utils/constants";
import { SearchSpec } from "./Search";
import { ArrowDropDown } from "@mui/icons-material";
import { myStorage } from "firebaseApp";
import { ref, getDownloadURL } from "firebase/storage";

export type DataMap = Map<string, CsvDataRow[]>;

export interface DataMaps {
  storeMap: DataMap;
  dateMap: DataMap;
}

interface CsvUploaderProps {
  onUpload?: (dataMaps: DataMaps) => void;
  searchItems: SearchSpec[];
}

const transformData = (data: CsvDataRow[]): DataMaps => {
  const storeMap = new Map();
  const dateMap = new Map();

  data.forEach((row) => {
    const storeName = row[HEADER_TITLES.storeName];
    const timestamp = row[HEADER_TITLES.timeStamp];

    // make sure the row has the required fields from HEADER_TITLES
    Object.entries(HEADER_TITLES).forEach(([key, value]) => {
      const title = key;
      if (!row[title]) {
        return;
      }
    });

    if (!storeName || !timestamp) {
      return;
    }

    // grab the date from the timestamp
    const date = timestamp.split(" ")[0];

    // Create a new entry if the store name doesn't exist in the map
    if (!storeMap.has(storeName)) {
      storeMap.set(storeName, []);
    }

    // Create a new entry if the date doesn't exist in the map
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }

    // Clone the row data to avoid modifying the original data
    const rowData = { ...row };

    // Add this occurrence to the store's array
    storeMap.get(storeName).push(rowData);
    dateMap.get(date).push(rowData);
  });
  return { storeMap, dateMap };
};

const CsvDataUploader: React.FC<CsvUploaderProps> = ({
  onUpload,
  searchItems,
}) => {
  const [parsing, setParsing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // Firebase Storage related items
  const [selectedItem, setSelectedItem] = useState("");
  const [fireStoreData, setFireStoreData] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const openMenu = Boolean(menuAnchorEl);

  const handleMenuItemClick = (name: string) => () => {
    handleMenuButtonClose(name);
  };

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuButtonClose = (name: string) => {
    setMenuAnchorEl(null);
    console.log("Selected search: ", name);
    setSelectedItem(name);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const readFireStoreCsv = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      setFireStoreData(text);
    } catch (error) {
      console.error("Error reading firststore file:", error);
    }
  }, []);

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const data = e.data;
        const parsedData = transformData(data);
        setParsing(false);
        setFireStoreData("");
        setSelectedItem("");

        if (parsedData.storeMap.size === 0) {
          alert("No data found in file.");
          setAlertOpen(true);
          return;
        }
        onUpload?.(parsedData);
      });

      worker.addEventListener("error", (e: ErrorEvent) => {
        console.error("Error in worker: ", e.message);
        setParsing(false);
      });

      setParsing(true);
      if (fireStoreData === "") {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            worker.postMessage(event.target.result.toString());
          }
        };
        reader.readAsText(file);
      } else {
        worker.postMessage(fireStoreData);
      }
    } else {
      setParsing(false);
      console.warn("Your browser does not support Web Workers.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      kickOffCsvWorker(file);
    } else {
      console.error("No file selected.");
    }
  };

  useEffect(() => {
    if (selectedItem !== "") {
      console.log("Downloading file from firestore");
      const pathToStorageFile =
        "lsz.tgtg@gmail.com/tgtg_search_23a66bdf2e28ab1424c91bbf057adcba/116206.csv";
      const fileRef = ref(myStorage, pathToStorageFile);
      getDownloadURL(fileRef)
        .then((url) => {
          readFireStoreCsv(url);
        })
        .catch((error) => {
          setAlertOpen(true);
          setSelectedItem("");
          setFireStoreData("");
          console.error("Error downloading file:", error);
        });
    }
  }, [selectedItem, readFireStoreCsv]);

  useEffect(() => {
    if (fireStoreData !== "") {
      kickOffCsvWorker(new File([fireStoreData], "firestore.csv"));
    }
  }, [fireStoreData]);

  return (
    <div>
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button variant="contained" component="label" disabled={parsing}>
            {parsing ? <CircularProgress size={24} /> : "Upload File"}
            <input type="file" onChange={handleFileChange} hidden />
          </Button>
          <Typography variant="body1" gutterBottom>
            or
          </Typography>
          <Button
            id="fade-button"
            aria-controls={openMenu ? "fade-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? "true" : undefined}
            onClick={handleMenuButtonClick}
            variant="contained"
            disabled={parsing}
          >
            {parsing ? <CircularProgress size={24} /> : "Select Search"}
            <ArrowDropDown />
          </Button>
        </Box>
        <Menu
          id="fade-menu-stores"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={menuAnchorEl}
          open={openMenu}
          onClose={() => {
            handleMenuButtonClose("");
          }}
          TransitionComponent={Fade}
        >
          {searchItems.map((item, index) => (
            <MenuItem key={index} onClick={handleMenuItemClick(item.searchId)}>
              {item.searchId}
            </MenuItem>
          ))}
        </Menu>
        <Snackbar
          open={alertOpen}
          autoHideDuration={5000}
          onClose={handleAlertClose}
        >
          <Alert
            onClose={handleAlertClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            Unable to parse file
          </Alert>
        </Snackbar>
      </>
    </div>
  );
};

export default CsvDataUploader;
