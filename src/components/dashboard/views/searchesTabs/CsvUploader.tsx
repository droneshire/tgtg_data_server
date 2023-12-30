import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { StoreStats } from "workers/csvWorker";

interface CsvUploaderProps {
  onUpload?: (storeCount: StoreStats) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [parsing, setParsing] = useState(false);

  const kickOffCsvWorker = (file: File) => {
    if (window.Worker) {
      const worker = new Worker(new URL("workers/csvWorker", import.meta.url));

      worker.addEventListener("message", (e: MessageEvent) => {
        const parsedData = e.data;
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

export default CsvUploader;
