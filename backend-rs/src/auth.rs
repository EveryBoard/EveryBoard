use tokio_tungstenite::tungstenite::http::HeaderValue;

pub fn extract_user_token(header: &HeaderValue) -> Result<&str, &str> {
    let parts: Vec<&str> = header.to_str().map_err(|_| "Invalid header")?.split(',').collect();
    if parts.len() == 2 && parts[0] == "Authorization" {
        let bearer = parts[1].trim();
        let subparts: Vec<&str> = bearer.split(' ').collect();
        if subparts.len() == 2 && subparts[0] == "Bearer" {
            return Ok(subparts[1]);
        }
    }
    return Err("Invalid header");
}

pub fn check(header: &HeaderValue) -> Result<&str, &str> {
    return extract_user_token(header);
}
