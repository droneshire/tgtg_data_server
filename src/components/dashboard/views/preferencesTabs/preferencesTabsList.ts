import NotificationsTab from "./NotificationsTab";
import SearchParamsTab from "./SearchParamsTab";

const preferencesTabsList = [
  {
    key: "notifications",
    label: "Notifications",
    component: NotificationsTab,
  },
  {
    key: "searchParams",
    label: "Search Parameters",
    component: SearchParamsTab,
  },
];

export default preferencesTabsList;
