use thiserror::Error;

use crate::{auth::AuthError, config::ConfigError};

#[derive(Debug, Error)]
pub enum ServerError {
    #[error("Configuration error: {0}")]
    Config(#[from] ConfigError),

    #[error("Authentication error: {0}")]
    Auth(#[from] AuthError),
}
