// src/components/SafeResponsiveChart.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { ResponsiveContainer } from "recharts";

const SafeResponsiveChart = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Typography align="center">Loading chart...</Typography>;
  }

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        {({ width, height }) => (
          <React.Fragment>
            {children}
          </React.Fragment>
        )}
      </ResponsiveContainer>
    </Box>
  );
};

export default SafeResponsiveChart;
