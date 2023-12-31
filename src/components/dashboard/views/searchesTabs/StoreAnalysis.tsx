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
import { CsvDataRow } from "workers/csvWorker";
import {
  AllStoreProps,
  IndividualStoreProps,
  StoreUsageTime,
  StorePriceDistribution,
  StoreRating,
  StoreDemographics,
  StoreMaps,
  StoreCounts,
  AllMealTypes,
  PriceDistribution,
  StoreMapProps,
} from "./StorePlots";

const StorePlots: React.FC<IndividualStoreProps> = (props) => {
  const { name, dataMaps } = props;
  if (!name) {
    return <></>;
  }

  return (
    <>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          overflowX: "auto",
          marginTop: 2,
          marginBottom: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          "{name}" Analysis
        </Typography>
        <StoreUsageTime name={name} dataMaps={dataMaps} />
        <StorePriceDistribution name={name} dataMaps={dataMaps} />
        <StoreRating name={name} dataMaps={dataMaps} />
        <StoreDemographics name={name} dataMaps={dataMaps} />
      </Box>
    </>
  );
};

const AllStorePlots: React.FC<StoreMapProps> = ({ storeMap }) => {
  const [dataList, setDataList] = useState<CsvDataRow[]>([]);

  useEffect(() => {
    const flattenedList: CsvDataRow[] = [];
    storeMap.forEach((sublist) => {
      flattenedList.push(...sublist);
    });
    setDataList(flattenedList);
  }, [storeMap]);

  return (
    <>
      <StoreMaps storeMap={storeMap} />
      <StoreCounts storeMap={storeMap} />
      <AllMealTypes storeMap={storeMap} />
      <PriceDistribution name="All Stores" dataList={dataList} />
    </>
  );
};

interface StoreSelectorProps {
  storeNames: string[];
  setSelectedStore: (name: string) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = (props) => {
  const { storeNames, setSelectedStore } = props;

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
          onClose={() => {
            handleMenuButtonClose("");
          }}
          TransitionComponent={Fade}
        >
          {storeNames.map((name, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleMenuButtonClose(name);
              }}
            >
              {name}
            </MenuItem>
          ))}
        </Menu>
      </FormGroup>
    </>
  );
};

const StoreAnalysis: React.FC<AllStoreProps> = ({ dataMaps }) => {
  const { storeMap, dateMap } = dataMaps;
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [storeNames, setStoreNames] = useState<string[]>([]);

  const handleSelectedStoreChange = (name: string) => {
    setSelectedStore(name);
  };

  useEffect(() => {
    setSelectedStore("");
    setStoreNames(Array.from(storeMap.keys()).sort());
  }, [storeMap]);

  return (
    <>
      <AllStorePlots storeMap={storeMap} />
      <StoreSelector
        storeNames={storeNames}
        setSelectedStore={handleSelectedStoreChange}
      />
      <StorePlots name={selectedStore} dataMaps={{ storeMap, dateMap }} />
    </>
  );
};

export default StoreAnalysis;
