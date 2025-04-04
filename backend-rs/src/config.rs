use std::env;

// Ensure that all required settings are in place. Fail if it is not the case.
pub fn check_config() -> () {
    let _project_id = get_project_id();
    let _firebase_endpoint = get_firebase_endpoint();
}

pub fn get_project_id() -> String {
    return env::var("PROJECT_ID").expect("retrieve PROJECT_ID config");
}

pub fn get_firebase_endpoint() -> String {
    return env::var("FIREBASE_ENDPOINT").expect("retrieve FIREBASE_ENDPOINT config");
}

pub fn with_emulator() -> bool {
    match env::var("WITH_EMULATOR") {
        Ok(_) => true,
        Err(_) => false,
    }
}
