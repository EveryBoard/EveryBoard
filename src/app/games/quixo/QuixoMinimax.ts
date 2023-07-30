import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class QuixoMoveGenerator extends MoveGenerator<QuixoMove, QuixoState> {

    public getListMoves(node: QuixoNode): QuixoMove[] {
        const moves: QuixoMove[] = [];
        const verticalCoords: Coord[] = QuixoRules.getVerticalCoords(node);
        const horizontalCenterCoords: Coord[] = QuixoRules.getHorizontalCenterCoords(node);
        const coords: Coord[] = horizontalCenterCoords.concat(verticalCoords);
        for (const coord of coords) {
            const possibleDirections: Orthogonal[] = QuixoRules.getPossibleDirections(coord);
            for (const possibleDirection of possibleDirections) {
                const newMove: QuixoMove = new QuixoMove(coord.x, coord.y, possibleDirection);
                moves.push(newMove);
            }
        }
        return moves;
    }
}

export class QuixoHeuristic extends PlayerMetricHeuristic<QuixoMove, QuixoState> {

    public getMetrics(node: QuixoNode): [number, number] {
        const state: QuixoState = node.gameState;
        const linesSums: { [key: string]: { [key: number]: number[]; }; } = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        return [zerosFullestLine, onesFullestLine];
    }
}

export class QuixoMinimax extends Minimax<QuixoMove, QuixoState> {

    public constructor() {
        super('QuixoMinimax', QuixoRules.get(), new QuixoHeuristic(), new QuixoMoveGenerator());
    }

}
