import React, { useState } from "react";
import { Chip } from "@mui/material";
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
  const [chips, setChips] = useState(Object.entries(data));

  const handleChipRemove = (key: string) => {
    const updatedChips = chips.filter(([chipKey]) => chipKey !== key);
    setChips(updatedChips);

    const updatedData = Object.fromEntries(updatedChips);
    onChange(updatedData);
  };

  return (
    <>
      {chips.map(([key, value]) => (
        <div key={key}>
          {chips.map(([chipKey, chipValue]) => (
            <Chip
              key={chipKey}
              icon={<PeopleIcon />}
              label={chipValue}
              title={value}
              onDelete={() => handleChipRemove(chipKey)}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default CensusCodeChips;
