import { Coord } from 'src/app/jscaip/Coord';
import { Combinatorics } from 'src/app/utils/Combinatorics';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfMoveGenerator } from '../gipf/GipfMinimax';
import { GipfCapture } from '../gipf/GipfMove';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshLegalityInformation, YinshNode, YinshRules } from './YinshRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class YinshMoveGenerator extends MoveGenerator<YinshMove, YinshState> {

    private readonly rules: YinshRules = YinshRules.get();

    public getListMoves(node: YinshNode): YinshMove[] {
        const moves: YinshMove[] = [];
        const state: YinshState = node.gameState;

        if (state.isInitialPlacementPhase()) {
            for (const { coord, content } of state.getCoordsAndContents()) {
                if (content === YinshPiece.EMPTY) {
                    moves.push(new YinshMove([], coord, MGPOptional.empty(), []));
                }
            }
        } else {
            this.getPossibleCaptureCombinations(state)
                .forEach((initialCaptures: ReadonlyArray<YinshCapture>): void => {
                    const stateAfterCapture: YinshState = this.rules.applyCaptures(initialCaptures, state);
                    this.getRingMoves(stateAfterCapture).forEach((ringMove: {start: Coord, end: Coord}): void => {
                        const stateAfterRingMove: YinshState =
                            this.rules.applyRingMoveAndFlip(ringMove.start, ringMove.end, stateAfterCapture);
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
        const possibleCaptures: YinshCapture[] = this.rules.getPossibleCaptures(state);
        const ringCoords: Coord[] = this.getRingCoords(state);
        return GipfMoveGenerator.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures)
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
        const moves: {start: Coord, end: Coord}[] = [];
        for (const start of this.getRingCoords(state)) {
            for (const end of this.rules.getRingTargets(state, start)) {
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

export class YinshHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public getMetrics(node: YinshNode): [number, number] {
        return node.gameState.sideRings;
    }
}

export class YinshMinimax extends Minimax<YinshMove, YinshState, YinshLegalityInformation> {

    public constructor() {
        super('YinshMinimax', YinshRules.get(), new YinshHeuristic(), new YinshMoveGenerator());
    }
}
