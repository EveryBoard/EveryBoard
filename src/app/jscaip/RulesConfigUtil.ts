/* eslint-disable no-multi-spaces */
import { RulesConfigDescription, rulesConfigDescriptionMap } from '../components/normal-component/pick-game/pick-game.component';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPValidation } from '../utils/MGPValidation';

export type ConfigDescriptionType = number | boolean;

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

export type NamedRulesConfig<R extends RulesConfig = RulesConfig> = {
    config: R;
    name: Localized;
};

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export class RulesConfigUtils {

    public static getDefaultConfig(rulesConfigDescription: RulesConfigDescription): RulesConfig {
        return rulesConfigDescription.getDefaultConfig().config;
    }

    public static getGameDefaultConfig(gameName: string): RulesConfig {
        const rulesConfigDescriptionOpt: MGPOptional<RulesConfigDescription> =
            rulesConfigDescriptionMap.get(gameName);
        const rulesConfigDescription: RulesConfigDescription =
            rulesConfigDescriptionOpt.getOrElse(RulesConfigDescription.DEFAULT);
        return rulesConfigDescription.getDefaultConfig().config;
    }

}
