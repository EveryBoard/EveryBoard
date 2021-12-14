import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { CoerceoState } from '../CoerceoState';
import { CoerceoPiecesThreatTilesMinimax } from '../CoerceoPiecesThreatTilesMinimax';
import { CoerceoRules } from '../CoerceoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('CoerceoPiecesThreatTilesMinimax', () => {

    let minimax: CoerceoPiecesThreatTilesMinimax;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    beforeEach(() => {
        const rules: CoerceoRules = new CoerceoRules(CoerceoState);
        minimax = new CoerceoPiecesThreatTilesMinimax(rules, 'Pieces > Threats > Tiles');
    });
    it('Should prefer board with more pieces', () => {
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
        const weakState: CoerceoState = new CoerceoState(weakBoard, 1, [0, 0], [0, 0]);
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
        const strongState: CoerceoState = new CoerceoState(strongBoard, 1, [0, 0], [0, 1]);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should prefer board with more safe pieces', () => {
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
        const weakState: CoerceoState = new CoerceoState(weakBoard, 1, [0, 0], [0, 0]);
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
        const strongState: CoerceoState = new CoerceoState(strongBoard, 1, [0, 0], [0, 0]);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should distinguish fake and true threats', () => {
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
        const weakState: CoerceoState = new CoerceoState(weakBoard, 1, [0, 0], [0, 0]);
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
        const strongState: CoerceoState = new CoerceoState(strongBoard, 1, [0, 0], [0, 0]);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should prefer board with more tiles (with safe board config)', () => {
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
        const weakState: CoerceoState = new CoerceoState(weakBoard, 1, [0, 0], [0, 0]);
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
        const strongState: CoerceoState = new CoerceoState(strongBoard, 1, [0, 1], [0, 0]);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
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
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = minimax.filterThreatMap(threatMap, state);
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
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = minimax.filterThreatMap(threatMap, state);
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
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = minimax.filterThreatMap(threatMap, state);
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
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, _, _, O, X, _, _, N, N, N, N, N, N],
                [N, N, N, _, _, X, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, PieceThreat> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, PieceThreat> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(5, 7))).toBeFalse();
        });
    });
});
