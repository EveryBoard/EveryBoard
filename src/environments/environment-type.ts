export type FirebaseConfig = {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
}

export type Environment = {
    production: boolean,
    test: boolean,
    root: string
    firebaseConfig: FirebaseConfig,
    useEmulators: boolean,
}
