open Backend

let arguments_spec = [
  ("-project", Arg.Set_string Options.project_name, "Firebase project name");
  ("-endpoint", Arg.Set_string Options.base_endpoint, "Base endpoint of firebase server");
  ("-service-account", Arg.Set_string Options.service_account_file, "Path to the JSON file of the service account to use");
  ("-address", Arg.Set_string Options.address, "Address on which to listen for connections");
  ("-port", Arg.Set_int Options.port, "Port on which to listen for connections");
  ("-emulator", Arg.Set Options.emulator, "Whether this is linked to a firebase emulator");
]

let () =
  Arg.parse arguments_spec (fun _ -> ()) "backend -project projectname -endpoint firebase-endpoint -service-account service-account-file.json -emulator";
  Server.start ()
