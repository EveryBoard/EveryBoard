/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPMap, MGPOptional, Set } from '@everyboard/lib';
import { TaflPawn } from '../TaflPawn';
import { SandwichThreat } from '../../../jscaip/PieceThreat';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { TaflConfig } from '../TaflConfig';
import { TaflState } from '../TaflState';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { TaflMove } from '../TaflMove';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { HnefataflRules } from '../hnefatafl/HnefataflRules';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';

describe('TafPieceAndInfluenceHeuristic', () => {

    let heuristic: TaflPieceAndInfluenceHeuristic<TaflMove>;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    let defaultConfig: MGPOptional<TaflConfig>;

    for (const tafl of [BrandhubRules, HnefataflRules, TablutRules]) {

        heuristic = new TaflPieceAndInfluenceHeuristic(tafl.get());
        defaultConfig = tafl.get().getDefaultRulesConfig();

        it('should be better of with more piece', () => {
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, O, A, O, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 0);
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, O, A, O, _, X, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it('should be better of with more influence (at piece number equal)', () => {
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, O, _, A, _, O, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 0);
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, A, _, _, O, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it('should be better of with non threatened piece (at piece number equal)', () => {
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [O, _, _, X, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 0);
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [O, _, X, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it('should be better of with non threatened piece (at piece number equal) (opposite one)', () => {
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [X, _, O, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 0);
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, O, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it('should be better of with more kill than influence', () => {
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _],
                [_, X, X, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 0);
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [X, _, X, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        describe('isThreatened', () => {

            it('should know that empty thrones are threatening', () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, O, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, A, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 0);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                expect(filteredThreatMap.containsKey(new Coord(0, 1))).toBeTrue();
            });

            it('should see threats coming straight', () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [O, _, _, _, A, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 0);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
            });

            it('should see threats coming sideways', () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, X, _, _, _, _, _],
                    [O, _, _, _, A, _, _, _, _],
                    [X, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 0);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
            });

            it('should not consider king threatened by one piece only', () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, O, _, _, _, _, _],
                    [O, _, _, A, _, _, _, _, _],
                    [O, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 0);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                expect(filteredThreatMap.containsKey(new Coord(3, 4))).toBeFalse();
            });

            it(`should not consider neighbors opponent's threatened pieces as threatening`, () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, X, _, _, _, _],
                    [_, _, _, O, X, _, O, _, _],
                    [_, _, X, X, A, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, O, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 1);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                const expectedThreats: SandwichThreat[] = [
                    new SandwichThreat(new Coord(4, 3), new CoordSet([new Coord(2, 4)])),
                    new SandwichThreat(new Coord(3, 4), new CoordSet([new Coord(4, 2)])),
                ];
                const expectedMap: MGPMap<Coord, Set<SandwichThreat>> = new MGPMap([
                    { key: new Coord(3, 3), value: new Set(expectedThreats) },
                ]);
                expect(filteredThreatMap.equals(expectedMap)).toBeTrue();
            });

            it(`should not consider "moving" opponent's threatened pieces as threatening`, () => {
                // Given a board were the passive player threaten (4, 3) with a "moving" threatened (6, 3)
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, O, _, _, X, _, _],
                    [_, _, _, O, X, _, O, _, _],
                    [_, _, _, X, A, _, _, X, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 1);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);

                // When checking the threat list
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);

                // Then (4, 3) should not be deemed threaten since (6, 3) could be killed
                expect(filteredThreatMap.containsKey(new Coord(4, 3))).toBeFalse();
            });

            it('should not consider ensandwiched pieces as threatened', () => {
                const board: Table<TaflPawn> = [
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, A, _, _, _, _],
                    [_, _, _, _, O, _, _, _, _],
                    [_, _, _, _, X, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _],
                ];
                const state: TaflState = new TaflState(board, 0);
                const node: TablutNode = new TablutNode(state);
                const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
                const threatMap: MGPMap<Coord, Set<SandwichThreat>> = heuristic.getThreatMap(node, pieces);
                const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> =
                    heuristic.filterThreatMap(threatMap, state);
                expect(filteredThreatMap.containsKey(new Coord(4, 5))).toBeFalse();
            });

        });

    }

});
