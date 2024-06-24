import { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    test: false,
    root: '/',
    firebaseConfig: {
        apiKey: 'unknown',
        authDomain: 'unknown',
        projectId: 'my-project',
        storageBucket: 'unknown',
        messagingSenderId: 'unknown',
    },
    useEmulators: true,
    backendURL: 'http://localhost:8081',
};
