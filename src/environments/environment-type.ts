export type FirebaseConfig = {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
}

export type EmulatorConfig = {
    firestore: [string, number] | undefined, // [address, port]
}

export type Environment = {
    production: boolean,
    test: boolean,
    root: string
    firebaseConfig: FirebaseConfig,
    emulatorConfig: EmulatorConfig,
}
