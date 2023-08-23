import React, { useState, FC } from "react";
import { Typography } from "@mui/material";

import ExampleListingImage from "assets/images/ExampleListingImage.png";

interface ExamplePopProps {
  hoverContent: React.ReactNode;
}

const ExamplePop: FC<ExamplePopProps> = ({ hoverContent }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleMouseEnter = () => {
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  return (
    <div
      className="container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hoverContent}
      {showPopup && (
        <div>
          <Typography variant="h6" gutterBottom>
            Example
          </Typography>
          <img src={ExampleListingImage} alt="ExampleImage" />
        </div>
      )}
    </div>
  );
};

export default ExamplePop;
