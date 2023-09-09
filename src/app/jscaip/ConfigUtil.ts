export type ConfigDescriptionType = string | number | boolean;

export type ConfigParameter = {
    name: string,
    defaultValue: ConfigDescriptionType;
};

export type TypedConfigParameter = {

    variableName: string;

    localisableName: () => string;

    defaultValue: ConfigDescriptionType;
};

export type RulesConfigDescription = {
    // Wrapping this into field to make it different for RulesConfig in Typescript eyes
    fields: ConfigParameter[];
};

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export class RulesConfigUtils {

    public static getDefaultConfig(rulesConfigDescription: RulesConfigDescription): RulesConfig {
        const rulesConfig: RulesConfig = {};
        for (const configParameter of rulesConfigDescription.fields) {
            rulesConfig[configParameter.name] = configParameter.defaultValue;
        }
        return rulesConfig;
    }
}
