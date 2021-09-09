import { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    test: false,
    root: '/',
    useEmulators: true,
    emulatorConfig: {
        projectId: 'my-project',
        databaseURL: 'http://localhost:8080',
    },
};
