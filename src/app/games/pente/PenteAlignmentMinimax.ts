import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

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

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState> {

    public getBoardValue(node: PenteNode): BoardValue {
        return PenteRules.PENTE_HELPER.getBoardValue(node.gameState);
    }
}

export class PenteAlignmentMinimax extends Minimax<PenteMove, PenteState> {

    public constructor() {
        super('Alignment Minimax', PenteRules.get(), new PenteAlignmentHeuristic(), new PenteMoveGenerator());
    }
}
