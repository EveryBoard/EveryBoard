use tokio_tungstenite::tungstenite::http::HeaderValue;
use reqwest::Client;
use std::collections::HashMap;
use std::sync::{RwLock, OnceLock};
use std::time::{Duration, Instant};
use jsonwebtoken::{Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::config;
use crate::error::ServerError;


#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Unexpected internal error: {0}")]
    Internal(String),

    #[error("Invalid JWT token: {0}")]
    InvalidToken(String),
}

static GOOGLE_CERTS_URL: &str = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

fn extract_max_age(cache_control_str: &str) -> Result<u64, AuthError> {
    println!("cache control: {}\n", cache_control_str);
    return cache_control_str
        .split(',')
        .map(str::trim)
        .find_map(|part| part.strip_prefix("max-age=")?.parse::<u64>().ok())
        .ok_or_else(|| AuthError::Internal("Missing max-age".to_string()));
}

async fn fetch_certs() -> Result<(HashMap<String, String>, Instant), AuthError> {
    let client = Client::new();
    let response = client.get(GOOGLE_CERTS_URL).send().await
                                                      .map_err(|_| AuthError::Internal("Cannot fetch certificates".to_string()))?;
    let headers = response.headers().clone();
    let keys = response.json::<HashMap<String, String>>().await
                                                         .map_err(|_| AuthError::Internal("Cannot parse certificates response".to_string()))?;

    let cache_control = headers.get("Cache-Control")
                               .ok_or(AuthError::Internal("Missing Cache-Control".to_string()))?
                               .to_str()
                               .map_err(|_| AuthError::Internal("Cannot convert headers to string".to_string()))?;

    let max_age = extract_max_age(cache_control)?;

    return Ok((keys, Instant::now() + Duration::from_secs(max_age)))
}

static GOOGLE_KEYS_CACHE: OnceLock<RwLock<(HashMap<String, String>, Instant)>> = OnceLock::new();

fn get_cached_keys() -> &'static RwLock<(HashMap<String, String>, Instant)> {
    return GOOGLE_KEYS_CACHE.get_or_init(|| RwLock::new((HashMap::new(), Instant::now())));
}

async fn get_certs() -> Result<HashMap<String, String>, AuthError> {
    let error = || AuthError::Internal("Locking issue".to_string());
    let keys_and_expiration = get_cached_keys();
    let expiration = (*(keys_and_expiration.read()) .map_err(|_| error())?).1;
    if expiration <= Instant::now() {
        *(keys_and_expiration.write().map_err(|_| error())?) = fetch_certs().await?;
    }
    return Ok(((keys_and_expiration.read()).map_err(|_| error())?).0.clone())
}


#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    aud: String,
    iss: String,
    exp: usize,
    iat: usize,
    auth_time: usize,
}

pub async fn verify_and_get_uid(token: &str) -> Result<String, ServerError> {
    let error = |reason: &str| ServerError::Auth(AuthError::InvalidToken(reason.to_string()));
    let project_id = config::get_project_id()?;
    let certs = get_certs().await?;
    let header = jsonwebtoken::decode_header(token).map_err(|_| error("cannot decode token"))?;
    let kid = header.kid.ok_or(error("token is missing kid"))?;

    let pem_cert = certs.get(&kid).ok_or(error("no key matches kid"))?;

    if header.alg != Algorithm::RS256 {
        return Err(error("unsupported algorithm"));
    }

    let decoding_key = DecodingKey::from_rsa_pem(pem_cert.as_bytes()).map_err(|_| error("cannot parse RSA PEM"))?;
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[project_id.clone()]);
    let issuer = format!("https://securetoken.google.com/{}", project_id);
    validation.set_issuer(&[issuer]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "iat", "auth_time", "sub"]);
    let token_data = jsonwebtoken::decode::<Claims>(token, &decoding_key, &validation).map_err(|_| error("cannot decode token data"))?;

    if token_data.claims.iat > jsonwebtoken::get_current_timestamp() as usize {
        return Err(error("token iat is in the future"));
    }
    if token_data.claims.auth_time > jsonwebtoken::get_current_timestamp() as usize {
        return Err(error("token auth_time is in the future"));
    }

    Ok(token_data.claims.sub)
}

pub fn extract_user_token(header: &HeaderValue) -> Result<&str, AuthError> {
    let error = || AuthError::InvalidToken("invalid header".to_string());
    let parts: Vec<&str> = header.to_str().map_err(|_| error())?
                                          .split(',').collect();
    if parts.len() == 2 && parts[0] == "Authorization" {
        return Ok(parts[1].trim());
    }
    return Err(error());
}

