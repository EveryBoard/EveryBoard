import { SiamMove } from './SiamMove';
import { SiamPartSlice } from './SiamPartSlice';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { SiamLegalityStatus } from './SiamLegalityStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { SiamRules, SiamNode } from './SiamRules';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export class SiamMinimax extends Minimax<SiamMove, SiamPartSlice, SiamLegalityStatus> {

    public getBoardValue(node: SiamNode): NodeUnheritance {
        const move: SiamMove = node.move;
        const slice: SiamPartSlice = node.gamePartSlice;
        return new NodeUnheritance(SiamRules.getBoardValueInfo(move, slice).boardValue);
    }
    public getListMoves(node: SiamNode): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let c: number;
        let legality: SiamLegalityStatus;
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                c = node.gamePartSlice.getBoardByXY(x, y);
                if (SiamPiece.belongTo(c, currentPlayer)) {
                    const currentOrientation: Orthogonal = SiamPiece.getDirection(c);
                    for (const direction of Orthogonal.ORTHOGONALS) {
                        // three rotation
                        if (direction !== currentOrientation) {
                            const newBoard: number[][] = node.gamePartSlice.getCopiedBoard();
                            const newMove: SiamMove = new SiamMove(x, y, MGPOptional.empty(), direction);
                            newBoard[y][x] = SiamPiece.of(direction, currentPlayer).value;
                            moves.push(newMove);
                        }

                        const landingCoord: Coord = new Coord(x + direction.x, y + direction.y);
                        let orientations: ReadonlyArray<Orthogonal>;
                        if (landingCoord.isInRange(5, 5)) {
                            orientations = Orthogonal.ORTHOGONALS;
                        } else {
                            orientations = [direction];
                        }
                        for (const orientation of orientations) {
                            const forwardMove: SiamMove = new SiamMove(x, y, MGPOptional.of(direction), orientation);
                            legality = SiamRules.isLegalForwarding(forwardMove, node.gamePartSlice, c);
                            if (legality.legal.isSuccess()) {
                                moves.push(forwardMove);
                            }
                        }
                    }
                }
            }
        }
        if (node.gamePartSlice.countPlayerPawn() < 5) {
            // up to 20 pushing insertion
            moves = moves.concat(SiamRules.getPushingInsertions(node));
            // up to 24 deraping insertion
            moves = moves.concat(SiamRules.getDerapingInsertions(node));
        }
        display(SiamRules.VERBOSE, { getListMovesResult: moves });
        return moves;
    }
}
