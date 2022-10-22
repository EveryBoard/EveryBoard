import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { QuixoNode, QuixoRules } from './QuixoRules';

export class QuixoMinimax extends Minimax<QuixoMove, QuixoState> {

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
    public getBoardValue(node: QuixoNode): BoardValue {
        const state: QuixoState = node.gameState;
        const linesSums: { [key: string]: { [key: number]: number[]; }; } = QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        const currentPlayer: Player = state.getCurrentPlayer();
        if (zerosFullestLine === 5) {
            if (currentPlayer === Player.ZERO || onesFullestLine < 5) {
                return new BoardValue(Player.ZERO.getVictoryValue());
            }
        }
        if (onesFullestLine === 5) {
            return new BoardValue(Player.ONE.getVictoryValue());
        }
        return new BoardValue(onesFullestLine - zerosFullestLine);
    }
}
