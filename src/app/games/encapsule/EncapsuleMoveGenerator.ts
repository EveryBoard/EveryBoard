import { EncapsuleState, EncapsuleSpace } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Sets } from 'src/app/utils/Sets';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleRules, EncapsuleNode, EncapsuleLegalityInformation } from './EncapsuleRules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class EncapsuleMoveGenerator extends MoveGenerator<EncapsuleMove, EncapsuleState> {

    public getListMoves(n: EncapsuleNode): EncapsuleMove[] {
        const moves: EncapsuleMove[] = [];
        const state: EncapsuleState = n.gameState;
        const board: Table<EncapsuleSpace> = state.getCopiedBoard();
        const currentPlayer: Player = state.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toComparableObjectSet(state.getPlayerRemainingPieces());
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = new Coord(x, y);
                // each drop
                for (const piece of puttablePieces) {
                    const move: EncapsuleMove = EncapsuleMove.ofDrop(piece, coord);
                    const status: MGPFallible<EncapsuleLegalityInformation> = EncapsuleRules.isLegal(move, state);
                    if (status.isSuccess()) {
                        moves.push(move);
                    }
                }
                if (board[y][x].belongsTo(currentPlayer)) {
                    for (let ly: number = 0; ly < 3; ly++) {
                        for (let lx: number = 0; lx < 3; lx++) {
                            const landingCoord: Coord = new Coord(lx, ly);
                            if (landingCoord.equals(coord) === false) {
                                const newMove: EncapsuleMove = EncapsuleMove.ofMove(coord, landingCoord);
                                const status: MGPFallible<EncapsuleLegalityInformation> =
                                    EncapsuleRules.isLegal(newMove, state);
                                if (status.isSuccess()) {
                                    moves.push(newMove);
                                }
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
}
