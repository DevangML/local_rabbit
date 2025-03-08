import React, { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useWorker } from "../../hooks/useWorker";

export const FeatureDemo: React.FC = () => {
        const [result, setResult] = useState<string | null>(null);
        
        const { postMessage, loading, error } = useWorker<{ type: string }, string>(
          () => new Worker(new URL("../../workers/calculator.worker.ts", import.meta.url), { type: "module" }),
          (data: string) => {
            setResult(data);
          }
        );

        const handleProcess = () => {
          postMessage({ type: "process" });
        };

        return (
          <Box sx={ { p: 3 } }>
            <Typography variant="h4" gutterBottom>
              Feature Demo
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={ handleProcess }
              disabled={ loading }
              sx={ { mt: 2 } }
            >
              { loading ? <CircularProgress size={ 24 } /> : "Process Data" }
            </Button>
            
            { error && (
              <Typography color="error" sx={ { mt: 2 } }>
                Error: { error.message }
              </Typography>
            ) }
            
            { result && (
              <Box sx={ { mt: 2 } }>
                <Typography variant="h6">Result:</Typography>
                <pre>{ result }</pre>
              </Box>
            ) }
          </Box>
        );
};
