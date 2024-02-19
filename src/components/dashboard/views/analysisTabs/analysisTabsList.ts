import StoreAnalysisTab from "./StoreAnalysisTab";
import DataSelectTab from "./DataSelectTab";
import ResearchTab from "./ResearchTab";

const analysisTabsList = [
  // The first one in the list is the default tab
  // and will be the only one shown until the user uploads data
  {
    key: "data",
    label: "Select Data",
    component: DataSelectTab,
  },
  {
    key: "stores",
    label: "Stores",
    component: StoreAnalysisTab,
  },
  {
    key: "research",
    label: "Research",
    component: ResearchTab,
  },
];

export default analysisTabsList;
