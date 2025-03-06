import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const TerminalLine = ({ content, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <Typography
      variant="code"
      sx={{
        display: 'block',
        color: 'text.primary',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.875rem',
        lineHeight: 1.7,
      }}
    >
      {content}
    </Typography>
  </motion.div>
);

const TerminalPreview = () => {
  const [lines, setLines] = useState([]);
  const commands = [
    { text: '$ local-rabbit init my-project', output: 'Initializing new project...' },
    { text: '✓ Project structure created', output: 'Installing dependencies...' },
    { text: '✓ Dependencies installed', output: 'Configuring development environment...' },
    { text: '✓ Development environment ready', output: 'Your project is ready! Happy coding 🚀' },
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < commands.length) {
        setLines(prev => [...prev, commands[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLines([]);
          currentIndex = 0;
        }, 3000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: 'rgba(255,255,255,0.1)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          display: 'flex',
          gap: '6px',
        }}
      >
        {['#ff5f57', '#ffbd2e', '#28c840'].map((color, index) => (
          <Box
            key={index}
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <AnimatePresence>
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              <TerminalLine
                content={line.text}
                delay={index * 0.5}
              />
              {line.output && (
                <TerminalLine
                  content={line.output}
                  delay={index * 0.5 + 0.25}
                />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </Box>

      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          width: '8px',
          height: '16px',
          backgroundColor: '#bb9af7',
        }}
      />
    </Box>
  );
};

export default TerminalPreview; 