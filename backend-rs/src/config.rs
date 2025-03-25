use thiserror::Error;
use std::env;

#[derive(Debug, Error)]
#[error("Missing configuration element: {0}")]
pub struct ConfigError(pub String);

// Ensure that all required settings are in place
pub fn check_config() -> Result<(), ConfigError> {
    let _project_id = get_project_id()?;
    return Ok(())
}

pub fn get_project_id() -> Result<String, ConfigError> {
    return env::var("PROJECT_ID").map_err(|_| ConfigError("PROJECT_ID".to_string()));
}

pub fn with_emulator() -> bool {
    match env::var("WITH_EMULATOR") {
        Ok(_) => true,
        Err(_) => false,
    }
}
