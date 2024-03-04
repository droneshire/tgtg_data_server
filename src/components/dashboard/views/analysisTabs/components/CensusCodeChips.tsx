import React, { useEffect, useState } from "react";
import { Box, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { CensusFields } from "types/user";

type CensusCodeChipsProps = {
  data: CensusFields;
  onChange: (updatedData: CensusFields) => void;
};

const CensusCodeChips: React.FC<CensusCodeChipsProps> = ({
  data,
  onChange,
}) => {
  const [chips, setChips] = useState<string[]>([]);

  useEffect(() => {
    const setOfGroups = new Set<string>();

    Object.entries(data).map((item: [string, string]) => {
      const [code, value] = item;
      const group = code.split("_")[0];
      setOfGroups.add(group);
    });

    setChips(Array.from(setOfGroups));
  }, [data]);

  const handleChipRemove = (key: string) => {
    const updatedChips = chips.filter((chipKey) => chipKey !== key);
    setChips(updatedChips);

    const updatedData: CensusFields = {};

    Object.entries(data).forEach((item: [string, string]) => {
        const [code, value] = item;
        const group = code.split("_")[0];
        if (updatedChips.includes(group)) {
            updatedData[code] = value;
        }
    });

    onChange(updatedData);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
        {chips.map((chipKey) => (
          <div key={chipKey}>
            <Chip
              key={chipKey}
              icon={<PeopleIcon />}
              label={chipKey}
              title={chipKey}
              onDelete={() => handleChipRemove(chipKey)}
            />
          </div>
        ))}
      </Box>
    </>
  );
};

export default CensusCodeChips;
