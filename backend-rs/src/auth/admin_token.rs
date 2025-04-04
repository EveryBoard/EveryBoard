use std::collections::HashMap;
use std::fs;
use std::sync::RwLock;
use std::time::{Duration, Instant};
use reqwest::header::AUTHORIZATION;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, Map, Value};
use thiserror::Error; // For error handling
use jsonwebtoken::{Algorithm, EncodingKey, Header};

use crate::config;

#[derive(Debug, Error)]
#[error("Error when dealing with admin token: {0}")]
pub struct UserRetrieverError(pub String);


// TODO: move to a models module
#[derive(Deserialize, Serialize)]
enum Role {
    Player,
    Observer,
    Creator,
    ChosenOpponent,
    Candidate,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct MinimalUser {
    id: String,
    name: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CurrentGame {
    id: String,
    game_name: String,
    opponent: Option<MinimalUser>,
    role: Role,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct User {
    username: Option<String>,
    last_update_time: Option<String>,
    verified: bool,
    current_game: Option<CurrentGame>,
}

trait UserRetriever {
    async fn get_user(&self, uid: &str) -> Result<User, UserRetrieverError>;
}

#[derive(Debug)]
struct ServiceAccount {
    email: String,
    private_key: x509_parser::pem::Pem,
}

fn read_service_account_from_file(file: &str) -> Result<ServiceAccount, UserRetrieverError> {
    let json_content = fs::read_to_string(file)
        .map_err(|e| UserRetrieverError(format!("Cannot read service account from file: {}", e)))?;

    let json: Value = from_str(&json_content)
        .map_err(|e| UserRetrieverError(format!("Invalid JSON: {}", e)))?;

    let private_key_pem = json["private_key"].as_str()
        .ok_or_else(|| UserRetrieverError("Missing or invalid private_key field".to_string()))?;

    let (_, private_key) = x509_parser::pem::parse_x509_pem(private_key_pem.as_bytes())
        .map_err(|e| UserRetrieverError(format!("Cannot parse private key: {}", e)))?;

    let email = json["client_email"].as_str()
        .ok_or_else(|| UserRetrieverError("Missing or invalid client_email field".to_string()))?
        .to_string();

    Ok(ServiceAccount { email, private_key })
}

struct AdminToken {
    access_token: String,
    expires_in: Duration,
    fetched_at: Instant,
}

fn encode_jwt(email: &str, private_key: &x509_parser::pem::Pem, scopes: &[&str], audience: &str) -> Result<String, UserRetrieverError> {
    let now = jsonwebtoken::get_current_timestamp();
    let jwt_claims = serde_json::json!({
        "iss": email,
        "scope": scopes.join(" "),
        "aud": audience,
        "exp": now + 3600,
        "iat": now,
    });
    let mut header = Header::new(Algorithm::RS256);
    header.typ = Some("JWT".to_string());
    let key = EncodingKey::from_secret(&private_key.contents);
    let jwt = jsonwebtoken::encode(&header, &jwt_claims, &key)
        .map_err(|e| UserRetrieverError(format!("Cannot encode: {}", e)));
    return jwt;
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    expires_in: u64,
}

async fn request_token(service_account: &ServiceAccount) -> Result<AdminToken, UserRetrieverError> {
    let scopes = ["https://www.googleapis.com/auth/datastore"];
    let audience = "https://www.googleapis.com/oauth2/v4/token";
    let jwt = encode_jwt(&service_account.email, &service_account.private_key, &scopes, audience)?;

    let params = [
        ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
        ("assertion", &jwt),
    ];

    let response_json: TokenResponse = Client::new().post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| UserRetrieverError(format!("Cannot fetch token: {}", e)))?
        .json()
        .await
        .map_err(|e| UserRetrieverError(format!("Cannot extract JSON: {}", e)))?;

    Ok(AdminToken {
        access_token: response_json.access_token,
        expires_in: Duration::from_secs(response_json.expires_in),
        fetched_at: Instant::now(),
    })
}

async fn request_token_if_outdated(service_account: &ServiceAccount, token: AdminToken) -> Result<AdminToken, UserRetrieverError> {
    if token.fetched_at.elapsed() > token.expires_in {
        return request_token(&service_account).await;
    } else {
        return Ok(token);
    }
}

fn convert_firestore(json: &Value) -> Result<Value, UserRetrieverError> {
    fn extract_field((key, value): (&String, &Value)) -> Result<(String, Value), UserRetrieverError> {
        if let Value::Object(map) = value {
            if let Some(inside_map) = map.get("mapValue") {
                let new_map = convert_firestore(inside_map)?;
                return Ok((key.clone(), new_map));
            }
            if let Some(Value::String(s)) = map.get("integerValue") {
                let n = s.parse().map_err(|e| UserRetrieverError(format!("Malformed firestore response: {e}")))?;
                return Ok((key.clone(), Value::Number(n)));
            }
            if map.len() == 1 {
                let value = map.values().next().ok_or(UserRetrieverError(format!("Malformed firestore response: {value}")))?;
                return Ok((key.clone(), value.clone()));
            }
        }
        return Err(UserRetrieverError(format!("Malformed firestore response: Unexpected value: {value}")));

    }

    if let Value::Object(map) = json {
        if map.is_empty() {
            return Ok(json.clone());
        } else {
            if let Some(Value::Object(fields)) = map.get("fields") {
                let new_fields: Result<Vec<(String, Value)>, UserRetrieverError>  = fields.iter().map(extract_field).collect();
                return Ok(Value::Object(new_fields?.into_iter().collect()));
            } else {
                return Err(UserRetrieverError("Malformed Firestore response".to_string()));
            }
        }
    } else {
        return Err(UserRetrieverError("Malformed Firestore response".to_string()));
    }
}

struct FirebaseUserRetriever {
    service_account: ServiceAccount,
    token: RwLock<AdminToken>,
}

impl FirebaseUserRetriever {
    async fn new(service_account_file: &str) -> Result<Self, UserRetrieverError> {
        let service_account = read_service_account_from_file(service_account_file)?;
        let token = request_token(&service_account).await?;
        return Ok (Self { service_account, token: RwLock::new(token) })
    }

    async fn get_authorization_header(&self) -> Result<reqwest::header::HeaderValue, UserRetrieverError> {
        let token_reader = self
            .token
            .read()
            .map_err(|e| UserRetrieverError(format!("Locking error: {e}")))?;
        let current_token = &*token_reader;
        let mut access_token = current_token.access_token.clone();
        if current_token.fetched_at.elapsed() > current_token.expires_in {
            let new_token = request_token(&self.service_account).await?;
            let mut token_writer = self.token.write().map_err(|e| UserRetrieverError(format!("Locking error: {e}")))?;
            access_token = new_token.access_token.clone();
            *token_writer = new_token;
        }
        let bearer_token = format!("Bearer {}", access_token)
            .parse()
            .map_err(|e| UserRetrieverError(format!("Cannot parse header: {e}")))?;
        return Ok(bearer_token);
    }
}


impl UserRetriever for FirebaseUserRetriever {
    async fn get_user(&self, uid: &str) -> Result<User, UserRetrieverError> {
        let authorization_header = self.get_authorization_header().await?;
        let client = Client::new();
        let firebase_endpoint = config::get_firebase_endpoint();
        let endpoint = format!("{firebase_endpoint}/documents/users/{uid}");
        let response_json = client
            .get(endpoint)
            .header(AUTHORIZATION, authorization_header)
            .send()
            .await
            .map_err(|e| UserRetrieverError(format!("Cannot fetch user: {e}")))?
            .json::<Value>()
            .await
            .map_err(|e| UserRetrieverError(format!("Cannot parse JSON: {e}")))?;
        return serde_json::from_value(response_json)
            .map_err(|e| UserRetrieverError(format!("Cannot parse JSON: {e}")));
    }
}
