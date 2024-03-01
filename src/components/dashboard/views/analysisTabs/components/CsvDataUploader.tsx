import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { CsvDataRow } from "workers/csvWorker";
import { HEADER_TITLES } from "utils/constants";
import FirestoreFileSelect from "./FirestoreFileSelect";

export type DataMap = Map<string, CsvDataRow[]>;

export interface DataMaps {
  storeMap: DataMap;
  dateMap: DataMap;
}

interface CsvUploaderProps {
  onUpload?: (dataMaps: DataMaps) => void;
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

const CsvDataUploader: React.FC<CsvUploaderProps> = ({ onUpload }) => {
  const [parsing, setParsing] = useState(false);

  // Firebase Storage related items
  const [fireStoreData, setFireStoreData] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  const handleMenuItemClick = (fileData: string) => () => {
    setFireStoreData(fileData);
    console.log("Selected file: ", fileData);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    setFireStoreData("");
  };

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const data = e.data;
        const parsedData = transformData(data);
        setParsing(false);
        setFireStoreData("");

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
          <FirestoreFileSelect
            handleOnClick={handleMenuItemClick}
            directoryName="ryeager12@gmail.com"
            disabled={parsing}
          />
        </Box>
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
