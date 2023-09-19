/* eslint-disable no-multi-spaces */
import { rulesConfigDescriptionMap } from '../components/normal-component/pick-game/pick-game.component';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPValidation } from '../utils/MGPValidation';

export type ConfigDescriptionType = string | number | boolean;

export type ConfigParameter = NumberConfigParameter | BooleanConfigParameter;

type BaseConfigParameter = {
    name: string;
    i18nName: Localized;
};

export type NumberConfigParameter = BaseConfigParameter & {
    defaultValue: number;
    isValid: (value: number | null) => MGPValidation;
};

export type BooleanConfigParameter = BaseConfigParameter & {
    defaultValue: boolean;
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

    public static getGameDefaultConfig(gameName: string): RulesConfig {
        const rulesConfigDescription: MGPOptional<RulesConfigDescription> =
                rulesConfigDescriptionMap.get(gameName);
        const rulesConfig: RulesConfig = {};
        for (const configParameter of rulesConfigDescription.getOrElse({ fields: [] }).fields) {
            rulesConfig[configParameter.name] = configParameter.defaultValue;
        }
        return rulesConfig;
    }

}
