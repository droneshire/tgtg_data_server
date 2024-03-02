import Papa from "papaparse";

export interface CsvDataRow {
  [key: string]: string;
}

const parseCsv = (file: File): Promise<CsvDataRow[]> => {
  return new Promise((resolve, reject) => {
    console.log("Parsing CSV file...");
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        console.log("Parsing complete:", results.data.length, "rows found");

        if (results.errors.length > 0) {
          console.error("Errors parsing CSV:", results.errors);
        }

        if (results.errors.length > results.data.length) {
          console.error("More errors than rows... aborting");
          reject(results.errors);
        }

        const data = results.data as CsvDataRow[];
        resolve(data);
      },
    });
  });
};

addEventListener("message", async (e: MessageEvent) => {
  const file = e.data as File;
  try {
    const parsedData = await parseCsv(file);
    postMessage(parsedData);
  } catch (error) {
    console.error(error);
    postMessage(new Map());
  }
});
