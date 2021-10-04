export type FirebaseConfig = {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
}

// emulators in the form of [address, port]
export type EmulatorConfig = {
    firestore: [string, number] | undefined,
    auth: [string, number] | undefined,
    database: [string, number] | undefined,
    functions: [string, number] | undefined,
}

export type Environment = {
    production: boolean,
    test: boolean,
    root: string
    firebaseConfig: FirebaseConfig,
    emulatorConfig: EmulatorConfig,
}
