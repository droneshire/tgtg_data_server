import React, { FC, useCallback, useMemo, useRef, useState } from "react";

import {
  Tooltip,
  CircularProgress,
  Modal,
  Typography,
  Fab,
  FormControlLabel,
  TextField,
  Snackbar,
  Alert,
  TableRow,
  Checkbox,
  TableCell,
  TableContainer,
  TableBody,
  Paper,
  Table,
  Chip,
  Slider,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Searches, ClientConfig } from "types/user";
import { Box } from "@mui/system";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";

import { capitalizeFirstLetter } from "utils/string";
import { useAsyncAction } from "hooks/async";
import { FirestoreBackedSlider } from "components/utils/forms";
import {
  DocumentSnapshot,
  FieldPath,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { useKeyPress } from "hooks/events";
import { Region } from "types/user";
import { generateMapsUrl } from "utils/maps";

const TrackingIcon: FC<Omit<FontAwesomeIconProps, "icon">> = (props) => (
  <FontAwesomeIcon icon={faChartSimple} {...props} />
);

type ItemSpec = Searches["items"][string] & {
  searchId: string;
};

interface ItemActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

type ItemProps = ItemSpec & {
  actionButtons: ItemActionOption[];
  selectedItems: string[];
  toggleItemSelection: (searchId: string) => void;
};
const Item: FC<ItemProps> = ({
  searchId,
  region,
  actionButtons,
  selectedItems,
  toggleItemSelection,
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
  const strLattitude = region.lattitude.toString();
  const lattitudeText =
    strLattitude.slice(0, strLattitude.indexOf(".") + 3) +
    "°" +
    (strLattitude.includes("-") ? "S" : "N");
  const strLongitude = region.longitude.toString();
  const longitudeText =
    strLongitude.slice(0, strLongitude.indexOf(".") + 3) +
    "°" +
    (strLongitude.includes("-") ? "W" : "E");
  const googleMapsUrl = generateMapsUrl(strLattitude, strLongitude);

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`Search ${searchId}`}>
          {(selectedItems.includes(searchId) && (
            <Chip
              icon={<RestaurantIcon />}
              label={searchId}
              onClick={() => toggleItemSelection(searchId)}
            />
          )) || (
            <Chip
              icon={<RestaurantIcon />}
              label={searchId}
              variant="outlined"
              onClick={() => toggleItemSelection(searchId)}
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
      <TableCell sx={{ textAlign: "right" }}>
        <Button onClick={handleActionMenuClick}>Actions</Button>
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
        >
          {actionButtons.map(({ doAction, ActionIcon, title }, index) => (
            <MenuItem key={index} onClick={doAction}>
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

const TableDisplayButtons: FC<{
  items: ItemSpec[];
  visibleItems: number;
  setVisibleItems: (visibleItems: number) => void;
  incrementalVisibleItems: number;
}> = ({ items, visibleItems, setVisibleItems, incrementalVisibleItems }) => {
  return items.length > 0 && items.length > incrementalVisibleItems ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          setVisibleItems(incrementalVisibleItems);
        }}
        disabled={visibleItems <= incrementalVisibleItems}
      >
        Show Min
      </Button>
      <Button
        onClick={() => {
          setVisibleItems(visibleItems + incrementalVisibleItems);
        }}
        disabled={visibleItems > items.length}
      >
        Show More
      </Button>

      <Button
        onClick={() => {
          setVisibleItems(visibleItems - incrementalVisibleItems);
        }}
        disabled={visibleItems <= incrementalVisibleItems}
      >
        Show Less
      </Button>
      <Button
        onClick={() => {
          setVisibleItems(items.length);
        }}
        disabled={visibleItems === items.length}
      >
        Show All
      </Button>
    </div>
  ) : null;
};

interface ItemGroupActionButton {
  doAction: (searchId: string) => void;
  ActionIcon: React.ElementType;
  title: (searchId: string) => string;
}

const ItemActivityGroup: FC<{
  items: ItemSpec[];
  actionButtons: ItemGroupActionButton[];
}> = ({ items, actionButtons }) => {
  const incrementalVisibleItems = 10;
  const [visibleItems, setVisibleItems] = useState(incrementalVisibleItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const displayedItems = items.slice(0, visibleItems);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  const toggleAllItems = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.searchId));
    }
  }, [items, selectedItems]);

  const toggleItemSelection = (searchId: string) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(searchId)) {
        return prevSelectedItems.filter((id) => id !== searchId);
      } else {
        return [...prevSelectedItems, searchId];
      }
    });
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {items.length > 0 && (
            <TableRow sx={{ marginLeft: "1rem" }}>
              <TableCell>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < items.length
                      }
                      onChange={toggleAllItems}
                    />
                  }
                  label="Select All/None"
                />
              </TableCell>
              <TableCell> Lat, Long </TableCell>
              <TableCell> Radius </TableCell>
              <TableCell sx={{ textAlign: "right" }}>
                <Button onClick={handleActionMenuClick}>Actions</Button>
                <Menu
                  anchorEl={actionMenuAnchorEl}
                  open={actionMenuOpen}
                  onClose={handleActionMenuClose}
                >
                  {actionButtons.map(
                    ({ doAction, ActionIcon, title }, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          selectedItems.forEach((searchId) => {
                            doAction(searchId);
                          });
                        }}
                      >
                        {ActionIcon && (
                          <ListItemIcon>
                            <ActionIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        <ListItemText>{title("")}</ListItemText>
                      </MenuItem>
                    )
                  )}
                </Menu>
              </TableCell>
            </TableRow>
          )}
          {displayedItems.map((props) => (
            <Item
              key={props.searchId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.searchId),
                  title: title(props.searchId),
                  ActionIcon: ActionIcon,
                })
              )}
              toggleItemSelection={toggleItemSelection}
              selectedItems={selectedItems}
            />
          ))}
        </TableBody>
      </Table>
      <TableDisplayButtons
        {...{ items, visibleItems, setVisibleItems, incrementalVisibleItems }}
      />
    </TableContainer>
  );
};

const RegionSliders: FC = () => {
  const [lattitude, setLattitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radius, setRadius] = useState(0);

  const sliderData = [
    {
      label: "Lattitude (deg)",
      value: lattitude,
      onChange: (newValue: number) => setLattitude(newValue),
      min: -90,
      max: 90,
      step: 0.1,
    },
    {
      label: "Longitude (deg)",
      value: longitude,
      onChange: (newValue: number) => setLongitude(newValue),
      min: -180,
      max: 180,
      step: 0.1,
    },
    {
      label: "Radius (mi)",
      value: radius,
      onChange: (newValue: number) => setRadius(newValue),
      min: 0,
      max: 50,
      step: 1,
    },
  ];

  return (
    <>
      {sliderData.map((slider, index) => (
        <Box key={index}>
          <Typography gutterBottom>{slider.label}</Typography>
          <Slider
            value={slider.value}
            onChange={(event: Event, newValue: number | number[]) =>
              slider.onChange(newValue as number)
            }
            aria-labelledby="continuous-slider"
            min={slider.min}
            max={slider.max}
            step={slider.step}
            valueLabelDisplay="auto"
          />
        </Box>
      ))}
    </>
  );
};

interface ItemModalProps {
  open: boolean;
  onClose: () => void;
  createItem: (item: ItemSpec) => Promise<void> | void;
  existingsearchIds: string[];
}
const NewItemModal: FC<ItemModalProps> = ({
  open,
  onClose,
  createItem,
  existingsearchIds,
}) => {
  const modalRef = useRef<HTMLElement>(null);
  const [searchName, setSearchName] = useState("");
  const [lattitude, setLattitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [radius, setRadius] = useState(0);
  const [itemName, setitemName] = useState("");
  const {
    runAction: doCreateItem,
    running: creatingItem,
    error,
    clearError,
  } = useAsyncAction(createItem);

  const validsearchId = searchName && !existingsearchIds.includes(searchName);
  const disabled = creatingItem || !validsearchId;

  const reset = useCallback(() => {
    setSearchName("");
    setitemName("");
    setLattitude(0.0);
    setLongitude(0.0);
    setRadius(0);
  }, [setSearchName, setitemName, setLattitude, setLongitude, setRadius]);

  const doSubmit = useCallback(async () => {
    if (disabled) {
      return;
    }
    const region: Region = {
      lattitude: lattitude,
      longitude: longitude,
      radius: radius,
    };

    const success = await doCreateItem({
      searchId: searchName,
      region: region,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateItem, searchName, itemName, disabled]);

  const keyHander = useCallback(
    ({ key }: KeyboardEvent) => {
      switch (key) {
        case "Enter":
          doSubmit();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    },
    [doSubmit, onClose]
  );
  useKeyPress(["Enter", "Escape"], keyHander);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          ref={modalRef}
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h2" textAlign="center">
            New Search
          </Typography>
          <TextField
            label="Search Name"
            variant="standard"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            error={!validsearchId}
            inputProps={{ inputMode: "text" }}
          />
          <RegionSliders />
          <Box textAlign="center">
            {creatingItem ? (
              <CircularProgress />
            ) : (
              <Tooltip title="Add item">
                <span>
                  <Fab
                    color="primary"
                    variant="extended"
                    disabled={disabled}
                    onClick={doSubmit}
                  >
                    <AddIcon />
                    Add
                  </Fab>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Modal>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to create item: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
};

const ItemsSearchesTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const searches = userConfigSnapshot?.data()?.searches;
  const [modalOpen, setModalOpen] = useState(false);
  const existingsearchIds = useMemo(
    () => Object.keys(searches?.items || {}),
    [searches]
  );

  if (!searches) {
    return <CircularProgress />;
  }
  const searchItems: ItemSpec[] = [];
  Object.entries(searches.items || {}).forEach((t) => {
    const [searchId, item] = t;
    searchItems.push({ searchId, ...item });
  });

  const deleteItem = (searchId: string) => {
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath("searches", "items", searchId),
      deleteField()
    );
  };

  return (
    <>
      <Box alignItems="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <TrackingIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            TGTG Searches
          </Typography>
        </Box>
        <ItemActivityGroup
          items={searchItems}
          actionButtons={[
            {
              doAction: deleteItem,
              title: (searchId: string) => `Delete item ${searchId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
      </Box>
      <Box textAlign="right" sx={{ marginTop: 2 }}>
        <Tooltip title="Add item">
          <Fab color="primary" onClick={() => setModalOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <NewItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingsearchIds={existingsearchIds}
        createItem={(ItemProps) => {
          const { searchId, ...item } = ItemProps;
          updateDoc(
            userConfigSnapshot.ref,
            new FieldPath("searches", "items", searchId),
            item
          );
        }}
      />
    </>
  );
};

export default ItemsSearchesTab;
