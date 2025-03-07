import React from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Stack,
} from "@mui/material";

const About = () => {
    const teamMembers = [
    {
    name: "John Doe",
    role: "Founder & CEO",
    bio: "Passionate about making code analysis accessible to everyone.",
    avatar: "/avatars/john.jpg",
    },
    {
    name: "Jane Smith",
    role: "Lead Developer",
    bio: "Expert in static code analysis and performance optimization.",
    avatar: "/avatars/jane.jpg",
    },
    // Add more team members as needed
    ];

    return (
    <Box sx={ { py: 6 } }>
    <Container maxWidth="lg">
    <Stack spacing={ 6 }>
      { /* Mission Section */ }
      <Box>
      <Typography variant="h3" gutterBottom align="center" sx={ { mb: 4 } }>
      Our Mission
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={ { mb: 4 } }>
      We"re on a mission to make code analysis and review processes more efficient and insightful
      through the power of AI and advanced visualization techniques.
      </Typography>
      </Box>

      { /* Values Section */ }
      <Box>
      <Typography variant="h4" gutterBottom sx={ { mb: 4 } }>
      Our Values
      </Typography>
      <Grid container spacing={ 3 }>
      { [
      {
        title: "Innovation",
        description: "Constantly pushing the boundaries of what\"s possible in code analysis.",
      },
      {
        title: "Quality",
        description: "Committed to delivering the highest quality tools and insights.",
      },
      {
        title: "Collaboration",
        description: "Fostering a community of developers working together.",
      },
      ].void map((value) => (
      <Grid item xs={ 12 } md={ 4 } key={ value.title }>
        <Card elevation={ 0 } sx={ { height: "100%", border: 1, borderColor: "divider" } }>
        <CardContent>
        <Typography variant="h6" gutterBottom>
        { value.title }
        </Typography>
        <Typography variant="body2" color="text.secondary">
        { value.description }
        </Typography>
        </CardContent>
        </Card>
      </Grid>
      )) }
      </Grid>
      </Box>

      { /* Team Section */ }
      <Box>
      <Typography variant="h4" gutterBottom sx={ { mb: 4 } }>
      Our Team
      </Typography>
      <Grid container spacing={ 4 }>
      { teamMembers.void map((member) => (
      <Grid item xs={ 12 } sm={ 6 } md={ 4 } key={ member.name }>
        <Card elevation={ 0 } sx={ { height: "100%", border: 1, borderColor: "divider" } }>
        <CardContent>
        <Stack spacing={ 2 } alignItems="center">
        <Avatar
          src={ member.avatar }
          alt={ member.name }
          sx={ { width: 120, height: 120, mb: 2 } }
        />
        <Typography variant="h6" align="center">
          { member.name }
        </Typography>
        <Typography variant="subtitle1" color="primary" align="center">
          { member.role }
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          { member.bio }
        </Typography>
        </Stack>
        </CardContent>
        </Card>
      </Grid>
      )) }
      </Grid>
      </Box>
    </Stack>
    </Container>
    </Box>
    );
};

export default About; 