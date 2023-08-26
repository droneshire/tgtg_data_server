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
      {"Copyright © University of California Los Angeles "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

export default Copyright;
