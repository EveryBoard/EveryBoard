/* eslint-disable no-multi-spaces */
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { GameInfo } from '../components/normal-component/pick-game/GameInfo';
import { ConfigLine } from '../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Localized } from '../utils/LocaleUtils';

export type ConfigDescriptionType = number | boolean | string;

export type NamedRulesConfig<R extends RulesConfig = EmptyRulesConfig> = {
    config: R;
    name: Localized;
};

export type DefaultConfigDescription<R extends RulesConfig = EmptyRulesConfig> = {
    name: Localized;
    config: Record<keyof R, ConfigLine>;
    validators?: ((config: R) => MGPValidation)[];
}

export type RulesConfig = {
    [member: string]: ConfigDescriptionType;
}

export type EmptyRulesConfig = Record<string, never>;

export class RulesConfigUtils {

    /**
     * Returns the default config for that game. The game should exist.
     * Every game has a default config (empty in case there's nothing to configure).
     */
    public static getGameDefaultConfig<C extends RulesConfig>(gameName: string): C {
        const gameInfo: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        Utils.assert(gameInfo.isPresent(), `Game does not exist but it should: ${gameName}`);
        return gameInfo.get().getRulesConfig() as C;
    }

}
