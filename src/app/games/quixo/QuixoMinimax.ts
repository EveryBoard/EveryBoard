import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoPartSlice } from './QuixoPartSlice';
import { QuixoMove } from './QuixoMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { QuixoNode, QuixoRules } from './QuixoRules';


export class QuixoMinimax extends Minimax<QuixoMove, QuixoPartSlice> {

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
    public getBoardValue(node: QuixoNode): NodeUnheritance {
        const slice: QuixoPartSlice = node.gamePartSlice;
        const linesSums: { [key: string]: { [key: number]: number[]; }; } = QuixoRules.getLinesSums(slice);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        const currentPlayer: Player = slice.getCurrentPlayer();
        if (zerosFullestLine === 5) {
            if (currentPlayer === Player.ZERO || onesFullestLine < 5) {
                return new NodeUnheritance(Player.ZERO.getVictoryValue());
            }
        }
        if (onesFullestLine === 5) {
            return new NodeUnheritance(Player.ONE.getVictoryValue());
        }
        return new NodeUnheritance(onesFullestLine - zerosFullestLine);
    }
}
