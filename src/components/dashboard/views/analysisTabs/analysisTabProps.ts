import { DocumentSnapshot } from "firebase/firestore";
import { DataMaps } from "./components/CsvDataUploader";
import { ClientConfig } from "types/user";

interface AnalysisTabsProps {
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
  displayChart: boolean;
  dataMaps: DataMaps;
  onUpload?: (dataMaps: DataMaps) => void;
}

export default AnalysisTabsProps;
