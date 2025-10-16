use tauri_plugin_shell::ShellExt;
use tauri::Emitter;
use tauri_plugin_http::reqwest;
use std::path::PathBuf;
use std::fs;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn download_flatpakref(app: tauri::AppHandle, app_id: String) -> Result<String, String> {
    let url = format!("https://dl.flathub.org/repo/appstream/{}.flatpakref", app_id);

    app.emit("install-output", format!("Descargando referencia desde {}", url))
        .map_err(|e| format!("Failed to emit: {}", e))?;

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Error descargando flatpakref: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Error HTTP: {}", response.status()));
    }

    let content = response
        .text()
        .await
        .map_err(|e| format!("Error leyendo contenido: {}", e))?;

    // Guardar en directorio temporal
    let cache_dir = std::env::temp_dir();
    let flatpakref_path = cache_dir.join(format!("{}.flatpakref", app_id));

    fs::write(&flatpakref_path, &content)
        .map_err(|e| format!("Error guardando archivo: {}", e))?;

    app.emit("install-output", format!("✓ Referencia descargada: {:?}", flatpakref_path))
        .map_err(|e| format!("Failed to emit: {}", e))?;

    Ok(flatpakref_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn install_flatpak(app: tauri::AppHandle, app_id: String) -> Result<(), String> {
    // Paso 1: Descargar el flatpakref
    let flatpakref_path = download_flatpakref(app.clone(), app_id.clone()).await?;

    // Paso 2: Instalar desde el archivo flatpakref
    app.emit("install-output", "Iniciando instalación desde archivo local...")
        .map_err(|e| format!("Failed to emit: {}", e))?;

    let shell = app.shell();

    let (mut rx, _child) = shell
        .command("flatpak")
        .args(["install", "-y", "--user", &flatpakref_path])
        .spawn()
        .map_err(|e| format!("Failed to spawn flatpak: {}", e))?;

    // Leer la salida en tiempo real
    while let Some(event) = rx.recv().await {
        match event {
            tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                let output = String::from_utf8_lossy(&line);
                app.emit("install-output", output.to_string())
                    .map_err(|e| format!("Failed to emit event: {}", e))?;
            }
            tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                let output = String::from_utf8_lossy(&line);
                app.emit("install-output", output.to_string())
                    .map_err(|e| format!("Failed to emit event: {}", e))?;
            }
            tauri_plugin_shell::process::CommandEvent::Error(err) => {
                app.emit("install-error", err)
                    .map_err(|e| format!("Failed to emit error: {}", e))?;
            }
            tauri_plugin_shell::process::CommandEvent::Terminated(payload) => {
                // Limpiar archivo temporal
                let _ = fs::remove_file(&flatpakref_path);

                app.emit("install-completed", payload.code.unwrap_or(-1))
                    .map_err(|e| format!("Failed to emit completion: {}", e))?;
                break;
            }
            _ => {}
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, install_flatpak, download_flatpakref])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
