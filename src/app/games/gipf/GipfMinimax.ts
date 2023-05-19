import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { GipfCapture, GipfMove, GipfPlacement } from './GipfMove';
import { GipfState } from './GipfState';
import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { GipfRules, GipfNode, GipfLegalityInformation } from './GipfRules';

export class GipfMinimax extends PlayerMetricsMinimax<GipfMove, GipfState, GipfLegalityInformation> {
    public static getPossibleCaptureCombinationsFromPossibleCaptures(
        possibleCaptures: GipfCapture[],
    ): Table<GipfCapture> {
        const intersections: number[][] = GipfMinimax.computeIntersections(possibleCaptures);
        let captureCombinations: number[][] = [[]];
        possibleCaptures.forEach((_capture: GipfCapture, index: number) => {
            if (intersections[index].length === 0) {
                // Capture is part of no intersection, we can safely add it to all combinations
                captureCombinations.forEach((combination: number[]) => {
                    combination.push(index);
                });
            } else {
                // Capture is part of intersections. Add it everywhere we can
                // But if it is conflicting with some future index, duplicate when we add it
                const newCombinations: number[][] = [];
                const intersectsWithFutureIndex: boolean = intersections[index].some((c: number) => c > index);
                for (const combination of captureCombinations) {

                    const combinationIntersectsWithIndex: boolean = combination.some((c: number) => {
                        return intersections[index].some((c2: number) => c === c2);
                    });
                    if (combinationIntersectsWithIndex === true) {
                        // Don't add it if there is an intersection
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    } else if (intersectsWithFutureIndex) {
                        // duplicate before adding index to a combination where there is no intersection
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                        combination.push(index);
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    } else {
                        // No intersection whatsoever, add the capture
                        combination.push(index);
                        newCombinations.push(ArrayUtils.copyImmutableArray(combination));
                    }
                }
                captureCombinations = newCombinations;
            }
        });
        return captureCombinations.map((combination: number[]) => {
            return combination.map((index: number) => {
                return possibleCaptures[index];
            });
        });
    }
    private static computeIntersections(captures: GipfCapture[]): number[][] {
        const intersections: number[][] = [];
        captures.forEach((capture1: GipfCapture, index1: number) => {
            intersections.push([]);
            captures.forEach((capture2: GipfCapture, index2: number) => {
                if (index1 !== index2) {
                    if (capture1.intersectsWith(capture2)) {
                        intersections[index1].push(index2);
                    }
                }
            });
        });
        return intersections;
    }
    public getMetrics(node: GipfNode): [number, number] {
        const state: GipfState = node.gameState;
        return Player.PLAYERS.map((p: Player) => GipfRules.getPlayerScore(state, p).get()) as [number, number];
    }
    public getListMoves(node: GipfNode): GipfMove[] {
        return this.getListMoveFromState(node.gameState);
    }
    private getListMoveFromState(state: GipfState): GipfMove[] {
        const moves: GipfMove[] = [];

        if (GipfRules.isGameOver(state)) {
            return moves;
        }

        this.getPossibleCaptureCombinations(state).forEach((initialCaptures: ReadonlyArray<GipfCapture>) => {
            const stateAfterCapture: GipfState = GipfRules.applyCaptures(initialCaptures, state);
            GipfRules.getPlacements(stateAfterCapture).forEach((placement: GipfPlacement) => {
                const stateAfterPlacement: GipfState = GipfRules.applyPlacement(placement, stateAfterCapture);
                this.getPossibleCaptureCombinations(stateAfterPlacement)
                    .forEach((finalCaptures: ReadonlyArray<GipfCapture>) => {
                        const moveSimple: GipfMove = new GipfMove(placement, initialCaptures, finalCaptures);
                        moves.push(moveSimple);
                    });
            });
        });
        return moves;
    }
    private getPossibleCaptureCombinations(state: GipfState): Table<GipfCapture> {
        const possibleCaptures: GipfCapture[] = GipfRules.getPossibleCaptures(state);
        return GipfMinimax.getPossibleCaptureCombinationsFromPossibleCaptures(possibleCaptures);
    }
}
