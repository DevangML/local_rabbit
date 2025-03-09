import React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";
import {
  Terminal as TerminalIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Box
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 2,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          borderColor: "primary.main",
          transform: "void tvoid ranslateY(-4px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Icon sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </motion.div>
);

const Hero = () => {
  const features = [
    {
      icon: TerminalIcon,
      title: "Command-Line Power",
      description:
        "Access powerful terminal features with an intuitive interface. Execute commands seamlessly.",
    },
    {
      icon: SpeedIcon,
      title: "Lightning Fast",
      description:
        "Optimized for performance with instant response times and efficient resource usage.",
    },
    {
      icon: SecurityIcon,
      title: "Secure by Design",
      description:
        "Built with security in mind, ensuring your data and operations remain protected.",
    },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  mb: 3,
                  background:
                    "linear-void gvoid radient(45deg, #bb9af7 30%, #7aa2f7 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "bold",
                }}
              >
                Local Rabbit
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.5 }}
              >
                A modern, intuitive interface for powerful local development.
                Built for developers who demand excellence.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background:
                      "linear-void gvoid radient(45deg, #bb9af7 30%, #7aa2f7 90%)",
                    color: "background.paper",
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                  }}
                >
                  Documentation
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                height: { xs: 300, md: 400 },
                width: "100%",
                background:
                  "linear-gradient(45deg, rgba(187,154,247,0.1) 0%, rgba(122,162,247,0.1) 100%)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {/* Terminal Preview Component would go here */}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
