let service_account_file : string ref = ref "service-account.json"
let address : string ref = ref "0.0.0.0"
let port : int ref = ref 8081
let emulator : bool ref = ref true
let frontend_origin : string ref = ref "http://localhost:4200"
let show_errors : bool ref = ref false

let database_name : string ref = ref "(default)"
let project_name : string ref = ref "my-project"
let project_id : string ref = project_name
let base_endpoint : string ref = ref "http://127.0.0.1:8080"
