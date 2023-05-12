import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { GameStatus } from 'src/app/jscaip/Rules';
import { Combinatorics } from 'src/app/utils/Combinatorics';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfMinimax } from '../gipf/GipfMinimax';
import { GipfCapture } from '../gipf/GipfMove';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshLegalityInformation, YinshNode, YinshRules } from './YinshRules';

export class YinshMinimax
    extends Minimax<YinshMove, YinshState, YinshLegalityInformation, BoardValue, YinshRules> {

    public getBoardValue(node: YinshNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return BoardValue.fromWinner(gameStatus.winner);
        } else {
            return BoardValue.from(node.gameState.sideRings[0], node.gameState.sideRings[1]);
        }
    }
    public getListMoves(node: YinshNode): YinshMove[] {
        const moves: YinshMove[] = [];
        const state: YinshState = node.gameState;

        if (state.isInitialPlacementPhase()) {
            for (const [coord, content] of state.getCoordsAndContents()) {
                if (content === YinshPiece.EMPTY) {
                    moves.push(new YinshMove([], coord, MGPOptional.empty(), []));
                }
            }
        } else {
            const rules: YinshRules = this.ruler;
            this.getPossibleCaptureCombinations(state)
                .forEach((initialCaptures: ReadonlyArray<YinshCapture>): void => {
                    const stateAfterCapture: YinshState = rules.applyCaptures(initialCaptures, state);
                    this.getRingMoves(stateAfterCapture).forEach((ringMove: {start: Coord, end: Coord}): void => {
                        const stateAfterRingMove: YinshState =
                            rules.applyRingMoveAndFlip(ringMove.start, ringMove.end, stateAfterCapture);
                        this.getPossibleCaptureCombinations(stateAfterRingMove)
                            .forEach((finalCaptures: ReadonlyArray<YinshCapture>): void => {
                                const move: YinshMove = new YinshMove(initialCaptures,
                                                                      ringMove.start,
                                                                      MGPOptional.of(ringMove.end),
                                                                      finalCaptures);
                                moves.push(move);
                            });
                    });
                });
        }
        return moves;
    }
    private getPossibleCaptureCombinations(state: YinshState): ReadonlyArray<ReadonlyArray<YinshCapture>> {
        const rules: YinshRules = this.ruler;
        const possibleCaptures: YinshCapture[] = rules.getPossibleCaptures(state);
        const ringCoords: Coord[] = this.getRingCoords(state);
        return GipfMinimax.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures)
            .map((captureCombination: GipfCapture[]): YinshCapture[][] => {
                return Combinatorics.getCombinations(ringCoords, captureCombination.length)
                    .map((ringsTaken: Coord[]): YinshCapture[] => {
                        return captureCombination.map((capture: GipfCapture, index: number): YinshCapture => {
                            return new YinshCapture(capture.capturedSpaces, ringsTaken[index]);
                        });
                    });
            }).reduce((accumulator: YinshCapture[][], captures: YinshCapture[][]): YinshCapture[][] => {
                return accumulator.concat(captures);
            }, []);
    }
    private getRingMoves(state: YinshState): {start: Coord, end: Coord}[] {
        const rules: YinshRules = this.ruler;
        const moves: {start: Coord, end: Coord}[] = [];
        for (const start of this.getRingCoords(state)) {
            for (const end of rules.getRingTargets(state, start)) {
                moves.push({ start, end });
            }
        }
        return moves;
    }
    private getRingCoords(state: YinshState): Coord[] {
        const player: number = state.getCurrentPlayer().value;
        const coords: Coord[] = [];
        state.forEachCoord((coord: Coord, content: YinshPiece): void => {
            if (content === YinshPiece.RINGS[player]) {
                coords.push(coord);
            }
        });
        return coords;
    }
}
