import { firebaseConfig } from 'src/app/firebaseConfig';
import { Environment } from './environment-type';

export const environment : Environment = {
    production: true,
    test: false,
    root: '/',
    firebaseConfig: firebaseConfig,
    emulatorConfig: {
        firestore: undefined,
        auth: undefined,
        database: undefined,
        functions: undefined,
    },
};
