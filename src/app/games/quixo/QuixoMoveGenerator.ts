import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { QuixoNode, QuixoRules } from './QuixoRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MGPOptional } from '@everyboard/lib';

export class QuixoMoveGenerator extends MoveGenerator<QuixoMove, QuixoState, QuixoConfig> {

    public override getListMoves(node: QuixoNode, _config: MGPOptional<QuixoConfig>): QuixoMove[] {
        const state: QuixoState = node.gameState;
        const moves: QuixoMove[] = [];
        const verticalCoords: Coord[] = QuixoRules.getVerticalCoords(node);
        const horizontalCenterCoords: Coord[] = QuixoRules.getHorizontalCenterCoords(node);
        const coords: Coord[] = horizontalCenterCoords.concat(verticalCoords);
        for (const coord of coords) {
            const possibleDirections: Orthogonal[] = QuixoRules.get().getPossibleDirections(state, coord);
            for (const possibleDirection of possibleDirections) {
                const newMove: QuixoMove = new QuixoMove(coord.x, coord.y, possibleDirection);
                moves.push(newMove);
            }
        }
        return moves;
    }
}
