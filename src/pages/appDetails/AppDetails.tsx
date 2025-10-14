import { Box, Typography, Button, IconButton } from "@mui/material";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowBack } from "@mui/icons-material";
import type { AppStream } from "../../types";

interface AppDetailsProps {
  app: AppStream;
  onBack: () => void;
}

export const AppDetails = ({ app, onBack }: AppDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    if (app.screenshots && app.screenshots.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? app.screenshots!.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (app.screenshots && app.screenshots.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === app.screenshots!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleInstall = () => {
    // TODO: Implementar lógica de instalación
    console.log("Instalando:", app.id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Botón de regreso */}
      <IconButton onClick={onBack} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      {/* Sección superior: Icono, Nombre y Botón Instalar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Icono */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "grey.800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {app.icon ? (
              <img
                src={app.icon}
                alt={app.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sin icono
              </Typography>
            )}
          </Box>

          {/* Nombre y Summary */}
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {app.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {app.summary}
            </Typography>
          </Box>
        </Box>

        {/* Botón Instalar */}
        <Button
          variant="contained"
          size="large"
          onClick={handleInstall}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Instalar
        </Button>
      </Box>

      {/* Sección de Screenshots - Carrusel */}
      {app.screenshots && app.screenshots.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Capturas de pantalla
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {/* Imagen actual */}
            <Box
              sx={{
                width: "100%",
                height: 500,
                bgcolor: "grey.900",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={app.screenshots[currentImageIndex].url}
                alt={`Screenshot ${currentImageIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Controles del carrusel */}
            {app.screenshots.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>

                {/* Indicadores */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  {app.screenshots.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor:
                          index === currentImageIndex
                            ? "primary.main"
                            : "grey.600",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          bgcolor:
                            index === currentImageIndex
                              ? "primary.main"
                              : "grey.500",
                        },
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Descripción */}
      {app.description && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Acerca de esta aplicación
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {app.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
