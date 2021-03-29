import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';

export class SixNode extends MGPNode<SixRules, SixMove, SixGameState, LegalityStatus> {}

export class SixRules extends Rules<SixMove, SixGameState, LegalityStatus> {
    public getListMoves(node: SixNode): MGPMap<SixMove, SixGameState> {
        throw new Error('Method not implemented.');
    }
    public getBoardValue(move: SixMove, slice: SixGameState): number {
        throw new Error('Method not implemented.');
    }
    public applyLegalMove(move: SixMove, slice: SixGameState, status: LegalityStatus): { resultingMove: SixMove; resultingSlice: SixGameState; } {
        throw new Error('Method not implemented.');
    }
    public isLegal(move: SixMove, slice: SixGameState): LegalityStatus {
        if (slice.turn < 40) {
            return this.isLegalDrop(move, slice);
        } else {
            return this.isLegalDeplacement(move, slice);
        }
    }
    public isLegalDrop(move: SixMove, slice: SixGameState): LegalityStatus {
        if (move.landing.isPresent() || move.captured.isPresent()) {
            return { legal: MGPValidation.failure('Can not do deplacement before 42th turn!') };
        }
    }
    public isLegalDeplacement(move: SixMove, slice: SixGameState): LegalityStatus {
        if (move.landing.isAbsent()) {
            return { legal: MGPValidation.failure('Can no longer drop after 40th turn!') };
        }
        if (slice.pieces.containsKey(move.coord)) {
            const playerAtCoord: Player = slice.pieces.get(move.coord) ? Player.ZERO : Player.ONE;
            const currentPlayer: Player = slice.getCurrentPlayer();
            if (playerAtCoord !== currentPlayer) {
                return { legal: MGPValidation.failure('Cannot move ennemy piece!') };
            }
        }
    }
}
