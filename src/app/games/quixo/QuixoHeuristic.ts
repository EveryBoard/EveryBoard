import { Player } from 'src/app/jscaip/Player';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NumberMap } from 'src/app/utils/NumberMap';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { MGPMap } from 'src/app/utils/MGPMap';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState, QuixoConfig> {

    public override getMetrics(node: QuixoNode, _config: MGPOptional<QuixoConfig>): PlayerNumberTable {
        const state: QuixoState = node.gameState;
        const linesSums: PlayerMap<MGPMap<string, NumberMap<number>>> = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ZERO));
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums.get(Player.ONE));
        return PlayerNumberTable.ofSingle(zerosFullestLine, onesFullestLine);
    }

}
