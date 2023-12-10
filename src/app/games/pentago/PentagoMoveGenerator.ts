import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PentagoMove } from './PentagoMove';
import { PentagoNode } from './PentagoRules';
import { PentagoState } from './PentagoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class PentagoMoveGenerator extends MoveGenerator<PentagoMove, PentagoState> {

    public static readonly FIRST_TURN_MOVES: PentagoMove[] = [
        PentagoMove.rotationless(0, 0),
        PentagoMove.rotationless(1, 0),
        PentagoMove.rotationless(2, 0),
        PentagoMove.rotationless(0, 1),
        PentagoMove.rotationless(1, 1),
        PentagoMove.rotationless(0, 2),
    ];
    public getListMoves(node: PentagoNode, _config: MGPOptional<EmptyRulesConfig>): PentagoMove[] {
        const moves: PentagoMove[] = [];
        const preDropNeutralBlocks: number[] = node.gameState.neutralBlocks;
        if (node.gameState.turn === 0) {
            return PentagoMoveGenerator.FIRST_TURN_MOVES;
        }
        const legalDrops: Coord[] = this.getLegalDrops(node.gameState);
        for (const legalDrop of legalDrops) {
            const drop: PentagoMove = PentagoMove.rotationless(legalDrop.x, legalDrop.y);
            const stateAfterDrop: PentagoState = node.gameState.applyLegalDrop(drop);
            const legalRotations: [number, boolean][] = this.getLegalRotations(stateAfterDrop,
                                                                               preDropNeutralBlocks);
            for (const legalRotation of legalRotations) {
                moves.push(PentagoMove.withRotation(legalDrop.x,
                                                    legalDrop.y,
                                                    legalRotation[0],
                                                    legalRotation[1]));
            }
            const mustRotate: boolean = stateAfterDrop.neutralBlocks.length === 0;
            if (mustRotate === false) {
                moves.push(drop);
            }
        }
        return moves;
    }
    public getLegalDrops(state: PentagoState): Coord[] {
        const legalDrops: Coord[] = [];
        for (let y: number = 0; y < PentagoState.SIZE; y++) {
            for (let x: number = 0; x < PentagoState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.getPieceAt(coord) === PlayerOrNone.NONE) {
                    legalDrops.push(coord);
                }
            }
        }
        return legalDrops;
    }
    public getLegalRotations(stateAfterDrop: PentagoState, blockNeutralBeforeDrop: number[]): [number, boolean][] {
        const mustRotate: boolean = stateAfterDrop.neutralBlocks.length === 0;
        const legalRotations: [number, boolean][] = [];
        for (let blockIndex: number = 0; blockIndex < 4; blockIndex++) {
            if (stateAfterDrop.blockIsNeutral(blockIndex) === false) {
                if (blockNeutralBeforeDrop.includes(blockIndex)) { // just deneutralized
                    if (mustRotate) {
                        legalRotations.push([blockIndex, true]);
                    }
                } else {
                    legalRotations.push([blockIndex, true], [blockIndex, false]);
                }
            }
        }
        return legalRotations;
    }
}
