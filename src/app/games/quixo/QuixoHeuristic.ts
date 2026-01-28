import { MGPMap, MGPOptional, NumberMap } from '@everyboard/lib';

import { Player } from '../../jscaip/Player';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { PlayerMap } from '../../jscaip/PlayerMap';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState, QuixoConfig> {

    public override getMetrics(node: QuixoNode, _config: MGPOptional<QuixoConfig>): PlayerNumberTable {
        const state: QuixoState = node.gameState;
        const linesSums: PlayerMap<MGPMap<string, NumberMap<number>>> = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ZERO));
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ONE));
        return PlayerNumberTable.ofSingle(zerosFullestLine, onesFullestLine);
    }

}
