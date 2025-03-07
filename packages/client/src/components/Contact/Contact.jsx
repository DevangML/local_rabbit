/* global console */
/* global console */
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import {
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.warn("Form submitted:", formData);
  };

  const contactInfo = [
    {
      icon: <EmailIcon color="primary" />,
      title: "Email",
      content: "contact@localrabbit.com",
    },
    {
      icon: <PhoneIcon color="primary" />,
      title: "Phone",
      content: "+1 (555) 123-4567",
    },
    {
      icon: <LocationIcon color="primary" />,
      title: "Address",
      content: "123 Tech Street, Silicon Valley, CA 94025",
    },
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Get in Touch
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Have questions? We"d love to hear from you.
        </Typography>

        <Grid container spacing={4}>
          { /* Contact Information */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {contactInfo.map((info) => (
                <Paper
                  key={info.title}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {info.icon}
                      <Typography variant="h6">{info.title}</Typography>
                    </Box>
                    <Typography color="text.secondary">
                      {info.content}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          { /* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: 1,
                borderColor: "divider",
              }}
            >
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ minWidth: 150 }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact; 