import { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    test: false,
    root: '/',
    firebaseConfig: {
        apiKey: 'unknown',
        authDomain: 'unknown',
        databaseURL: 'http://localhost:8080',
        projectId: 'my-project',
        storageBucket: 'unknown',
        messagingSenderId: 'unknown',
    },
    emulatorConfig: {
        firestore: ['localhost', 8080],
        auth: ['localhost', 9099],
        database: ['localhost', 9000],
        functions: ['localhost', 5001],
    },
};
