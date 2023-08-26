import { FC, useCallback, useRef, useState } from "react";

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
import { Box } from "@mui/system";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { Region } from "types/user";
import { SearchSpec } from "./Search";

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
      max: 10,
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

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  createSearch: (item: SearchSpec) => Promise<void> | void;
  existingsearchIds: string[];
}
export const NewSearchModal: FC<SearchModalProps> = ({
  open,
  onClose,
  createSearch,
  existingsearchIds,
}) => {
  const modalRef = useRef<HTMLElement>(null);
  const [searchName, setSearchName] = useState("");
  const [lattitude, setLattitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [radius, setRadius] = useState(0);
  const [itemName, setitemName] = useState("");
  const {
    runAction: doCreateSearch,
    running: creatingSearch,
    error,
    clearError,
  } = useAsyncAction(createSearch);

  const validsearchId = searchName && !existingsearchIds.includes(searchName);
  const disabled = creatingSearch || !validsearchId;

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

    const success = await doCreateSearch({
      searchId: searchName,
      region: region,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateSearch, searchName, itemName, disabled]);

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
            {creatingSearch ? (
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
