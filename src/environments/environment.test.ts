import { Environment } from './environment-type';

export const environment: Environment = {
    production: true,
    test: false,
    root: '/board-test/',
    useEmulators: true,
    emulatorConfig: {
        projectId: 'my-project',
        databaseURL: 'http://localhost:8080',
    },
};
