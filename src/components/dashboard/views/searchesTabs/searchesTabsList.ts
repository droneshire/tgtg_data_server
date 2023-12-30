import AnalysisTab from "./AnalysisTab";
import ItemsSearchesTab from "./SearchesTab";

const searchesTabsList = [
  {
    key: "searches",
    label: "Searches",
    component: ItemsSearchesTab,
  },
  {
    key: "demographics",
    label: "Analysis",
    component: AnalysisTab,
  }
];

export default searchesTabsList;
