import { MGPMap, MGPOptional, NumberMap } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Player } from '../../jscaip/Player';
import { PlayerMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { QuixoMove } from './QuixoMove';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { QuixoConfig, QuixoState } from './QuixoState';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState, QuixoConfig> {

    public override getMetrics(node: QuixoNode, _config: MGPOptional<QuixoConfig>): PlayerNumberTable {
        const state: QuixoState = node.gameState;
        const linesSums: PlayerMap<MGPMap<string, NumberMap<number>>> = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ZERO));
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ONE));
        return PlayerNumberTable.ofSingle(zerosFullestLine, onesFullestLine);
    }

}
