import { Coord } from 'src/app/jscaip/Coord';
import { Combinatorics } from 'src/app/utils/Combinatorics';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshNode, YinshRules } from './YinshRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { GipfCapture, GipfProjectHelper } from 'src/app/jscaip/GipfProjectHelper';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Player } from 'src/app/jscaip/Player';

export class YinshMoveGenerator extends MoveGenerator<YinshMove, YinshState> {

    public override getListMoves(node: YinshNode, _config: NoConfig): YinshMove[] {
        const moves: YinshMove[] = [];
        const state: YinshState = node.gameState;

        if (state.isInitialPlacementPhase()) {
            for (const { coord, content } of state.getCoordsAndContents()) {
                if (content === YinshPiece.EMPTY) {
                    moves.push(new YinshMove([], coord, MGPOptional.empty(), []));
                }
            }
        } else {
            const rules: YinshRules = YinshRules.get();
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
        const rules: YinshRules = YinshRules.get();
        const possibleCaptures: YinshCapture[] = rules.getPossibleCaptures(state);
        const ringCoords: Coord[] = this.getRingCoords(state);
        return GipfProjectHelper.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures)
            .map((captureCombination: GipfCapture[]): YinshCapture[][] => {
                return Combinatorics.getCombinations(ringCoords, captureCombination.length)
                    .map((ringsTaken: Coord[]): YinshCapture[] => {
                        return captureCombination.map((capture: GipfCapture, index: number): YinshCapture => {
                            return new YinshCapture(capture.capturedSpaces, MGPOptional.of(ringsTaken[index]));
                        });
                    });
            }).reduce((accumulator: YinshCapture[][], captures: YinshCapture[][]): YinshCapture[][] => {
                return accumulator.concat(captures);
            }, []);
    }
    private getRingMoves(state: YinshState): {start: Coord, end: Coord}[] {
        const rules: YinshRules = YinshRules.get();
        const moves: {start: Coord, end: Coord}[] = [];
        for (const start of this.getRingCoords(state)) {
            for (const end of rules.getRingTargets(state, start)) {
                moves.push({ start, end });
            }
        }
        return moves;
    }
    private getRingCoords(state: YinshState): Coord[] {
        const player: Player = state.getCurrentPlayer();
        const coords: Coord[] = [];
        state.forEachCoord((coord: Coord, content: YinshPiece): void => {
            if (content === YinshPiece.RINGS.get(player).get()) {
                coords.push(coord);
            }
        });
        return coords;
    }
}
