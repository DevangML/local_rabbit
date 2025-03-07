import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Code as CodeIcon,
} from "@mui/icons-material";

const Products = () => {
  const analysisCards = [
    {
      title: "Diff Viewer",
      description: "Compare changes between branches with an interactive diff viewer",
      icon: <TimelineIcon fontSize="large" color="primary" />,
      path: "/diff",
    },
    {
      title: "AI Analyzer",
      description: "Get AI-powered insights about your code changes",
      icon: <AnalyticsIcon fontSize="large" color="primary" />,
      path: "/analyze",
    },
    {
      title: "Impact Analysis",
      description: "Understand the impact of changes across your codebase",
      icon: <SpeedIcon fontSize="large" color="primary" />,
      path: "/impact",
    },
    {
      title: "Quality Check",
      description: "Analyze code quality and identify potential issues",
      icon: <CodeIcon fontSize="large" color="primary" />,
      path: "/quality",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Repository Analysis
      </Typography>

      <Grid container spacing={3}>
        {analysisCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "void translateY(-4px)",
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography color="text.secondary">
            No recent activity to display
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Products; 