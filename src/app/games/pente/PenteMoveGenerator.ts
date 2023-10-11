import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode } from './PenteRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class PenteMoveGenerator extends MoveGenerator<PenteMove, PenteState> {

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
}