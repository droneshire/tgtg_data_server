import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { CsvDataRow } from "workers/csvWorker";

export type DataMap = Map<string, CsvDataRow[]>;

export interface DataMaps {
  storeMap: DataMap;
  dateMap: DataMap;
}

interface CsvUploaderProps {
  onUpload?: (dataMaps: DataMaps) => void;
}

const storeNameKey = "store_name";
const dateNameKey = "timestamp";

const transformData = (data: CsvDataRow[]): DataMaps => {
  const storeMap = new Map();
  const dateMap = new Map();

  data.forEach((row) => {
    const storeName = row[storeNameKey];
    const timestamp = row[dateNameKey];

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

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const data = e.data;
        const parsedData = transformData(data);

        onUpload?.(parsedData);
        setParsing(false);
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
      </>
    </div>
  );
};

export default CsvDataUploader;
