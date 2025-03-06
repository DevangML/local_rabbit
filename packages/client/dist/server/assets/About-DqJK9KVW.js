import { jsxDEV } from "react/jsx-dev-runtime";
import "react";
import { Box, Container, Stack, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";
const About = () => {
  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      bio: "Passionate about making code analysis accessible to everyone.",
      avatar: "/avatars/john.jpg"
    },
    {
      name: "Jane Smith",
      role: "Lead Developer",
      bio: "Expert in static code analysis and performance optimization.",
      avatar: "/avatars/jane.jpg"
    }
    // Add more team members as needed
  ];
  return /* @__PURE__ */ jsxDEV(Box, { sx: { py: 6 }, children: /* @__PURE__ */ jsxDEV(Container, { maxWidth: "lg", children: /* @__PURE__ */ jsxDEV(Stack, { spacing: 6, children: [
    /* @__PURE__ */ jsxDEV(Box, { children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h3", gutterBottom: true, align: "center", sx: { mb: 4 }, children: "Our Mission" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 36,
        columnNumber: 13
      }, void 0),
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", align: "center", color: "text.secondary", sx: { mb: 4 }, children: "We're on a mission to make code analysis and review processes more efficient and insightful through the power of AI and advanced visualization techniques." }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 39,
        columnNumber: 13
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
      lineNumber: 35,
      columnNumber: 11
    }, void 0),
    /* @__PURE__ */ jsxDEV(Box, { children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", gutterBottom: true, sx: { mb: 4 }, children: "Our Values" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 47,
        columnNumber: 13
      }, void 0),
      /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 3, children: [
        {
          title: "Innovation",
          description: "Constantly pushing the boundaries of what's possible in code analysis."
        },
        {
          title: "Quality",
          description: "Committed to delivering the highest quality tools and insights."
        },
        {
          title: "Collaboration",
          description: "Fostering a community of developers working together."
        }
      ].map((value) => /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxDEV(Card, { elevation: 0, sx: { height: "100%", border: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsxDEV(CardContent, { children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: value.title }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
          lineNumber: 68,
          columnNumber: 23
        }, void 0),
        /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", children: value.description }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
          lineNumber: 71,
          columnNumber: 23
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 67,
        columnNumber: 21
      }, void 0) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 66,
        columnNumber: 19
      }, void 0) }, value.title, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 65,
        columnNumber: 17
      }, void 0)) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 50,
        columnNumber: 13
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
      lineNumber: 46,
      columnNumber: 11
    }, void 0),
    /* @__PURE__ */ jsxDEV(Box, { children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", gutterBottom: true, sx: { mb: 4 }, children: "Our Team" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 83,
        columnNumber: 13
      }, void 0),
      /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 4, children: teamMembers.map((member) => /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxDEV(Card, { elevation: 0, sx: { height: "100%", border: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV(Stack, { spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ jsxDEV(
          Avatar,
          {
            src: member.avatar,
            alt: member.name,
            sx: { width: 120, height: 120, mb: 2 }
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
            lineNumber: 92,
            columnNumber: 25
          },
          void 0
        ),
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", align: "center", children: member.name }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
          lineNumber: 97,
          columnNumber: 25
        }, void 0),
        /* @__PURE__ */ jsxDEV(Typography, { variant: "subtitle1", color: "primary", align: "center", children: member.role }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
          lineNumber: 100,
          columnNumber: 25
        }, void 0),
        /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", align: "center", children: member.bio }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
          lineNumber: 103,
          columnNumber: 25
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 91,
        columnNumber: 23
      }, void 0) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 90,
        columnNumber: 21
      }, void 0) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 89,
        columnNumber: 19
      }, void 0) }, member.name, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 88,
        columnNumber: 17
      }, void 0)) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
        lineNumber: 86,
        columnNumber: 13
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
      lineNumber: 82,
      columnNumber: 11
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
    lineNumber: 33,
    columnNumber: 9
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
    lineNumber: 32,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/About/About.jsx",
    lineNumber: 31,
    columnNumber: 5
  }, void 0);
};
export {
  About as default
};
