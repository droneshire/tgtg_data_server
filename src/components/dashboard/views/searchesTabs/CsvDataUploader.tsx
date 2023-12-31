import React, { useState } from "react";
import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";
import { CsvDataRow } from "workers/csvWorker";
import { HEADER_TITLES } from "utils/constants";

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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [parsing, setParsing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleClose = () => {
    setAlertOpen(false);
  };

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const data = e.data;
        const parsedData = transformData(data);
        setParsing(false);

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
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          worker.postMessage(event.target.result.toString());
        }
      };
      reader.readAsText(file);
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

  return (
    <div>
      <>
        <Button variant="contained" component="label" disabled={parsing}>
          {parsing ? <CircularProgress size={24} /> : "Upload File"}
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            hidden
          />
        </Button>
        <Snackbar
          open={alertOpen}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Unable to parse file
          </Alert>
        </Snackbar>
      </>
    </div>
  );
};

export default CsvDataUploader;
