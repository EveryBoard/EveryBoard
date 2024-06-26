/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPMap, MGPOptional } from '@everyboard/lib';
import { CoerceoState } from '../CoerceoState';
import { CoerceoConfig, CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { CoerceoPiecesThreatsTilesHeuristic } from '../CoerceoPiecesThreatsTilesHeuristic';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { CoordSet } from 'src/app/jscaip/CoordSet';

describe('CoerceoPiecesThreatTilesHeuristic', () => {

    let heuristic: CoerceoPiecesThreatsTilesHeuristic;
    const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    beforeEach(() => {
        heuristic = new CoerceoPiecesThreatsTilesHeuristic();
    });

    it('should prefer board with more pieces', () => {
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 1));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should prefer board with more safe pieces', () => {
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, X, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should distinguish fake and true threats', () => {
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should prefer board with more tiles (with safe board config)', () => {
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 1), PlayerNumberMap.of(0, 0));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should prefer current player to be falsely threatened than really threatened (direct threat is fake)', () => {
        // Given a weakBoard where current player is really threatened
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, O, _, _, X, _, X, N, N, N, N, N, N],
            [N, N, N, _, _, _, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        // And a strong board where current player is falsely threatened
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, X, N, N, N, N, N, N],
            [N, N, N, X, _, _, _, _, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

    it('should prefer current player to be falsely threatened than really threatened (moving threat is fake)', () => {
        // Given a weakBoard where current player is really threatened
        const weakBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, _, _, _, X, O, _, _, N, N, N],
            [N, N, N, X, _, _, O, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
        ];
        const weakState: CoerceoState =
            new CoerceoState(weakBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        // And a strong board where current player is falsely threatened
        const strongBoard: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, _, _, _, X, O, _, _, N, N, N],
            [N, N, N, _, _, X, O, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoState =
            new CoerceoState(strongBoard, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    describe('getThreat', () => {

        it('should include threat by leaving tile (when mover counted as direct too)', () => {
            // Given a board where a piece has only one freedom that no piece can reach
            // - but that freedom is on another tile, that could
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, X, O, _, _, N, N, N],
                [N, N, N, N, N, N, N, N, N, _, _, _, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When asking getThreat to list the threats
            const threatenedCoord: Coord = new Coord(8, 7);
            const threats: MGPOptional<PieceThreat> = heuristic.getThreat(threatenedCoord, state);

            // Then the piece mentionned upper should be included
            expect(threats.isPresent()).toBeTrue();
        });

    });

    describe('filteredThreatMap', () => {

        it('should see threats coming', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = heuristic.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = heuristic.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(7, 6))).toBeTrue();
        });

        it('should not consider opponent-threatened piece as threats', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = heuristic.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = heuristic.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(6, 6)))
                .withContext('Current player piece should not be considered threatened')
                .toBeFalse();
            expect(filteredThreatMap.containsKey(new Coord(7, 6)))
                .withContext('Opponent pieces should be considered threatened')
                .toBeTrue();
        });

        it('should not consider ensandwiched piece as threats', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, X, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = heuristic.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = heuristic.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(7, 6))).toBeFalse();
        });

        it('should not consider direct threat as moving threat as well', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, _, _, O, X, _, _, N, N, N, N, N, N],
                [N, N, N, _, _, X, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            const pieces: MGPMap<Player, CoordSet> = heuristic.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = heuristic.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = heuristic.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(5, 7))).toBeFalse();
        });

    });

    it('should count one safe piece', () => {
        // Given a state with one piece of player zero
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be the one attributed to one safe piece
        expect(value.get(Player.ZERO).get()).toEqual([0, 0, 0]);
        expect(value.get(Player.ONE).get()).toEqual([1, 0, 0]);
    });

    it('should count one 2 SAFE - 1 THREATENED', () => {
        // Given a state with 3 safe piece of player 1
        // and one threatened piece of player 0
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, O, X, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be correct
        expect(value.get(Player.ZERO).get()).toEqual([0, 1, 0]);
        expect(value.get(Player.ONE).get()).toEqual([3, 0, 0]);
    });

    it(`should not count as threatened pieces which has a moving threat that is also a direct threat`, () => {
        // Given a state with 3 safe piece of player 1
        // and one obviously NON threatened piece of player 0
        // and one non threatened but who might create confusion in the code
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, _, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, O, _, O, X, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be correct
        expect(value.get(Player.ZERO).get()).toEqual([2, 0, 0]);
        expect(value.get(Player.ONE).get()).toEqual([3, 0, 0]);
    });

    it('should count "zero freedom" as safe when tile is not removable', () => {
        // Given a piece of player Zero that has zero freedom
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [_, _, _, N, N, N, N, N, N, N, N, N, N, N, N],
            [_, O, _, _, _, _, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, O, X, O, X, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be correct
        expect(value.get(Player.ZERO).get()).toEqual([3, 0, 0]);
        expect(value.get(Player.ONE).get()).toEqual([4, 0, 0]);
    });

    it('should count "zero freedom" as safe when tile is removable but player cannot leave it', () => {
        // Given a piece of player Zero that has zero freedom
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, _, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, X, O, X, _, N, N, N, N, N, N],
            [N, N, N, _, X, _, X, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be correct
        expect(value.get(Player.ZERO).get()).toEqual([1, 0, 0]);
        expect(value.get(Player.ONE).get()).toEqual([4, 0, 0]);
    });

    it('should count "zero freedom x leavable neighbor-tile" as threat', () => {
        // Given a piece of player Zero that has zero freedom
        // but one of its neighboring tile could be removed during the move
        // and the 4 opponent's piece, one of them able to do the aforementioned move
        const board: Table<FourStatePiece> = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, _, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, X, O, X, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);

        // When evaluating its value
        const value: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

        // Then the value should be correct
        expect(value.get(Player.ZERO).get()).toEqual([0, 1, 0]);
        expect(value.get(Player.ONE).get()).toEqual([4, 0, 0]);
    });

});
