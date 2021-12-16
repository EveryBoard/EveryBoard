import { SiamMove } from './SiamMove';
import { SiamState } from './SiamState';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { SiamRules, SiamNode, SiamLegalityInformation } from './SiamRules';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamLegalityInformation> {

    public getBoardValue(node: SiamNode): NodeUnheritance {
        return new NodeUnheritance(SiamRules.getBoardValueInfo(node.move, node.gameState).boardValue);
    }
    public getListMoves(node: SiamNode): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let c: SiamPiece;
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                c = node.gameState.getPieceAtXY(x, y);
                if (c.belongTo(currentPlayer)) {
                    const currentOrientation: Orthogonal = c.getDirection();
                    for (const direction of Orthogonal.ORTHOGONALS) {
                        // three rotation
                        if (direction !== currentOrientation) {
                            const newBoard: SiamPiece[][] = node.gameState.getCopiedBoard();
                            const newMove: SiamMove = new SiamMove(x, y, MGPOptional.empty(), direction);
                            newBoard[y][x] = SiamPiece.of(direction, currentPlayer);
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
                            const legality: MGPFallible<SiamLegalityInformation> =
                                SiamRules.isLegalForwarding(forwardMove, node.gameState, c);
                            if (legality.isSuccess()) {
                                moves.push(forwardMove);
                            }
                        }
                    }
                }
            }
        }
        if (node.gameState.countPlayerPawn() < 5) {
            // up to 20 pushing insertion
            moves = moves.concat(SiamRules.getPushingInsertions(node));
            // up to 24 deraping insertion
            moves = moves.concat(SiamRules.getDerapingInsertions(node));
        }
        display(SiamRules.VERBOSE, { getListMovesResult: moves });
        return moves;
    }
}
