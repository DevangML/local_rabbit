import React, { Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route } from "react-router-dom";
import { createTheme } from "@mui/material/styles";

const theme = createTheme();
import { FeatureDemo } from "./components/FeatureDemo";

// Lazy load home component
const Home = React.lazy(() => import("./pages/Home"));

export default function App(): JSX.Element {
    return (
        <Box sx={{ 
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh"
        }}>
            <Suspense fallback={
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <CircularProgress />
                </Box>
            }>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Routes>
                        <Route path="/" element={<FeatureDemo />} />
                        <Route path="/home" element={<Home />} />
                    </Routes>
                </ThemeProvider>
            </Suspense>
        </Box>
    );
} 