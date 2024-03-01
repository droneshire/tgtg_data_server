import { ArrowDropDown } from "@mui/icons-material";
import {
  Alert,
  Button,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { myStorage } from "firebaseApp";
import React, { useMemo, useCallback, useState, useEffect } from "react";

interface FirestoreFileSelectProps {
  handleOnClick: (fileText: string) => void;
  directoryName: string;
  disabled: boolean;
}
interface FileDescriptions {
  fileString: string;
  fileRef: string;
}

function FirestoreNameToLabel(name: string): string {
  let sections = name.split("_");
  if (sections.length === 1) {
    return name;
  }

  if (sections.length < 9) {
    return name;
  }

  const date = sections[sections.length - 1].split(".")[0];
  const searchName = sections[2];
  const lattitude = sections[3];
  const longitude = sections[4];
  const lattitudeText =
    lattitude.slice(0, lattitude.indexOf(".") + 3) +
    "°" +
    (lattitude.includes("-") ? "S" : "N");
  const longitudeText =
    longitude.slice(0, longitude.indexOf(".") + 3) +
    "°" +
    (longitude.includes("-") ? "W" : "E");
  return `${searchName} [${lattitudeText}, ${longitudeText}]: ${date}`;
}

const FirestoreFileSelect: React.FC<FirestoreFileSelectProps> = (props) => {
  const directoryName = props.directoryName;
  const disabled = props.disabled;
  const handleOnClick = props.handleOnClick;
  const storageRef = ref(myStorage, `${directoryName}/`);

  const [fileData, setFileData] = useState("");
  const [files, setFiles] = useState<FileDescriptions[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const openMenu = Boolean(menuAnchorEl);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleMenuItemClick = (name: string) => () => {
    handleMenuButtonClose(name);
  };

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuButtonClose = (name: string) => {
    setMenuAnchorEl(null);
    setSelectedFile(name);
  };

  const closeAll = () => {
    setAlertOpen(false);
    setSelectedFile("");
    setFileData("");
  };

  const handleAlertClose = () => {
    closeAll();
  };

  const readFireStoreCsv = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      setFileData(text);
    } catch (error) {
      console.error("Error reading firststore file:", error);
      setAlertOpen(true);
    }
  }, []);

  useEffect(() => {
    if (fileData !== "") {
      handleOnClick(fileData);
      closeAll();
    }
  }, [fileData, handleOnClick]);

  useEffect(() => {
    if (selectedFile !== "") {
      const fileRef = ref(myStorage, selectedFile);

      console.log("Downloading file from firestore: ", selectedFile);

      getDownloadURL(fileRef)
        .then((url) => {
          readFireStoreCsv(url);
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
          setAlertOpen(true);
        });
    }
  }, [selectedFile, readFireStoreCsv]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        let fileList: FileDescriptions[] = [];
        const result = await listAll(storageRef);
        const directories = result.prefixes.map((prefixRef) => prefixRef.name);
        const fileNames = result.items.map((itemRef) => {
          const fileName = itemRef.name;
          const labelName = FirestoreNameToLabel(fileName);
          if (fileName) {
            return {
              fileString: labelName,
              fileRef: `${directoryName}/${fileName}`,
            };
          }
          return null;
        });
        fileList = fileNames.filter(Boolean) as FileDescriptions[];

        for (const directory of directories) {
          const directoryRef = ref(myStorage, `${directoryName}/${directory}/`);
          const directoryResult = await listAll(directoryRef);
          const directoryFileNames = directoryResult.items.map((itemRef) => {
            const fileName = itemRef.name;
            if (fileName) {
              const labelName = FirestoreNameToLabel(
                `${directory}/${fileName}`
              );
              return {
                fileString: labelName,
                fileRef: `${directoryName}/${directory}/${fileName}`,
              };
            }
            return null;
          });
          fileList = [
            ...fileList,
            ...(directoryFileNames.filter(Boolean) as FileDescriptions[]),
          ];
        }
        // Filter out duplicate files
        const uniqueFileList = Array.from(
          new Set(fileList.map((file) => file.fileString))
        ).map((fileString) =>
          fileList.find((file) => file.fileString === fileString)
        );

        fileList = uniqueFileList.filter(Boolean) as FileDescriptions[];
        fileList.sort((a, b) => {
          return a.fileString.localeCompare(b.fileString);
        });
        setFiles(fileList);
      } catch (error) {
        console.error("Failed to list files:", error);
        setAlertOpen(true);
      }
    };

    fetchFiles();
  }, []);

  return (
    <>
      <Button
        id="fade-button"
        aria-controls={openMenu ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? "true" : undefined}
        onClick={handleMenuButtonClick}
        variant="contained"
        disabled={disabled}
      >
        {disabled ? <CircularProgress size={24} /> : "Select Search"}
        <ArrowDropDown />
      </Button>
      <Menu
        id="fade-menu-stores"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={menuAnchorEl}
        open={openMenu}
        onClose={() => {
          handleMenuButtonClose("");
        }}
        TransitionComponent={Fade}
      >
        {files.map((fileName, index) => (
          <MenuItem key={index} onClick={handleMenuItemClick(fileName.fileRef)}>
            {fileName.fileString}
          </MenuItem>
        ))}
      </Menu>
      <Snackbar
        open={alertOpen}
        autoHideDuration={5000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          Unable to parse file
        </Alert>
      </Snackbar>
    </>
  );
};

export default FirestoreFileSelect;
