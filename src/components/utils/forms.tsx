import React, { useCallback, useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";
import TimezoneSelect, { Props as TimeZoneProps } from "react-timezone-select";
import {
  Switch,
  Snackbar,
  Alert,
  SwitchProps,
  Checkbox,
  FormControlLabelProps,
  TextField,
  TextFieldProps,
  InputAdornment,
  CircularProgress,
  Tooltip,
  SliderProps,
  Slider,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import CheckCircle from "@mui/icons-material/CheckCircleOutline";
import { IMaskInput } from "react-imask";
import { DateRange } from "@mui/x-date-pickers-pro";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import {
  SingleInputTimeRangeField,
  SingleInputTimeRangeFieldProps,
} from "@mui/x-date-pickers-pro/SingleInputTimeRangeField";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { usePrevious } from "hooks/misc";
import {
  DEFAULT_ALERT_END,
  DEFAULT_ALERT_START,
  DEFAULT_ALERT_START_MINUTES,
  DEFAULT_ALERT_END_MINUTES,
  getFixedTimeFromMinutes,
  getMinutesFromMidnight,
} from "utils/time";
import { NestedKeyOf } from "utils/generics";
import shallowEqual from "utils/comparisons";

interface FirestoreBackedSwitchProps<DocType extends object>
  extends SwitchProps {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  labelProps?: Omit<FormControlLabelProps, "control">;
  checkBox?: boolean;
}

// Switch that disables while updating and alerts/logs any errors
export function FirestoreBackedSwitch<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  labelProps,
  checkBox,
  ...props
}: FirestoreBackedSwitchProps<DocType>) {
  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((enabled: boolean) =>
    updateDoc(docSnap.ref, fieldPath, enabled)
  );
  const C = checkBox ? Checkbox : Switch;
  return (
    <>
      <C
        checked={docSnap.get(fieldPath)}
        disabled={disabled || updating}
        onChange={(_, checked) => update(checked)}
        {...props}
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
}

interface FirestoreBackedSliderProps<DocType extends object>
  extends SliderProps {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  invertScale: (value: number) => number;
}

export function FirestoreBackedSlider<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  invertScale,
  ...props
}: FirestoreBackedSliderProps<DocType>) {
  const storedScaledValue = docSnap.get(fieldPath);
  const initialIndex = props.scale
    ? invertScale(storedScaledValue)
    : storedScaledValue;

  const [index, setIndex] = useState<number>(initialIndex);

  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((value: number) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );

  useEffect(() => {
    if (!updating) {
      const updatedIndex = props.scale
        ? invertScale(storedScaledValue)
        : storedScaledValue;
      setIndex(updatedIndex);
    }
  }, [storedScaledValue, updating]);

  const handleIndexChange = (_: any, newIndex: number | number[]) => {
    if (Array.isArray(newIndex)) {
      newIndex = newIndex[0];
    }
    if (newIndex !== index) {
      setIndex(newIndex);
    }
  };

  const handleValueCommit = (_: any, newIndex: number | number[]) => {
    if (Array.isArray(newIndex)) {
      newIndex = newIndex[0];
    }
    const scaledValue = props.scale ? props.scale(newIndex) : newIndex;
    update(scaledValue);
  };
  return (
    <>
      <Slider
        value={index}
        disabled={disabled || updating}
        onChange={handleIndexChange}
        onChangeCommitted={handleValueCommit}
        {...props}
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
}

interface FirestoreBackedRangeSliderProps<DocType extends object>
  extends FirestoreBackedSliderProps<DocType> {
  fieldPathStart?: NestedKeyOf<DocType>;
  minDistance?: number;
}
export function FirestoreBackedRangeSlider<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  fieldPathStart,
  minDistance,
  ...props
}: FirestoreBackedRangeSliderProps<DocType>) {
  let startValue = 0;
  const minDistanceValue = minDistance ?? 0;

  if (fieldPathStart) {
    startValue = docSnap.get(fieldPathStart);
  }

  const [saveValue, setSaveValue] = useState<number[]>([
    startValue,
    docSnap.get(fieldPath),
  ]);
  const [value, setValue] = useState<number[]>([
    saveValue[0] ?? props.min ?? 0,
    saveValue[1] ?? props.max ?? 1,
  ]);

  const handleChange = useCallback(
    (event: Event, newValue: number | number[], activeThumb: number) => {
      if (Array.isArray(newValue)) {
        setSaveValue(newValue);
      } else {
        setSaveValue([props.min ?? 0, newValue]);
      }

      if (!Array.isArray(newValue)) {
        return;
      }

      if (activeThumb === 0) {
        setValue([
          Math.min(newValue[0], value[1] - minDistanceValue),
          value[1],
        ]);
      } else {
        setValue([
          value[0],
          Math.max(newValue[1], value[0] + minDistanceValue),
        ]);
      }
    },
    [minDistanceValue, props.min, value]
  );

  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((value: number[]) => {
    if (fieldPathStart) {
      updateDoc(docSnap.ref, fieldPathStart, value[0]);
    }
    updateDoc(docSnap.ref, fieldPath, value[1]);
  });

  useEffect(() => {
    if (!updating) {
      setValue([
        saveValue[0] ?? props.min ?? 0,
        saveValue[1] ?? props.max ?? 1,
      ]);
    }
  }, [saveValue, updating, props.min, props.max]);

  return (
    <>
      <Slider
        value={value}
        disabled={disabled || updating}
        onChange={handleChange}
        onChangeCommitted={(_, value) => update(value as number[])}
        {...props}
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
}
interface FirestoreBackedTimeFieldProps<DocType extends object>
  extends TimePickerProps<Dayjs> {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  disabled?: boolean;
  label?: string;
}
export function FirestoreBackedTimeField<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  label,
  ...props
}: FirestoreBackedTimeFieldProps<DocType>) {
  let mutableDate = dayjs("2022-04-17T6:00");
  const backedValue = docSnap.get(fieldPath) ?? mutableDate.hour();
  const [inputValue, setInputValue] = useState(mutableDate.hour(backedValue));
  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((value: number) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );

  const onChangeHandler = (value: Dayjs | null) => {
    if (!value) {
      return;
    }
    update(value.hour());
  };

  useEffect(() => {
    if (!updating) {
      mutableDate.hour(backedValue);
      setInputValue(mutableDate);
    }
  }, [updating, backedValue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["TimePicker"]}>
        <TimePicker
          label={label}
          value={inputValue}
          disabled={disabled}
          onChange={onChangeHandler}
          {...props}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}

interface FirestoreBackedTimeRangeFieldProps<DocType extends object>
  extends SingleInputTimeRangeFieldProps<DateRange<Dayjs>> {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  isValid?: string;
}

export function FirestoreBackedTimeRangeField<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  ...props
}: FirestoreBackedTimeRangeFieldProps<DocType>) {
  const backedValueMinutesSnap = docSnap.get(fieldPath); // current store value
  const {
    runAction: update,
    running: updating,
    error: updateError,
    clearError,
  } = useAsyncAction((value: number[]) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );
  const previousUpdating = usePrevious(updating);

  let backedValue: DateRange<Dayjs>;
  if (backedValueMinutesSnap === undefined) {
    backedValue = [dayjs(DEFAULT_ALERT_START), dayjs(DEFAULT_ALERT_END)];
    update([DEFAULT_ALERT_START_MINUTES, DEFAULT_ALERT_END_MINUTES]);
  } else {
    backedValue = [
      dayjs(
        getFixedTimeFromMinutes(
          DEFAULT_ALERT_START,
          backedValueMinutesSnap[0] || DEFAULT_ALERT_START_MINUTES
        )
      ),
      dayjs(
        getFixedTimeFromMinutes(
          DEFAULT_ALERT_END,
          backedValueMinutesSnap[1] || DEFAULT_ALERT_END_MINUTES
        )
      ),
    ];
  }
  const [inputValue, setInputValue] = useState<DateRange<Dayjs>>(backedValue);

  useEffect(() => {
    if (!updating && previousUpdating) {
      setInputValue(backedValue);
    }
  }, [updating, previousUpdating, backedValue]);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} {...props}>
        <Tooltip title="Specify the time range where alerts can be sent. They will aggregate during the silent period">
          <SingleInputTimeRangeField
            label={props.label ? props.label : ""}
            value={inputValue}
            onChange={(newValue) => {
              setInputValue([
                newValue[0]?.startOf("minute") || null,
                newValue[1]?.startOf("minute") || null,
              ]);
              const newDateRange: number[] = [
                getMinutesFromMidnight(
                  newValue[0]?.toDate() || DEFAULT_ALERT_START
                ),
                getMinutesFromMidnight(
                  newValue[1]?.toDate() || DEFAULT_ALERT_END
                ),
              ];
              update(newDateRange);
            }}
            disabled={disabled || updating}
            sx={{ marginBottom: "10px", maxWidth: 300 }}
          />
        </Tooltip>
        <Snackbar
          open={!!updateError}
          autoHideDuration={5000}
          onClose={clearError}
        >
          <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
            {`Failed to update: ${updateError}`}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </>
  );
}

type FirestoreBackedTextFieldProps<DocType extends object> = Omit<
  TextFieldProps,
  "error" | "helperText"
> & {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  isValid?: (value: string) => boolean;
  helperText?: (value: string, isValid: boolean) => string | undefined;
  hideEditIcon?: boolean;
};

// Update the backing store on loss of focus or pressing `Enter`. Reset to the backed store state
// with `Escape`
export function FirestoreBackedTextField<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  isValid,
  helperText,
  hideEditIcon,
  InputProps,
  ...props
}: FirestoreBackedTextFieldProps<DocType>) {
  const [editing, setEditing] = useState(false);
  const backedValue = docSnap.get(fieldPath); // current store value
  const [inputValue, setInputValue] = useState(backedValue); // current display value
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    runAction: update,
    running: updating,
    error: updateError,
    clearError,
  } = useAsyncAction((value: string) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );
  const previousUpdating = usePrevious(updating);
  const fieldError = isValid ? !isValid(inputValue) : undefined;
  const fieldHelperText = helperText
    ? helperText(inputValue, !fieldError)
    : undefined;
  const hasUnsavedChanges = inputValue !== backedValue;

  const doUpdate = useCallback(() => {
    if (editing && !fieldError && hasUnsavedChanges) {
      update(inputValue);
    }
  }, [editing, inputValue, fieldError, update, hasUnsavedChanges]);

  const endAdornment =
    !hideEditIcon && (editing || updating) ? (
      <InputAdornment position="end">
        {updating ? (
          <CircularProgress size={20} />
        ) : !hasUnsavedChanges ? (
          <Tooltip title="changes saved">
            <CheckCircle color="success" fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="unsaved edits">
            <Edit color="primary" fontSize="small" />
          </Tooltip>
        )}
      </InputAdornment>
    ) : undefined;

  const doReset = useCallback(() => {
    setInputValue(backedValue);
  }, [backedValue]);

  const handleActionKey = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === "Enter") {
        doUpdate();
      } else if (key === "Escape") {
        doReset();
      }
    },
    [doUpdate, doReset]
  );

  // Handle actions on the input
  useKeyPress(["Enter", "Escape"], handleActionKey, inputRef);

  const onFocusOut = useCallback(() => {
    doUpdate();
    setEditing(false);
  }, [doUpdate]);

  useEffect(() => {
    const currentRef = inputRef.current;
    if (!currentRef) return;
    function onFocus() {
      setEditing(true);
    }
    currentRef.addEventListener("focus", onFocus);
    currentRef.addEventListener("focusout", onFocusOut);
    return () => {
      currentRef.removeEventListener("focus", onFocus);
      currentRef.removeEventListener("focusout", onFocusOut);
    };
  }, [inputRef, onFocusOut]);

  // When not editing, ensure that the value is consistent with the backed value
  useEffect(() => {
    if (!editing) {
      setInputValue(backedValue);
    }
  }, [editing, backedValue]);
  // after updating, always set the input to the backed value to ensure consistency
  useEffect(() => {
    if (!updating && previousUpdating) {
      setInputValue(backedValue);
    }
  }, [updating, previousUpdating, backedValue]);

  return (
    <>
      <TextField
        inputRef={inputRef}
        value={inputValue}
        disabled={disabled || updating}
        error={fieldError}
        helperText={fieldHelperText}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{ endAdornment, ...InputProps }}
        {...props}
      />
      <Snackbar
        open={!!updateError}
        autoHideDuration={5000}
        onClose={clearError}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${updateError}`}
        </Alert>
      </Snackbar>
    </>
  );
}

type FirestoreBackedTimeZoneProps<DocType extends object> = Omit<
  TimeZoneProps,
  "value"
> & {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  disabled: boolean;
};

export function FirestoreBackedTimeZoneSelect<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  ...props
}: FirestoreBackedTimeZoneProps<DocType>) {
  const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const savedValue = docSnap.get(fieldPath) ?? defaultTimeZone;
  const [value, setValue] = useState(savedValue);
  const { runAction: update, running: updating } = useAsyncAction(
    (enabled: number) => updateDoc(docSnap.ref, fieldPath, enabled)
  );

  useEffect(() => {
    if (!updating && !shallowEqual(savedValue, value)) {
      setValue(savedValue);
    }
  }, [savedValue, updating, value]);

  return (
    <>
      <TimezoneSelect
        value={value}
        isDisabled={disabled || updating}
        onChange={(value: any) => {
          setValue(value);
          update(value);
        }}
      />
    </>
  );
}

interface CustomTextFieldProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
export const IntegerInput = React.forwardRef<HTMLElement, CustomTextFieldProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Number}
        scale={0}
        inputRef={ref as any}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

export const PhoneNumberInput = React.forwardRef<
  HTMLElement,
  CustomTextFieldProps
>((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(#00) 000-0000"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref as any}
      onAccept={(value: any) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  );
});

export const EmailInput = React.forwardRef<HTMLElement, CustomTextFieldProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={/^\S*@?\S*$/}
        inputRef={ref as any}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);
