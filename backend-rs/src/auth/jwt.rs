use tokio_tungstenite::tungstenite::http::HeaderValue;
use reqwest::Client;
use std::collections::HashMap;
use std::sync::{RwLock, OnceLock};
use std::time::{Duration, Instant};
use jsonwebtoken::{Algorithm, DecodingKey, Validation};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::config;
use crate::error::ServerError;


#[derive(Debug, Error)]
#[error("JWT error: {0}")]
pub struct JwtError(pub String);

static GOOGLE_CERTS_URL: &str = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

fn extract_max_age(cache_control_str: &str) -> Result<u64, JwtError> {
    println!("cache control: {}\n", cache_control_str);
    return cache_control_str
        .split(',')
        .map(str::trim)
        .find_map(|part| part.strip_prefix("max-age=")?.parse::<u64>().ok())
        .ok_or_else(|| JwtError("Missing max-age".to_string()));
}

async fn fetch_certs() -> Result<(HashMap<String, String>, Instant), JwtError> {
    let client = Client::new();
    let response = client
        .get(GOOGLE_CERTS_URL)
        .send()
        .await
        .map_err(|e| JwtError(format!("Cannot fetch certificates: {}", e)))?;
    let headers = response.headers().clone();
    let keys = response
        .json::<HashMap<String, String>>()
        .await
        .map_err(|e| JwtError(format!("Cannot parse certificates response: {}", e)))?;

    let cache_control = headers
        .get("Cache-Control")
        .ok_or(JwtError("Missing Cache-Control".to_string()))?
        .to_str()
        .map_err(|e| JwtError(format!("Cannot convert headers to string: {}", e)))?;

    let max_age = extract_max_age(cache_control)?;

    return Ok((keys, Instant::now() + Duration::from_secs(max_age)));
}

// TODO: use a service with state instead of this, will be easier to test/mock it
static GOOGLE_KEYS_CACHE: OnceLock<RwLock<(HashMap<String, String>, Instant)>> = OnceLock::new();

fn get_cached_keys() -> &'static RwLock<(HashMap<String, String>, Instant)> {
    return GOOGLE_KEYS_CACHE.get_or_init(|| RwLock::new((HashMap::new(), Instant::now())));
}

async fn get_certs() -> Result<HashMap<String, String>, JwtError> {
    let keys_and_expiration = get_cached_keys();
    let expiration = (*(keys_and_expiration.read())
                      .map_err(|e| JwtError(format!("Locking issue: {}", e)))?)
                      .1;
    if expiration <= Instant::now() {
        *(keys_and_expiration.write().map_err(|e| JwtError(format!("Locking issue: {}", e)))?) = fetch_certs().await?;
    }
    return Ok(((keys_and_expiration.read())
               .map_err(|e| JwtError(format!("Locking issue: {}", e)))?).0.clone());
}


#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    aud: String,
    iss: String,
    exp: u64,
    iat: u64,
    auth_time: u64,
}

fn get_uid_of_emulator_token(token: &str) -> Result<String, ServerError> {
    fn b64_decode<T: AsRef<[u8]>>(input: T) -> Result<Vec<u8>, ServerError> {
        URL_SAFE_NO_PAD.decode(input)
                       .map_err(|e| ServerError::Jwt(JwtError(format!("Invalid token: {}", e))))
    }
    let parts: Vec<&str> = token.split('.').collect();
    let data: Vec<u8> = b64_decode(parts[1])?;
    println!("data: {}", String::from_utf8(data.clone()).unwrap());
    let claims: Claims = serde_json::from_slice(&data)
        .map_err(|e| ServerError::Jwt(JwtError(format!("Invalid token: {}", e))))?;
    return Ok(claims.sub);
}

pub async fn verify_and_get_uid(token: &str) -> Result<String, ServerError> {
    println!("verify");
    if config::with_emulator() {
        println!("with emulator");
        return get_uid_of_emulator_token(token);
    }
    println!("without emulator");
    let project_id = config::get_project_id();
    let certs = get_certs().await?;
    let header = jsonwebtoken::decode_header(token)
        .map_err(|e| ServerError::Jwt(JwtError(format!("Cannot decode: {}", e))))?;
    let kid = header
        .kid
        .ok_or(JwtError("Token is missing kid".to_string()))?;

    let pem_cert = certs
        .get(&kid)
        .ok_or(JwtError("No key matches kid".to_string()))?;

    if header.alg != Algorithm::RS256 {
        return Err(ServerError::Jwt(JwtError(format!("Unsupported algorithm: {:?} ", header.alg))));
    }

    let decoding_key = DecodingKey::from_rsa_pem(pem_cert.as_bytes())
        .map_err(|e| ServerError::Jwt(JwtError(format!("Cannot parse RSA PEM: {}", e))))?;
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[project_id.clone()]);
    let issuer = format!("https://securetoken.google.com/{}", project_id);
    validation.set_issuer(&[issuer]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "iat", "auth_time", "sub"]);
    let token_data = jsonwebtoken::decode::<Claims>(token, &decoding_key, &validation)
        .map_err(|e| ServerError::Jwt(JwtError(format!("Cannot decode token data: {}", e))))?;

    if token_data.claims.iat > jsonwebtoken::get_current_timestamp() {
        return Err(ServerError::Jwt(JwtError(format!("Token iat is in the future: {}", token_data.claims.iat))));
    }
    if token_data.claims.auth_time > jsonwebtoken::get_current_timestamp() {
        return Err(ServerError::Jwt(JwtError(format!("Token auth_time is in the future: {}", token_data.claims.auth_time))));
    }

    return Ok(token_data.claims.sub);
}

pub fn extract_user_token(header: &HeaderValue) -> Result<&str, JwtError> {
    let error = || JwtError("invalid header".to_string());
    let parts: Vec<&str> = header
        .to_str()
        .map_err(|e| JwtError(format!("Invalid header: {}", e)))?
        .split(',').collect();
    if parts.len() == 2 && parts[0] == "Authorization" {
        return Ok(parts[1].trim());
    }
    return Err(error());
}

