/* eslint-disable no-multi-spaces */
import { GameInfo } from '../components/normal-component/pick-game/pick-game.component';
import { ConfigLine } from '../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Localized } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';

export type ConfigDescriptionType = number | boolean;

export type NamedRulesConfig<R extends RulesConfig = EmptyRulesConfig> = {
    config: R;
    name: Localized;
};

export type DefaultConfigDescription<R extends RulesConfig = EmptyRulesConfig> = {
    name: Localized,
    config: Record<keyof R, ConfigLine>,
}

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export interface EmptyRulesConfig extends RulesConfig {
}

export class RulesConfigUtils {

    public static getGameDefaultConfig<C extends RulesConfig>(gameName: string): MGPOptional<C> {
        const gameInfos: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        if (gameInfos.isPresent()) {
            return gameInfos.get().getRulesConfig() as MGPOptional<C>;
        } else {
            return MGPOptional.empty();
        }
    }

}
