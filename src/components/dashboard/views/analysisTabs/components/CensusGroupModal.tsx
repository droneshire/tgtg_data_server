import React, { useEffect } from "react";
import { Modal, Box, Button } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { CensusVariablesDataType } from "utils/us_census";
import { SetMealRounded } from "@mui/icons-material";
import { CensusFields } from "types/user";

interface CensusGroupModalProps {
  open: boolean;
  onClose: (selectedVariables: CensusFields) => void;
  onSave: (selectedVariables: CensusFields) => void;
  variablesData: CensusVariablesDataType;
  groupCode?: string;
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
  onSave,
  variablesData,
}) => {
  const modalRef = React.useRef<HTMLElement>(null);
  const [rows, setRows] = React.useState<CensusVariablesCodeRow[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<GridRowSelectionModel>(
    []
  );

  useEffect(() => {
    const rows: CensusVariablesCodeRow[] = Array.from(variablesData)
      .reduce(
        (
          acc: CensusVariablesCodeRow[],
          [censusCode, codeDescription],
          index
        ) => {
          acc.push({
            id: index,
            censusCode,
            codeDescription,
          });
          return acc;
        },
        []
      )
      .sort((a, b) => a.censusCode.localeCompare(b.censusCode));
    setRows(rows);
  }, [variablesData]);

  const handleButtonClick = () => {
    const newSelectedRows = rows.filter((row) => selectedRows.includes(row.id));
    const selectedRowData = newSelectedRows.reduce(
      (acc, row) => ({ ...acc, [row.censusCode]: row.codeDescription }),
      {}
    );
    onSave(selectedRowData);
  };

  const handleSelectionChange = (selectedRows: GridRowSelectionModel) => {
    setSelectedRows(selectedRows);
  };

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
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        <DataGrid
          sx={{ height: "50%" }}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 50, 100]}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleButtonClick}
          sx={{ marginTop: "16px" }}
        >
          Select Items
        </Button>
      </Box>
    </Modal>
  );
};

export default CensusGroupModal;

export type { CensusGroupModalProps, CensusVariablesCodeRow };
