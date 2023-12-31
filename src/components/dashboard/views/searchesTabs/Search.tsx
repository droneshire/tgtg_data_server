import React, { FC } from "react";

import {
  Tooltip,
  TableRow,
  TableCell,
  Chip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Searches } from "types/user";
import { generateMapsUrl } from "utils/maps";

export type SearchSpec = Searches["items"][string] & {
  searchId: string;
};

export const DEFAULT_SEARCH_SPEC: SearchSpec = {
  region: { latitude: 0, longitude: 0, radius: 0 },
  searchId: "",
  sendEmail: false,
  uploadOnly: false,
  eraseData: false,
  lastSearchTime: 0,
  lastDownloadTime: 0,
  numResults: 0,
  uuid: "",
};

export interface SearchActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

export type SearchProps = SearchSpec & {
  actionButtons: SearchActionOption[];
  selectedSearches: string[];
  toggleSearchSelection: (searchId: string) => void;
};
export const Search: FC<SearchProps> = ({
  searchId,
  region,
  numResults,
  lastSearchTime,
  actionButtons,
  selectedSearches,
  toggleSearchSelection,
}) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };
  const strLatitude = region.latitude.toString();
  const lattitudeText =
    strLatitude.slice(0, strLatitude.indexOf(".") + 3) +
    "°" +
    (strLatitude.includes("-") ? "S" : "N");
  const strLongitude = region.longitude.toString();
  const longitudeText =
    strLongitude.slice(0, strLongitude.indexOf(".") + 3) +
    "°" +
    (strLongitude.includes("-") ? "W" : "E");
  const googleMapsUrl = generateMapsUrl(strLatitude, strLongitude);

  const minSearchTime = 1696118400;
  let lastSearchDateString = new Date(lastSearchTime * 1000).toLocaleString();
  if (!lastSearchTime || lastSearchTime < minSearchTime) {
    lastSearchDateString = "Never";
  }

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`Search ${searchId}`}>
          {(selectedSearches.includes(searchId) && (
            <Chip
              icon={<RestaurantIcon />}
              label={searchId}
              onClick={() => toggleSearchSelection(searchId)}
            />
          )) || (
            <Chip
              icon={<RestaurantIcon />}
              label={searchId}
              variant="outlined"
              onClick={() => toggleSearchSelection(searchId)}
            />
          )}
        </Tooltip>
      </TableCell>
      <TableCell>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          {lattitudeText + ", " + longitudeText}
        </a>
      </TableCell>
      <TableCell> {region.radius + " mi"} </TableCell>
      <TableCell> {numResults || 0} </TableCell>
      <TableCell> {lastSearchDateString} </TableCell>
      <TableCell sx={{ textAlign: "right" }}>
        <Button onClick={handleActionMenuClick}>Actions</Button>
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
        >
          {actionButtons.map(({ doAction, ActionIcon, title }, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                doAction();
                handleActionMenuClose();
              }}
            >
              {ActionIcon && (
                <ListItemIcon>
                  <ActionIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText>{title}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </TableCell>
    </TableRow>
  );
};
