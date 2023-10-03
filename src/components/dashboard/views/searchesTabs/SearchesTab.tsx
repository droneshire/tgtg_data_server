import React, { FC, useCallback, useEffect, useMemo, useState } from "react";

import {
  Tooltip,
  CircularProgress,
  Typography,
  Fab,
  FormControlLabel,
  TableRow,
  Checkbox,
  TableCell,
  TableContainer,
  TableBody,
  Paper,
  Table,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ClientConfig, hourDivisors } from "types/user";
import { Box } from "@mui/system";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";

import {
  DocumentSnapshot,
  FieldPath,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { Search, SearchSpec, SearchProps } from "./Search";
import { NewSearchModal } from "./SearchModal";
import {
  FirestoreBackedSlider,
  FirestoreBackedTimeField,
} from "components/utils/forms";
import { useValueWithTimezone } from "@mui/x-date-pickers/internals/hooks/useValueWithTimezone";

const TrackingIcon: FC<Omit<FontAwesomeIconProps, "icon">> = (props) => (
  <FontAwesomeIcon icon={faChartSimple} {...props} />
);

const TableDisplayButtons: FC<{
  items: SearchSpec[];
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

interface SearchGroupActionButton {
  doAction: (searchId: string) => void;
  ActionIcon: React.ElementType;
  title: (searchId: string) => string;
}

const SearchActivityGroup: FC<{
  items: SearchSpec[];
  actionButtons: SearchGroupActionButton[];
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

  const selectedItemsString = useMemo(() => {
    return `${selectedItems.length} selected`;
  }, [selectedItems]);

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
              <TableCell> Results </TableCell>
              <TableCell> Last Successful Search </TableCell>
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
                          handleActionMenuClose();
                        }}
                      >
                        {ActionIcon && (
                          <ListItemIcon>
                            <ActionIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        <ListItemText>
                          {title(selectedItemsString)}
                        </ListItemText>
                      </MenuItem>
                    )
                  )}
                </Menu>
              </TableCell>
            </TableRow>
          )}
          {displayedItems.map((props) => (
            <Search
              key={props.searchId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.searchId),
                  title: title(props.searchId),
                  ActionIcon: ActionIcon,
                })
              )}
              toggleSearchSelection={toggleItemSelection}
              selectedSearches={selectedItems}
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

const SearchesTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const searches = userConfigSnapshot?.data()?.searches;
  const deleteDataOnDownload =
    userConfigSnapshot?.data()?.preferences?.deleteDataOnDownload;
  const [modalOpen, setModalOpen] = useState(false);

  if (!searches) {
    return <CircularProgress />;
  }
  const existingsearchIds = useMemo(
    () => Object.keys(searches?.items || {}),
    [searches]
  );
  const searchItems: SearchSpec[] = useMemo(() => {
    const items: SearchSpec[] = [];
    Object.entries(searches?.items || {}).forEach((t) => {
      const [searchId, item] = t;
      items.push({ searchId, ...item });
    });
    return items;
  }, [searches]);

  const deleteSearch = (searchId: string) => {
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath("searches", "items", searchId),
      deleteField()
    );
  };

  const emailSearch = (searchId: string) => {
    const fieldsToUpdate: Record<string, any> = {};

    fieldsToUpdate["searches.items." + searchId + ".sendEmail"] = true;

    if (deleteDataOnDownload) {
      fieldsToUpdate["searches.items." + searchId + ".eraseData"] = true;
    }

    updateDoc(userConfigSnapshot.ref, fieldsToUpdate);
  };

  const editSearch = (searchId: string) => {};

  const deleteSearchData = (searchId: string) => {
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath("searches", "items", searchId, "eraseData"),
      true
    );
  };

  const marks = useMemo(() => {
    const hour_divisor_marks: { value: number; label: string }[] = Array(
      hourDivisors.length
    )
      .fill(0)
      .map((_, index) => {
        const divisor = hourDivisors[index];
        return { value: divisor, label: `${divisor} hours` };
      });
    return hour_divisor_marks;
  }, []);

  const scaleValue = (value: number) => {
    return hourDivisors[value];
  };

  const actionButtons = [
    {
      doAction: deleteSearch,
      title: (searchId: string) => `Delete search for ${searchId}`,
      ActionIcon: DeleteIcon,
    },
    // {
    //   doAction: editSearch,
    //   title: (searchId: string) => `Edit search ${searchId}`,
    //   ActionIcon: EditIcon,
    // },
    {
      doAction: emailSearch,
      title: (searchId: string) => `Email Data for ${searchId}`,
      ActionIcon: AttachEmailIcon,
    },
  ];

  if (!!!deleteDataOnDownload) {
    actionButtons.push({
      doAction: deleteSearchData,
      title: (searchId: string) => `Delete search data for ${searchId}`,
      ActionIcon: ContentCutIcon,
    });
  }

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
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Data Collection Timing
          </Typography>
        </Box>
        <Box>
          <FirestoreBackedTimeField
            docSnap={userConfigSnapshot!}
            fieldPath="searches.collectionTimeStart"
            disabled={false}
            label="Start Time"
            views={["hours"]}
          />
        </Box>
        <Box>
          <Typography sx={{ mt: 4, mb: 2 }} component="div">
            Hours Between Collection
          </Typography>
          <FirestoreBackedSlider
            sx={{ maxWidth: 300 }}
            docSnap={userConfigSnapshot!}
            fieldPath="searches.hoursBetweenCollection"
            invertScale={(value) => hourDivisors.indexOf(value)}
            valueLabelDisplay="auto"
            min={0}
            max={hourDivisors.length - 1}
            step={1}
            marks={[
              {
                value: 0,
                label: Math.min(...hourDivisors).toString(),
              },
              {
                value: hourDivisors.length - 1,
                label: Math.max(...hourDivisors).toString(),
              },
            ]}
            defaultValue={2}
            scale={scaleValue}
          />
        </Box>
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
        <SearchActivityGroup
          items={searchItems}
          actionButtons={actionButtons}
        />
      </Box>
      <Box textAlign="right" sx={{ marginTop: 2 }}>
        <Tooltip title="Add item">
          <Fab color="primary" onClick={() => setModalOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <NewSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingsearchIds={existingsearchIds}
        createSearch={(SearchProps) => {
          const { searchId, ...item } = SearchProps;
          updateDoc(
            userConfigSnapshot.ref,
            new FieldPath("searches", "items", searchId),
            item
          );
        }}
        initialSearch={null}
      />
    </>
  );
};

export default SearchesTab;
