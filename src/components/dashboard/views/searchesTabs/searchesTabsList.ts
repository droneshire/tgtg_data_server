import DemographicsTab from "./DemographicsTab";
import ItemsSearchesTab from "./SearchesTab";

const searchesTabsList = [
  {
    key: "searches",
    label: "Searches",
    component: ItemsSearchesTab,
  },
  {
    key: "demographics",
    label: "Demographics",
    component: DemographicsTab,
  }
];

export default searchesTabsList;
