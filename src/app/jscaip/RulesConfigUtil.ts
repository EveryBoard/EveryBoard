/* eslint-disable no-multi-spaces */
import { GameInfo, RulesConfigDescription } from '../components/normal-component/pick-game/pick-game.component';
import { Localized } from '../utils/LocaleUtils';
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
        const gameInfos: GameInfo[] = GameInfo.getByUrlName(gameName);
        if (gameInfos.length === 0) {
            return RulesConfigDescription.DEFAULT.getDefaultConfig().config;
        } else {
            const rulesConfigDescription: RulesConfigDescription = gameInfos[0].rulesConfigDescription;
            return rulesConfigDescription.getDefaultConfig().config;
        }
    }

}
