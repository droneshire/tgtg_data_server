import Papa from "papaparse";

export type StoreStats = Map<string, number>;

interface CsvDataRow {
  [key: string]: string;
}

const parseCsv = (file: File): Promise<StoreStats> => {
  return new Promise((resolve, reject) => {
    const headerTitle = "store_name";

    console.log("Parsing CSV file...");
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        console.log("Parsing complete:", results.data.length, "rows found");

        if (results.errors.length > 0) {
          console.error("Errors parsing CSV:", results.errors);
        }

        const data = results.data as CsvDataRow[];

        const combinedDataMap: StoreStats = data.reduce<StoreStats>((accumulator, element) => {
          const id = element[headerTitle];
          if (id !== undefined && id !== "") {
            accumulator.set(id, (accumulator.get(id) || 0) + 1);
          }
          return accumulator;
        }, new Map());

        resolve(combinedDataMap);
      }
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
