import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { Combinatorics } from 'src/app/utils/Combinatorics';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfMinimax } from '../gipf/GipfMinimax';
import { GipfCapture } from '../gipf/GipfMove';
import { YinshGameState } from './YinshGameState';
import { YinshLegalityStatus } from './YinshLegalityStatus';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshNode, YinshRules } from './YinshRules';

export class YinshMinimax extends Minimax<YinshMove, YinshGameState, YinshLegalityStatus> {
    public getBoardValue(node: YinshNode): NodeUnheritance {
        const status: GameStatus = this.ruler.getGameStatus(node);
        if (status.isEndGame) {
            return NodeUnheritance.fromWinner(status.winner);
        } else {
            return new NodeUnheritance(node.gamePartSlice.sideRings[0] * Player.ZERO.getScoreModifier() +
                node.gamePartSlice.sideRings[1] * Player.ONE.getScoreModifier());
        }
    }
    public getListMoves(node: YinshNode): YinshMove[] {
        const moves: YinshMove[] = [];

        if (this.ruler.getGameStatus(node).isEndGame) {
            return moves;
        }

        const state: YinshGameState = node.gamePartSlice;

        if (state.isInitialPlacementPhase()) {
            state.hexaBoard.forEachCoord((coord: Coord, content: YinshPiece): void => {
                if (content === YinshPiece.EMPTY) {
                    moves.push(new YinshMove([], coord, MGPOptional.empty(), []));
                }
            });
        } else {
            const rules: YinshRules = this.ruler as YinshRules; // TODO: ugly cast, this.rules should be a YinshRules!
            this.getPossibleCaptureCombinations(state)
                .forEach((initialCaptures: ReadonlyArray<YinshCapture>): void => {
                    const stateAfterCapture: YinshGameState = rules.applyCaptures(state, initialCaptures);
                    this.getRingMoves(stateAfterCapture).forEach((ringMove: {start: Coord, end: Coord}): void => {
                        const stateAfterRingMove: YinshGameState =
                            rules.applyRingMoveAndFlip(stateAfterCapture, ringMove.start, ringMove.end);
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
    private getPossibleCaptureCombinations(state: YinshGameState): ReadonlyArray<ReadonlyArray<YinshCapture>> {
        const rules: YinshRules = this.ruler as YinshRules;
        const possibleCaptures: YinshCapture[] = rules.getPossibleCaptures(state);
        const ringCoords: Coord[] = this.getRingCoords(state);
        return GipfMinimax.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures)
            .map((captureCombination: GipfCapture[]): YinshCapture[][] => {
                return Combinatorics.getCombinations(ringCoords, captureCombination.length)
                    .map((ringsTaken: Coord[]): YinshCapture[] => {
                        return captureCombination.map((capture: GipfCapture, index: number): YinshCapture => {
                            return new YinshCapture(capture.capturedCases, ringsTaken[index]);
                        });
                    });
            }).reduce((accumulator: YinshCapture[][], captures: YinshCapture[][]): YinshCapture[][] => {
                return accumulator.concat(captures);
            }, []);
    }
    private getRingMoves(state: YinshGameState): {start: Coord, end: Coord}[] {
        const moves: {start: Coord, end: Coord}[] = [];
        this.getRingCoords(state).forEach((coord: Coord): void => {
            for (const dir of HexaDirection.factory.all) {
                let pieceSeen: boolean = false;
                for (let cur: Coord = coord.getNext(dir);
                    state.hexaBoard.isOnBoard(cur);
                    cur = cur.getNext(dir)) {
                    const piece: YinshPiece = state.hexaBoard.getAt(cur);
                    if (piece === YinshPiece.EMPTY) {
                        moves.push({ start: coord, end: cur });
                        if (pieceSeen) {
                            // can only land directly after the piece group
                            break;
                        }
                    } else if (piece.isRing) {
                        // cannot land on rings nor after them
                        break;
                    } else {
                        // track whether we have seen pieces, as we can only jump above one group
                        pieceSeen = true;
                    }
                }
            }
        });
        return moves;
    }
    private getRingCoords(state: YinshGameState): Coord[] {
        const player: number = state.getCurrentPlayer().value;
        const coords: Coord[] = [];
        state.hexaBoard.forEachCoord((coord: Coord, content: YinshPiece): void => {
            if (content === YinshPiece.RINGS[player]) {
                coords.push(coord);
            }
        });
        return coords;
    }
}
