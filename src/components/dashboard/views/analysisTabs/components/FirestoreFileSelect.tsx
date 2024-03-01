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

  const handleAlertClose = () => {
    setAlertOpen(false);
    setSelectedFile("");
    setFiles([]);
    setFileData("");
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
      console.log("File data: ", fileData);
      handleOnClick(fileData);
    }
  }, [fileData, handleOnClick]);

  const memoizedSelectedFile = useMemo(() => selectedFile, [selectedFile]);
  useEffect(() => {
    if (memoizedSelectedFile !== "") {
      const fileRef = ref(myStorage, memoizedSelectedFile);

      console.log("Downloading file from firestore: ", memoizedSelectedFile);

      getDownloadURL(fileRef)
        .then((url) => {
          readFireStoreCsv(url);
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
          setAlertOpen(true);
        });
    }
  }, [memoizedSelectedFile, readFireStoreCsv]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const result = await listAll(storageRef);
        const directories = result.prefixes.map((prefixRef) => prefixRef.name);
        const fileNames = result.items.map((itemRef) => {
          const fileName = itemRef.name;
          if (fileName) {
            return {
              fileString: fileName,
              fileRef: `${directoryName}/${fileName}`,
            };
          }
          return null;
        });
        setFiles(fileNames.filter(Boolean) as FileDescriptions[]);

        for (const directory of directories) {
          const directoryRef = ref(myStorage, `${directoryName}/${directory}/`);
          const directoryResult = await listAll(directoryRef);
          const directoryString = directory.split("_").slice(0, -1).join(" ");
          const directoryFileNames = directoryResult.items.map((itemRef) => {
            const fileName = itemRef.name;
            if (fileName) {
              return {
                fileString: `${directoryString} ${fileName}`,
                fileRef: `${directoryName}/${directory}/${fileName}`,
              };
            }
            return null;
          });
          setFiles((prevFiles) => [
            ...prevFiles,
            ...(directoryFileNames.filter(Boolean) as FileDescriptions[]),
          ]);
        }
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
