import { Player } from 'src/app/jscaip/Player';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState, QuixoConfig> {

    public override getMetrics(node: QuixoNode, _config: MGPOptional<QuixoConfig>): PlayerNumberTable {
        const state: QuixoState = node.gameState;
        const linesSums: { [key: string]: { [key: number]: MGPMap<number, number> } } = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        return PlayerNumberTable.of(
            [zerosFullestLine],
            [onesFullestLine],
        );
    }

}
