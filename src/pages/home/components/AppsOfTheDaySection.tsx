import { Box, Typography, Grid, Card, CardContent, Skeleton } from "@mui/material";
import { useAppsOfTheWeek } from "../../../hooks/useAppsOfTheWeek";
import type { AppStream } from "../../../types";

interface AppsOfTheDaySectionProps {
  onAppSelect: (app: AppStream) => void;
}

export const AppsOfTheDaySection = ({ onAppSelect }: AppsOfTheDaySectionProps) => {
  const { data, isLoading, error } = useAppsOfTheWeek();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Aplicaciones de la semana
      </Typography>

      {error && (
        <Typography color="error">
          Error al cargar las aplicaciones: {error.message}
        </Typography>
      )}

      <Grid container spacing={2}>
        {isLoading || !data ? (
          Array.from(new Array(5)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card sx={{ height: 240, minWidth: 200, maxWidth: 250, display: "flex", flexDirection: "column" }}>
                <Skeleton variant="rectangular" height={140} sx={{ flexShrink: 0 }} />
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          data.map((app) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={app.app_id}>
              <Card
                onClick={() => app.appStream && onAppSelect(app.appStream)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                  height: 240,
                  minWidth: 200,
                  maxWidth: 250,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    height: 140,
                    bgcolor: "grey.700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt={app.name || app.app_id}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin imagen
                    </Typography>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Typography variant="body2" noWrap title={app.name || app.app_id}>
                    {app.name || app.app_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    #{app.position}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};
