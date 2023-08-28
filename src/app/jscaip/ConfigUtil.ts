export type ConfigDescriptionTypeValue = 'string' | 'number' | 'boolean';
export type ConfigDescriptionType = string | number | boolean;

export type ConfigParameter = {
    name: string,
    type: ConfigDescriptionTypeValue,
};

export type GameConfigDescription = {
    // Wrapping this into field to make it different for GameConfig in Typescript eyes
    fields: ConfigParameter[];
};

export type GameConfig = {
    [member: string]: ConfigDescriptionType;
}
