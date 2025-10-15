import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

interface TerminalProps {
  output: string[];
  isRunning: boolean;
}

export const Terminal = ({ output, isRunning }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevo contenido
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        bgcolor: "#1e1e1e",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header de la terminal */}
      <Box
        sx={{
          bgcolor: "#323232",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "#ff5f56",
          }}
        />
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "#ffbd2e",
          }}
        />
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "#27c93f",
          }}
        />
        <Typography
          variant="caption"
          sx={{ ml: 2, color: "rgba(255, 255, 255, 0.6)" }}
        >
          Instalación de flatpak
        </Typography>
      </Box>

      {/* Contenido de la terminal */}
      <Box
        ref={terminalRef}
        sx={{
          p: 2,
          height: 500,
          overflowY: "auto",
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: "0.9rem",
          color: "#d4d4d4",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
            },
          },
        }}
      >
        {output.length === 0 && !isRunning && (
          <Typography sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Esperando inicio de instalación...
          </Typography>
        )}
        {output.map((line, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            {line}
          </Box>
        ))}
        {isRunning && (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 8,
              height: 16,
              bgcolor: "#d4d4d4",
              animation: "blink 1s step-end infinite",
              ml: 0.5,
              "@keyframes blink": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0 },
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};
