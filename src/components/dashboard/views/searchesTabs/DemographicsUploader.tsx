import React, { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { isValidAddress } from "utils/validators";
import Papa from "papaparse";
import { useAsyncAction } from "hooks/async";

export type StoreStats = Map<string, number>;

interface DemographicsUploaderProps {
  onUpload?: (storeCount: StoreStats) => void;
}

const DemographicsUploader: React.FC<DemographicsUploaderProps> = ({
  onUpload,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const clearAfterTimeout: boolean = false;
  const [storeNames, setStoreNames] = useState<StoreStats>(new Map());

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const parsedData = e.data;
        onUpload?.(parsedData);
      });

      worker.addEventListener("error", (e: ErrorEvent) => {
        console.error("Error in worker: ", e.message);
      });

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          worker.postMessage(event.target.result.toString());
        }
      };
      reader.readAsText(file);
    } else {
      console.warn("Your browser does not support Web Workers.");
    }
  };

  useEffect(() => {
    if (!clearAfterTimeout) {
      return;
    }
    // Only set the timeout if there are items in the address.
    if (storeNames.entries.length > 0) {
      const timeout = setTimeout(() => {
        setStoreNames(new Map());
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 30000);

      // Cleanup function to clear the timeout.
      return () => clearTimeout(timeout);
    }
  }, [storeNames, setStoreNames]);

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
        <Button variant="contained" component="label">
          Upload File
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

export default DemographicsUploader;
