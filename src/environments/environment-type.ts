export type FirestoreConfig = {
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
    firebaseConfig: FirestoreConfig,
    useEmulators: boolean,
}
