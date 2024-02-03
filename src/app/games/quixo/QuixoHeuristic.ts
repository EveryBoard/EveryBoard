import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { QuixoNode, QuixoRules } from './QuixoRules';

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState> {

    public getMetrics(node: QuixoNode): [number, number] {
        const state: QuixoState = node.gameState;
        const linesSums: { [key: string]: { [key: number]: number[]; }; } = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        return [zerosFullestLine, onesFullestLine];
    }
}
