use thiserror::Error;

use crate::auth::jwt::JwtError;

#[derive(Debug, Error)]
pub enum ServerError {
    #[error("{0}")]
    Jwt(#[from] JwtError),
}
