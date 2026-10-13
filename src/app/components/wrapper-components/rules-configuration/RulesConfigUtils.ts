import { RulesConfig } from '@everyboard/games';
import { MGPOptional, Utils } from '@everyboard/lib';

import { GameInfo } from '../../normal-component/pick-game/GameInfo';

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
