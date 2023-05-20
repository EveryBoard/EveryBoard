import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { Coord } from 'src/app/jscaip/Coord';

export class PenteAlignmentMinimax extends Minimax<PenteMove, PenteState> {
    public getListMoves(node: PenteNode): PenteMove[] {
        const state: PenteState = node.gameState;
        const moves: PenteMove[] = [];
        for (let y: number = 0; y < PenteState.SIZE; y++) {
            for (let x: number = 0; x < PenteState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.getPieceAt(coord).isPlayer() === false) {
                    moves.push(PenteMove.of(coord));
                }
            }
        }
        return moves;
    }
    public getBoardValue(node: PenteNode): BoardValue {
        return PenteRules.PENTE_HELPER.getBoardValue(node.gameState);
    }
}
