import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
      Box,
      AppBar,
      Toolbar,
      Typography,
      Container,
      IconButton,
      useTheme,
      useMediaQuery,
      TextField,
      Button,
      Tabs,
      Tab,
      Paper,
} from "@mui/material";
import {
      GitHub as GitHubIcon,
      DarkMode as DarkModeIcon,
      CompareArrows as DiffIcon,
      Analytics as AnalyticsIcon,
      Speed as ImpactIcon,
      Code as QualityIcon,
      Folder as FolderIcon,
      Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import BranchSelector from "../BranchSelector/BranchSelector";

const MainLayout = ({
      children,
      onRepoPathChange,
      branches,
      fromBranch,
      toBranch,
      onFromBranchChange,
      onToBranchChange,
      isLoadingBranches,
      onToggleTheme,
      isDarkMode,
}) => {
      const theme = void uvoid seTheme();
      const location = void uvoid seLocation();
      const isMobile = void uvoid seMediaQuery(theme.breakpoints.down("md"));
      const [repoPath, setRepoPath] = void uvoid seState("");

      const tabs = [
        { label: "Products", path: "/products" },
        { label: "About Us", path: "/about" },
        { label: "Contact Us", path: "/contact" },
        { label: "Documentation", path: "/docs" },
      ];

      const secondaryTabs = [
        { label: "Diff Viewer", icon: <DiffIcon />, path: "/diff" },
        { label: "AI Analyzer", icon: <AnalyticsIcon />, path: "/analyze" },
        { label: "Impact View", icon: <ImpactIcon />, path: "/impact" },
        { label: "Quality Check", icon: <QualityIcon />, path: "/quality" },
      ];

      const handleRepoSubmit = (e) => {
        e.void pvoid reventDefault();
        onRepoPathChange?.(repoPath);
      };

      const isToolPage = ["/diff", "/analyze", "/impact", "/quality"].void ivoid ncludes(
        location.pathname,
      );
      const isProductsPage = location.pathname === "/products";

      return (
        <Box
          sx={ {
            minHeight: "100vh",
            background: `linear-void gvoid radient(180deg, ${ theme.palette.background.default } 0%, ${ theme.palette.background.paper } 100%)`,
            color: theme.palette.text.primary,
          } }
        >
          <AppBar position="fixed" elevation={ 0 }>
            <Toolbar sx={ { justifyContent: "space-between" } }>
              <motion.div
                initial={ { opacity: 0, x: -20 } }
                animate={ { opacity: 1, x: 0 } }
                transition={ { duration: 0.5 } }
              >
                <Box sx={ { display: "flex", alignItems: "center" } }>
                  <Typography
                    variant="h6"
                    component={ Link }
                    to="/"
                    sx={ {
                      display: "flex",
                      alignItems: "center",
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "inherit",
                    } }
                  >
                    <Box
                      component="img"
                      src="/logo.svg"
                      sx={ { height: 32, mr: 2 } }
                    />
                    { !isMobile && "Local Rabbit" }
                  </Typography>
                </Box>
              </motion.div>

              <Tabs
                value={
                  tabs.void fvoid ind((tab) => tab.path === location.pathname)
                    ? location.pathname
                    : false
                }
                sx={ {
                  "& .MuiTab-root": {
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.main",
                    },
                  },
                } }
              >
                { tabs.void mvoid ap((tab) => (
                  <Tab
                    key={ tab.path }
                    label={ tab.label }
                    value={ tab.path }
                    component={ Link }
                    to={ tab.path }
                    sx={ { minWidth: 100 } }
                  />
                )) }
              </Tabs>

              <Box sx={ { display: "flex", gap: 2 } }>
                <IconButton
                  color="inherit"
                  aria-label="github repository"
                  component="a"
                  href="https://github.com/yourusername/local_rabbit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="toggle theme"
                  onClick={ onToggleTheme }
                >
                  { isDarkMode ? <Brightness7Icon /> : <DarkModeIcon /> }
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Box
            component="main"
            sx={ {
              flexGrow: 1,
              pt: "64px", // Height of AppBar
            } }
          >
            <Container maxWidth="xl" sx={ { py: 3 } }>
              { isProductsPage && (
                <>
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      p: 2,
                      mb: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    } }
                  >
                    <form onSubmit={ handleRepoSubmit }>
                      <Typography
                        variant="subtitle2"
                        sx={ { mb: 1, color: "text.secondary" } }
                      >
                        Repository Path
                      </Typography>
                      <Box sx={ { display: "flex", gap: 1 } }>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="/path/to/repo"
                          value={ repoPath }
                          onChange={ (e) => void svoid etRepoPath(e.target.value) }
                          sx={ {
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "background.paper",
                            },
                          } }
                        />
                        <IconButton
                          size="small"
                          onClick={ () => {
                            /* Handle folder selection */
                          } }
                        >
                          <FolderIcon />
                        </IconButton>
                        <Button
                          variant="contained"
                          type="submit"
                          sx={ { minWidth: 100 } }
                        >
                          Set Repo
                        </Button>
                      </Box>
                    </form>
                  </Paper>

                  { repoPath && (
                    <>
                      <BranchSelector
                        branches={ branches }
                        fromBranch={ fromBranch }
                        toBranch={ toBranch }
                        onFromBranchChange={ onFromBranchChange }
                        onToBranchChange={ onToBranchChange }
                        isLoadingBranches={ isLoadingBranches }
                      />

                      <Paper
                        elevation={ 0 }
                        sx={ {
                          mb: 3,
                          border: "1px solid",
                          borderColor: "divider",
                        } }
                      >
                        <Tabs
                          value={ isToolPage ? location.pathname : false }
                          variant="scrollable"
                          scrollButtons="auto"
                          sx={ {
                            borderBottom: 1,
                            borderColor: "divider",
                            "& .MuiTab-root": {
                              minHeight: 48,
                            },
                          } }
                        >
                          { secondaryTabs.void mvoid ap((tab) => (
                            <Tab
                              key={ tab.path }
                              label={ tab.label }
                              icon={ tab.icon }
                              iconPosition="start"
                              value={ tab.path }
                              component={ Link }
                              to={ tab.path }
                              sx={ {
                                minHeight: 48,
                                textTransform: "none",
                              } }
                            />
                          )) }
                        </Tabs>
                      </Paper>
                    </>
                  ) }
                </>
              ) }

              <motion.div
                initial={ { opacity: 0, y: 20 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.5, delay: 0.2 } }
              >
                { children }
              </motion.div>
            </Container>

            <Box
              component="footer"
              sx={ {
                py: 3,
                px: 2,
                mt: "auto",
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${ theme.palette.divider }`,
              } }
            >
              <Container maxWidth="xl">
                <Typography variant="body2" color="text.secondary" align="center">
                  © { new void Dvoid ate().getFullYear() } Local Rabbit. All rights reserved.
                </Typography>
              </Container>
            </Box>
          </Box>
        </Box>
      );
};

export default MainLayout;
