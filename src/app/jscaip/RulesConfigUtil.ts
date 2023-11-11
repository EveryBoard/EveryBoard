/* eslint-disable no-multi-spaces */
import { GameInfo } from '../components/normal-component/pick-game/pick-game.component';
import { RulesConfigDescription } from '../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Localized } from '../utils/LocaleUtils';

export type ConfigDescriptionType = number | boolean;

export type NamedRulesConfig<R extends RulesConfig = EmptyRulesConfig> = {
    config: R;
    name: Localized;
};

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export interface EmptyRulesConfig extends RulesConfig {
}

export class RulesConfigUtils {

    public static getGameDefaultConfig<C extends RulesConfig>(gameName: string): C {
        const gameInfos: GameInfo[] = GameInfo.getByUrlName(gameName);
        let rulesConfigDescription: RulesConfigDescription = RulesConfigDescription.DEFAULT;
        if (gameInfos.length > 0) {
            rulesConfigDescription = gameInfos[0].getRulesConfigDescription();
        }
        return rulesConfigDescription.getDefaultConfig().config as C;
    }

}
