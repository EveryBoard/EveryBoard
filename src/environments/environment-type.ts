export type Environment = {
    production: boolean,
    test: boolean,
    root: string
    useEmulators: boolean,
    emulatorConfig: null | { projectId : string, databaseURL: string },
}
