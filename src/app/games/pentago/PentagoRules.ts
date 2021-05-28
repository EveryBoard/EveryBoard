import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PentagoFailure } from './PentagoFailure';
import { PentagoLegalityStatus } from './PentagoLegalityStatus';
import { PentagoMove } from './PentagoMove';
import { PentagoGameState } from './PentagoGameState';

export abstract class PentagoNode extends MGPNode<PentagoRules,
                                                  PentagoMove,
                                                  PentagoGameState,
                                                  PentagoLegalityStatus> {}
export class PentagoRules extends Rules<PentagoMove, PentagoGameState, PentagoLegalityStatus> {

    public static readonly singleton: PentagoRules = new PentagoRules(PentagoGameState);

    public static VICTORY_SOURCE: [Coord, Vector, boolean][] = [
        // [ firstCoordToTest, directionToTest, shouldLookTheCaseBeforeAsWellAsCaseAfter]
        [new Coord(1, 0), new Vector(1, 1), false], // 4 short diagonals
        [new Coord(0, 1), new Vector(1, 1), false],
        [new Coord(4, 0), new Vector(-1, 1), false],
        [new Coord(5, 1), new Vector(-1, 1), false],

        [new Coord(1, 1), new Vector(1, 1), true], // 2 long diagonals
        [new Coord(4, 1), new Vector(-1, 1), true],

        [new Coord(0, 1), new Vector(0, 1), true], // 6 verticals
        [new Coord(1, 1), new Vector(0, 1), true],
        [new Coord(2, 1), new Vector(0, 1), true],
        [new Coord(3, 1), new Vector(0, 1), true],
        [new Coord(4, 1), new Vector(0, 1), true],
        [new Coord(5, 1), new Vector(0, 1), true],

        [new Coord(1, 0), new Vector(1, 0), true], // 6 horizontal
        [new Coord(1, 1), new Vector(1, 0), true],
        [new Coord(1, 2), new Vector(1, 0), true],
        [new Coord(1, 3), new Vector(1, 0), true],
        [new Coord(1, 4), new Vector(1, 0), true],
        [new Coord(1, 5), new Vector(1, 0), true],
    ];
    public applyLegalMove(move: PentagoMove, slice: PentagoGameState, status: PentagoLegalityStatus): PentagoGameState {
        return slice.applyLegalMove(move);
    }
    public isLegal(move: PentagoMove, slice: PentagoGameState): PentagoLegalityStatus {
        if (slice.getPieceAt(move.coord) !== Player.NONE) {
            return PentagoLegalityStatus.failure(RulesFailure.MUST_LAND_ON_EMPTY_CASE);
        }
        const postDropState: PentagoGameState = slice.applyLegalDrop(move);
        if (postDropState.neutralBlocks.length === 0) {
            if (move.blockTurned.isAbsent()) {
                return PentagoLegalityStatus.failure(PentagoFailure.MUST_CHOOSE_BLOCK_TO_ROTATE);
            }
        } else {
            if (move.blockTurned.isPresent()) {
                const blockTurned: number = move.blockTurned.get();
                if (postDropState.neutralBlocks.includes(blockTurned)) {
                    return PentagoLegalityStatus.failure(PentagoFailure.CANNOT_ROTATE_NEUTRAL_BLOCK);
                }
            }
        }
        return PentagoLegalityStatus.SUCCESS;
    }
    public getVictoryCoords(state: PentagoGameState): Coord[] {
        let victoryCoords: Coord[] = [];
        for (const maybeVictory of PentagoRules.VICTORY_SOURCE) {
            const firstValue: number = state.getBoardAt(maybeVictory[0]);
            const subVictory: Coord[] = [maybeVictory[0]];
            if (firstValue !== Player.NONE.value) {
                let testedCoord: Coord = maybeVictory[0].getNext(maybeVictory[1]);
                let fourAligned: boolean = true;
                for (let i: number = 0; i < 3 && fourAligned; i++) {
                    if (state.getBoardAt(testedCoord) !== firstValue) {
                        fourAligned = false;
                    } else {
                        subVictory.push(testedCoord);
                        testedCoord = testedCoord.getNext(maybeVictory[1]);
                    }
                }
                if (fourAligned) {
                    // check first alignement
                    if (state.getBoardAt(testedCoord) === firstValue) {
                        subVictory.push(testedCoord);
                        victoryCoords = victoryCoords.concat(subVictory);
                    }
                    if (maybeVictory[2]) {
                        const coordZero: Coord = maybeVictory[0].getPrevious(maybeVictory[1], 1);
                        if (state.getBoardAt(coordZero) === firstValue) {
                            subVictory.push(coordZero);
                            victoryCoords = victoryCoords.concat(subVictory);
                        }
                    }
                }
            }
        }
        return victoryCoords;
    }
    public getGameStatus(node: PentagoNode): GameStatus {
        const state: PentagoGameState = node.gamePartSlice;
        const victoryCoords: Coord[] = this.getVictoryCoords(state);
        const victoryFound: [boolean, boolean] = [false, false];
        for (let i: number = 0; i < victoryCoords.length; i += 5) {
            victoryFound[state.getBoardAt(victoryCoords[i])] = true;
        }
        if (victoryFound[0] === true) {
            if (victoryFound[1] === true) {
                return GameStatus.DRAW;
            } else {
                return GameStatus.ZERO_WON;
            }
        }
        if (victoryFound[1] === true) {
            return GameStatus.ONE_WON;
        }
        if (state.turn === 36) {
            return GameStatus.DRAW;
        } else {
            return GameStatus.ONGOING;
        }
    }
}
