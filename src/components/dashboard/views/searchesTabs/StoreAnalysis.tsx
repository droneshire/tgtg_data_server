import React, { useEffect, useState } from "react";
import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Fade,
  FormGroup,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

interface StoreUsageTimeProps {
  name: string;
}

const StoreUsageTime: React.FC<StoreUsageTimeProps> = (props) => {
  const { name } = props;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {name}
      </Typography>
    </>
  );
};

interface StoreAnalysisProps {
  storeNames: string[];
}

const StoreAnalysis: React.FC<StoreAnalysisProps> = (props) => {
  const { storeNames } = props;
  const [selectedStore, setSelectedStore] = useState<string>("");

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const openMenu = Boolean(menuAnchorEl);

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuButtonClose = (name: string) => {
    setMenuAnchorEl(null);
    setSelectedStore(name);
  };

  useEffect(() => {
    setSelectedStore("");
  }, [storeNames]);

  return (
    <>
      <FormGroup>
        <Button
          id="fade-button"
          aria-controls={openMenu ? "fade-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? "true" : undefined}
          onClick={handleMenuButtonClick}
          variant="contained"
        >
          Select Store
          <ArrowDropDown />
        </Button>
        <Menu
          id="fade-menu-stores"
          MenuListProps={{
            "aria-labelledby": "fade-button",
          }}
          anchorEl={menuAnchorEl}
          open={openMenu}
          onClose={handleMenuButtonClose}
          TransitionComponent={Fade}
        >
          {storeNames.map((name) => (
            <MenuItem
              key={name}
              onClick={() => {
                handleMenuButtonClose(name);
              }}
            >
              {name}
            </MenuItem>
          ))}
        </Menu>
        <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
        <Box sx={{ height: "100%", width: "100%", overflowX: "auto" }}>
          {selectedStore && <StoreUsageTime name={selectedStore} />}
        </Box>
      </FormGroup>
    </>
  );
};

export default StoreAnalysis;
