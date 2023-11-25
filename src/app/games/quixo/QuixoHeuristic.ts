import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { MGPMap } from 'src/app/utils/MGPMap';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState> {

    public getMetrics(node: QuixoNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: QuixoState = node.gameState;
        const linesSums: { [key: string]: { [key: number]: number[]; }; } = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [zerosFullestLine] },
            { key: Player.ONE, value: [onesFullestLine] },
        ]);
    }

}
