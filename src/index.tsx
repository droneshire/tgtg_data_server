import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import blue from "@mui/material/colors/blue";
import blueGrey from "@mui/material/colors/blueGrey";

import "index.css";
import App from "components/App";
import { LinkBehavior } from "components/utils/links";

// Set default link components to ref forwarding react-router links
const mdTheme = createTheme({
  palette: {
    primary: blue,
    secondary: blueGrey,
  },
  components: {
    MuiLink: {
      // TODO: figure out how to avoid `as any` here
      defaultProps: {
        component: LinkBehavior,
      } as any,
    },
    MuiListItemButton: {
      defaultProps: {
        component: LinkBehavior,
      } as any,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={mdTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
