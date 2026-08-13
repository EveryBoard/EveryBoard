import { Player } from '@everyboard/games';
import { PlayerMap, PlayerNumberTable } from '@everyboard/games';
import { MGPMap, NumberMap } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';

import { QuixoMove } from './QuixoMove';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { QuixoConfig, QuixoState } from './QuixoState';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState, QuixoConfig> {

    public override getMetrics(node: QuixoNode, _config: QuixoConfig): PlayerNumberTable {
        const state: QuixoState = node.gameState;
        const linesSums: PlayerMap<MGPMap<string, NumberMap<number>>> = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ZERO));
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ONE));
        return PlayerNumberTable.ofSingle(zerosFullestLine, onesFullestLine);
    }

}
