/* eslint-disable no-multi-spaces */
import { GameInfo } from '../components/normal-component/pick-game/pick-game.component';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';

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

    public static getGameDefaultConfig<C extends RulesConfig>(gameName: string): MGPOptional<C> {
        const gameInfos: GameInfo[] = GameInfo.getByUrlName(gameName);
        if (gameInfos.length > 0) {
            return gameInfos[0].getOptionalRulesConfig() as MGPOptional<C>;
        } else {
            return MGPOptional.empty();
        }
    }

}
