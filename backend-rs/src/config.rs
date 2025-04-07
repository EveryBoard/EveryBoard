use std::env;

// Ensure that all required settings are in place. Fail if it is not the case.
pub fn check_config() -> () {
    let _ = get_addr();
    let _ = get_project_id();
    let _ = get_firebase_endpoint();
    let _ = get_service_account_file();
}

pub fn get_addr() -> String {
    return env::var("LISTEN_ADDR").expect("retrieve LISTEN_ADDR config"); // 127.0.0.1:8081
}
pub fn get_project_id() -> String {
    return env::var("PROJECT_ID").expect("retrieve PROJECT_ID config");
}

pub fn get_firebase_endpoint() -> String {
    return env::var("FIREBASE_ENDPOINT").expect("retrieve FIREBASE_ENDPOINT config");
}

pub fn get_service_account_file() -> String {
    return env::var("SERVICE_ACCOUNT").expect("retrieve SERVICE_ACCOUNT config");
}

pub fn with_emulator() -> bool {
    match env::var("WITH_EMULATOR") {
        Ok(_) => true,
        Err(_) => false,
    }
}
