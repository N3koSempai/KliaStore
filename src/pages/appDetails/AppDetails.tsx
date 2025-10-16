import { Box, Typography, Button, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowBack } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { AppStream } from "../../types";
import { Terminal } from "../../components/Terminal";

interface AppDetailsProps {
  app: AppStream;
  onBack: () => void;
}

export const AppDetails = ({ app, onBack }: AppDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutput, setInstallOutput] = useState<string[]>([]);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "success" | "error">("idle");

  // Escuchar eventos de instalación
  useEffect(() => {
    const unlistenOutput = listen<string>("install-output", (event) => {
      setInstallOutput((prev) => [...prev, event.payload]);
    });

    const unlistenError = listen<string>("install-error", (event) => {
      setInstallOutput((prev) => [...prev, `Error: ${event.payload}`]);
    });

    const unlistenCompleted = listen<number>("install-completed", (event) => {
      setIsInstalling(false);
      if (event.payload === 0) {
        setInstallOutput((prev) => [...prev, "", "✓ Instalación completada exitosamente."]);
        setInstallStatus("success");
      } else {
        setInstallOutput((prev) => [...prev, "", `✗ Instalación falló con código: ${event.payload}`]);
        setInstallStatus("error");
      }
    });

    return () => {
      unlistenOutput.then((fn) => fn());
      unlistenError.then((fn) => fn());
      unlistenCompleted.then((fn) => fn());
    };
  }, []);

  // Función para limpiar HTML de la descripción
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

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

  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallStatus("installing");
    setInstallOutput([
      "Preparando instalación personalizada...",
      "Descargando referencia de flatpak...",
      ""
    ]);

    try {
      await invoke("install_flatpak", {
        appId: app.id,
      });
    } catch (error) {
      setIsInstalling(false);
      setInstallStatus("error");
      setInstallOutput((prev) => [
        ...prev,
        "",
        `✗ Error al invocar comando: ${error}`,
      ]);
    }
  };

  const handleDownloadLog = () => {
    const logContent = installOutput.join("\n");
    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `install-log-${app.id}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAccept = () => {
    setInstallStatus("idle");
    setInstallOutput([]);
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

      {/* Sección de Screenshots - Carrusel, Terminal o Resultado */}
      <Box sx={{ mb: 4 }}>
        {installStatus === "installing" ? (
          <>
            <Typography variant="h6" gutterBottom textAlign="center">
              Instalación en progreso
            </Typography>
            <Terminal output={installOutput} isRunning={isInstalling} />
          </>
        ) : installStatus === "success" || installStatus === "error" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              p: 4,
            }}
          >
            {/* Animación */}
            <Box sx={{ width: 300, height: 300 }}>
              <DotLottieReact
                key={installStatus}
                src={installStatus === "success"
                  ? "/src/assets/animations/success.lottie"
                  : "/src/assets/animations/Error.lottie"}
                loop={false}
                autoplay
              />
            </Box>

            {/* Mensaje */}
            <Typography variant="h5" textAlign="center">
              {installStatus === "success"
                ? "¡Instalación completada exitosamente!"
                : "Error en la instalación"}
            </Typography>

            {/* Botones */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleDownloadLog}
                sx={{ px: 3 }}
              >
                Obtener log
              </Button>
              <Button
                variant="contained"
                onClick={handleAccept}
                sx={{ px: 3 }}
              >
                Aceptar
              </Button>
            </Box>
          </Box>
        ) : (
          app.screenshots &&
          app.screenshots.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom textAlign="center">
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
            </>
          )
        )}
      </Box>

      {/* Descripción */}
      {app.description && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Acerca de esta aplicación
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {stripHtml(app.description)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
