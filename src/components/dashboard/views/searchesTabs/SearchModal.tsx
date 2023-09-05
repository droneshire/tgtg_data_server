import { FC, useCallback, useEffect, useRef, useState, useMemo } from "react";

import {
  Tooltip,
  CircularProgress,
  Modal,
  Typography,
  Fab,
  TextField,
  Snackbar,
  Alert,
  Slider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/system";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { Region } from "types/user";
import { SearchSpec } from "./Search";

export interface SliderProps {
  updateRegion: (region: Region) => void;
  isUpdating: boolean;
  initialRegion: Region;
}
const RegionSliders: FC<SliderProps> = ({
  updateRegion,
  isUpdating,
  initialRegion,
}) => {
  const [latitude, setLatitude] = useState(initialRegion.latitude);
  const [longitude, setLongitude] = useState(initialRegion.longitude);
  const [radius, setRadius] = useState(initialRegion.radius);

  const handleValueChange =
    (setter: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        setter(value);
      }
    };

  const sliderData = [
    {
      label: "Latitude (deg)",
      value: latitude,
      onChange: (newValue: number) => setLatitude(newValue),
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
      max: 20,
      step: 1,
    },
  ];

  useEffect(() => {
    if (!isUpdating) {
      updateRegion({ latitude, longitude, radius });
    }
  }, [latitude, longitude, radius, isUpdating]);

  return (
    <>
      {sliderData.map((slider) => (
        <Box key={slider.label}>
          <Typography gutterBottom>{slider.label}</Typography>
          <TextField
            value={slider.value}
            onChange={handleValueChange(slider.onChange)}
            type="number"
            inputProps={{
              min: slider.min,
              max: slider.max,
              step: slider.step,
            }}
          />
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

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  createSearch: (item: SearchSpec) => Promise<void> | void;
  existingsearchIds: string[];
  initialSearch: SearchSpec | null;
}
export const NewSearchModal: FC<SearchModalProps> = ({
  open,
  onClose,
  createSearch,
  existingsearchIds,
  initialSearch,
}) => {
  const modalRef = useRef<HTMLElement>(null);
  const defaultSearchSpec: SearchSpec = {
    region: { latitude: 0, longitude: 0, radius: 0 },
    searchId: "",
    sendEmail: false,
    lastSearchTime: 0,
    numResults: 0,
  };
  const [searchSpec, setSearchSpec] = useState<SearchSpec>(
    initialSearch || defaultSearchSpec
  );

  const {
    runAction: doCreateSearch,
    running: creatingSearch,
    error,
    clearError,
  } = useAsyncAction(createSearch);

  const validsearchId = useMemo(() => {
    return (
      searchSpec.searchId && !existingsearchIds.includes(searchSpec.searchId)
    );
  }, [searchSpec, existingsearchIds]);

  const disabled = useMemo(() => {
    return creatingSearch || !validsearchId;
  }, [creatingSearch, validsearchId]);

  const reset = useCallback(() => {
    setSearchSpec(defaultSearchSpec);
  }, [setSearchSpec, defaultSearchSpec]);

  const doSubmit = useCallback(async () => {
    if (disabled) {
      return;
    }
    const region: Region = {
      latitude: searchSpec.region.latitude,
      longitude: searchSpec.region.longitude,
      radius: searchSpec.region.radius,
    };

    const success = await doCreateSearch({
      ...searchSpec,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateSearch, disabled, searchSpec]);

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
            value={searchSpec.searchId}
            onChange={(e) => {
              const newSearchSpec = {
                ...searchSpec,
                searchId: e.target.value,
              };
              setSearchSpec(newSearchSpec);
            }}
            error={!validsearchId}
            inputProps={{ inputMode: "text" }}
          />
          <RegionSliders
            updateRegion={(region) => {
              setSearchSpec({
                ...searchSpec,
                region,
              });
            }}
            isUpdating={creatingSearch}
            initialRegion={searchSpec.region}
          />
          <Box textAlign="center">
            {creatingSearch ? (
              <CircularProgress />
            ) : (
              <AddEditSearchTooltip
                edit={searchSpec.searchId !== ""}
                doSubmit={doSubmit}
                disabled={disabled}
              />
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

export const AddEditSearchTooltip: FC<{
  edit: boolean;
  disabled: boolean;
  doSubmit: () => void;
}> = ({ edit, disabled, doSubmit }) => {
  const tooltipText = edit ? "Edit Item" : "Add Item";
  const text = edit ? "Edit" : "Add";
  const icon = edit ? <EditIcon /> : <AddIcon />; // Assuming you'd use EditIcon for editing

  return (
    <Tooltip title={tooltipText}>
      <span>
        <Fab
          color="primary"
          variant="extended"
          disabled={disabled}
          onClick={doSubmit}
        >
          {icon}
          {text}
        </Fab>
      </span>
    </Tooltip>
  );
};
