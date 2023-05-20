import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { Coord } from 'src/app/jscaip/Coord';

export class PenteAlignmentMinimax extends Minimax<PenteMove, PenteState> {
    public getListMoves(node: PenteNode): PenteMove[] {
        const state: PenteState = node.gameState;
        const moves: PenteMove[] = [];
        state.forEachCoord((coord: Coord, content: PlayerOrNone): void => {
            if (content.isPlayer() === false) {
                moves.push(PenteMove.of(coord));
            }
        });
        return moves;
    }
    public getBoardValue(node: PenteNode): BoardValue {
        return PenteRules.PENTE_HELPER.getBoardValue(node.gameState);
    }
}
