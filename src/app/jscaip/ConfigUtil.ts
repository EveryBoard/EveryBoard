export type ConfigDescriptionTypeValue = 'string' | 'number' | 'boolean';

export type ConfigDescriptionType = string | number | boolean;

export type ConfigParameter = {
    name: string,
    type: ConfigDescriptionTypeValue; // TODO: comment faire matcher les deux types ?
    defaultValue: ConfigDescriptionType;
};

export type GameConfigDescription = {
    // Wrapping this into field to make it different for GameConfig in Typescript eyes
    fields: ConfigParameter[];
};

export type GameConfig = {
    [member: string]: ConfigDescriptionType;
}

export function getDefaultConfig(gameConfigDescription: GameConfigDescription): GameConfig {
    const gameConfig: GameConfig = {};
    for (const configParameter of gameConfigDescription.fields) {
        gameConfig[configParameter.name] = configParameter.defaultValue;
    }
    return gameConfig;
}
