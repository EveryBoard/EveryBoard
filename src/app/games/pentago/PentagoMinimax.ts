import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { PentagoLegalityStatus } from './PentagoLegalityStatus';
import { PentagoMove } from './PentagoMove';
import { PentagoNode, PentagoRules } from './PentagoRules';
import { PentagoState } from './PentagoState';

export class PentagoMinimax extends Minimax<PentagoMove, PentagoState, PentagoLegalityStatus> {

    public getListMoves(node: PentagoNode): PentagoMove[] {
        const moves: PentagoMove[] = [];
        const preDropNeutralBlocks: number[] = node.gamePartSlice.neutralBlocks;
        const legalDrops: Coord[] = this.getLegalDrops(node.gamePartSlice);
        for (const legalDrop of legalDrops) {
            const drop: PentagoMove = PentagoMove.rotationless(legalDrop.x, legalDrop.y);
            const postDropState: PentagoState = node.gamePartSlice.applyLegalDrop(drop);
            const legalRotations: [number, boolean][] = this.getLegalRotations(postDropState,
                                                                               preDropNeutralBlocks);
            for (const legalRotation of legalRotations) {
                moves.push(PentagoMove.withRotation(legalDrop.x,
                                                    legalDrop.y,
                                                    legalRotation[0],
                                                    legalRotation[1]));
            }
            if (legalRotations.length < 8) {
                moves.push(drop);
            }
        }
        return moves;
    }
    public getBlockOfCoord(coord: Coord): number {
        const blockX: number = coord.x < 3 ? 0 : 1;
        const blockY: number = coord.y < 3 ? 0 : 1;
        return blockY * 2 + blockX;
    }
    public getLegalDrops(state: PentagoState): Coord[] {
        const legalDrops: Coord[] = [];
        for (let y: number = 0; y < 6; y++) {
            for (let x: number = 0; x < 6; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.getBoardAt(coord) === Player.NONE.value) {
                    legalDrops.push(coord);
                }
            }
        }
        return legalDrops;
    }
    public getLegalRotations(postDropState: PentagoState, preDropNeutralBlocks: number[]): [number, boolean][] {
        const legalRotations: [number, boolean][] = [];
        for (let blockIndex: number = 0; blockIndex < 4; blockIndex++) {
            if (postDropState.blockIsNeutral(blockIndex) === false) {
                if (preDropNeutralBlocks.includes(blockIndex)) { // just deneutralised
                    if (postDropState.neutralBlocks.length === 0) { // we have to rotate it
                        legalRotations.push([blockIndex, true]);
                    }
                } else {
                    legalRotations.push([blockIndex, true]);
                    legalRotations.push([blockIndex, false]);
                }
            }
        }
        return legalRotations;
    }
    public getBoardValue(move: PentagoMove, slice: PentagoState): NodeUnheritance {
        return new NodeUnheritance(PentagoRules.singleton.getGameStatus(slice, move).toBoardValue());
    }

}
