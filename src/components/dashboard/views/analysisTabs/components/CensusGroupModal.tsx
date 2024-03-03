import React, { useEffect } from "react";
import { Modal, Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CensusVariablesDataType } from "utils/us_census";
import { SetMealRounded } from "@mui/icons-material";

interface CensusGroupModalProps {
  open: boolean;
  onClose: () => void;
  groupCode: string;
  variablesData: CensusVariablesDataType;
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "censusCode", headerName: "Census Code", width: 150 },
  {
    field: "codeDescription",
    headerName: "Census Code Description",
    flex: 1,
  },
];

interface CensusVariablesCodeRow {
  id: number;
  censusCode: string;
  codeDescription: string;
}
const CensusGroupModal: React.FC<CensusGroupModalProps> = ({
  open,
  onClose,
  groupCode,
  variablesData,
}) => {
  const modalRef = React.useRef<HTMLElement>(null);
  const [rows, setRows] = React.useState<CensusVariablesCodeRow[]>([]);

  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
    }
    const rows: CensusVariablesCodeRow[] = Array.from(variablesData)
      .reduce(
        (
          acc: CensusVariablesCodeRow[],
          [censusCode, codeDescription],
          index
        ) => {
          if (censusCode === "ucgid" || !censusCode.startsWith(groupCode)) {
            return acc;
          }
          const cleanedCodeDescription = codeDescription.replace(/!!/g, " ");
          acc.push({
            id: index,
            censusCode,
            codeDescription: cleanedCodeDescription,
          });
          return acc;
        },
        []
      )
      .sort((a, b) => a.censusCode.localeCompare(b.censusCode));
    setRows(rows);
  }, [variablesData]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        ref={modalRef}
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <DataGrid rows={rows} columns={columns} autoHeight />
      </Box>
    </Modal>
  );
};

export default CensusGroupModal;

export type { CensusGroupModalProps, CensusVariablesCodeRow };
