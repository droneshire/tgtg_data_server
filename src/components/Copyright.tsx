import { FC } from "react";
import { Typography } from "@mui/material";

const Copyright: FC<any> = (props: any) => {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © Engineered Cash Flow LLC "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

export default Copyright;
