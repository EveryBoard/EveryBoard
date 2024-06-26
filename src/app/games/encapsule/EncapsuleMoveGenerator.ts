import { EncapsuleState, EncapsuleSpace } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible, Sets } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleRules, EncapsuleNode, EncapsuleLegalityInformation } from './EncapsuleRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class EncapsuleMoveGenerator extends MoveGenerator<EncapsuleMove, EncapsuleState> {

    public override getListMoves(node: EncapsuleNode, _config: NoConfig): EncapsuleMove[] {
        const moves: EncapsuleMove[] = [];
        const state: EncapsuleState = node.gameState;
        const board: Table<EncapsuleSpace> = state.getCopiedBoard();
        const currentPlayer: Player = state.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toComparableObjectSet(state.getPlayerRemainingPieces());
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = new Coord(x, y);
                // each drop
                for (const piece of puttablePieces) {
                    const move: EncapsuleMove = EncapsuleMove.ofDrop(piece, coord);
                    const status: MGPFallible<EncapsuleLegalityInformation> = EncapsuleRules.get().isLegal(move, state);
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
                                    EncapsuleRules.get().isLegal(newMove, state);
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
