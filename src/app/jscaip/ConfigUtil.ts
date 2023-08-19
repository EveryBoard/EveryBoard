export type GameConfigDescription = {
    fields: { // Wrapped into field to make it different for GameConfig in Typescript eyes
        [member: string]: 'string' | 'number' | 'boolean';
    }
};

export type GameConfig = {
    [member: string]: string | number | boolean;
}
