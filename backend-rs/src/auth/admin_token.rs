use std::fs;
use serde_json::{Value, from_str};
use x509_parser::pem::parse_x509_private_key;
use thiserror::Error; // For error handling

#[derive(Debug)]
struct ServiceAccount {
    email: String,
    private_key: openssl::rsa::Rsa<openssl::pkey::Private>,
}

#[derive(Debug, Error)]
#[error("Error when dealing with admin token: {0}")]
pub struct AdminTokenError(pub String);

fn read_service_account_from_file(file: &str) -> Result<ServiceAccount, Errors> {
    let json_content = fs::read_to_string(file)
        .map_err(|e| AdminTokenError(format!("Cannot read service account from file: {}", e)))?;

    let json: Value = from_str(&json_content)
        .map_err(|e| AdminTokenError(format!("Invalid JSON: {}", e)))?;

    let private_key_pem = json["private_key"].as_str()
        .ok_or_else(|| AdminTokenError("Missing or invalid private_key field".to_string()))?;

    let private_key = parse_x509_private_key(private_key_pem.as_bytes())
        .map_err(|_| AdminTokenError("Cannot parse private key".to_string()))?;

    let email = json["client_email"].as_str()
        .ok_or_else(|| Errors::UnexpectedError("Missing or invalid client_email field".to_string()))?
        .to_string();

    Ok(ServiceAccount { email, private_key })
}
