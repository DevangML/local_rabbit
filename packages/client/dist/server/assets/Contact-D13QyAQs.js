import { jsxDEV } from "react/jsx-dev-runtime";
import { useState } from "react";
import { Box, Container, Typography, Grid, Stack, Paper, TextField, Button } from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };
  const contactInfo = [
    {
      icon: /* @__PURE__ */ jsxDEV(Email, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 42,
        columnNumber: 13
      }, void 0),
      title: "Email",
      content: "contact@localrabbit.com"
    },
    {
      icon: /* @__PURE__ */ jsxDEV(Phone, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 47,
        columnNumber: 13
      }, void 0),
      title: "Phone",
      content: "+1 (555) 123-4567"
    },
    {
      icon: /* @__PURE__ */ jsxDEV(LocationOn, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 52,
        columnNumber: 13
      }, void 0),
      title: "Address",
      content: "123 Tech Street, Silicon Valley, CA 94025"
    }
  ];
  return /* @__PURE__ */ jsxDEV(Box, { sx: { py: 6 }, children: /* @__PURE__ */ jsxDEV(Container, { maxWidth: "lg", children: [
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h3", align: "center", gutterBottom: true, children: "Get in Touch" }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
      lineNumber: 61,
      columnNumber: 9
    }, void 0),
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", align: "center", color: "text.secondary", sx: { mb: 6 }, children: "Have questions? We'd love to hear from you." }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
      lineNumber: 64,
      columnNumber: 9
    }, void 0),
    /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxDEV(Stack, { spacing: 3, children: contactInfo.map((info) => /* @__PURE__ */ jsxDEV(
        Paper,
        {
          elevation: 0,
          sx: {
            p: 3,
            border: 1,
            borderColor: "divider"
          },
          children: /* @__PURE__ */ jsxDEV(Stack, { spacing: 2, children: [
            /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              info.icon,
              /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", children: info.title }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 85,
                columnNumber: 23
              }, void 0)
            ] }, void 0, true, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 83,
              columnNumber: 21
            }, void 0),
            /* @__PURE__ */ jsxDEV(Typography, { color: "text.secondary", children: info.content }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 87,
              columnNumber: 21
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
            lineNumber: 82,
            columnNumber: 19
          }, void 0)
        },
        info.title,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
          lineNumber: 73,
          columnNumber: 17
        },
        void 0
      )) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 71,
        columnNumber: 13
      }, void 0) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 70,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 8, children: /* @__PURE__ */ jsxDEV(
        Paper,
        {
          elevation: 0,
          sx: {
            p: 4,
            border: 1,
            borderColor: "divider"
          },
          children: /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxDEV(
              TextField,
              {
                fullWidth: true,
                label: "Name",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 109,
                columnNumber: 21
              },
              void 0
            ) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 108,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxDEV(
              TextField,
              {
                fullWidth: true,
                label: "Email",
                name: "email",
                type: "email",
                value: formData.email,
                onChange: handleChange,
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 119,
                columnNumber: 21
              },
              void 0
            ) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 118,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxDEV(
              TextField,
              {
                fullWidth: true,
                label: "Subject",
                name: "subject",
                value: formData.subject,
                onChange: handleChange,
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 130,
                columnNumber: 21
              },
              void 0
            ) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 129,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxDEV(
              TextField,
              {
                fullWidth: true,
                label: "Message",
                name: "message",
                multiline: true,
                rows: 4,
                value: formData.message,
                onChange: handleChange,
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 140,
                columnNumber: 21
              },
              void 0
            ) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 139,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxDEV(
              Button,
              {
                type: "submit",
                variant: "contained",
                size: "large",
                sx: { minWidth: 150 },
                children: "Send Message"
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
                lineNumber: 152,
                columnNumber: 21
              },
              void 0
            ) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
              lineNumber: 151,
              columnNumber: 19
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
            lineNumber: 107,
            columnNumber: 17
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
            lineNumber: 106,
            columnNumber: 15
          }, void 0)
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
          lineNumber: 98,
          columnNumber: 13
        },
        void 0
      ) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
        lineNumber: 97,
        columnNumber: 11
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
      lineNumber: 68,
      columnNumber: 9
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
    lineNumber: 60,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Contact/Contact.jsx",
    lineNumber: 59,
    columnNumber: 5
  }, void 0);
};
export {
  Contact as default
};
