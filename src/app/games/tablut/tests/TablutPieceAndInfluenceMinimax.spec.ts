import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { TablutCase } from '../TablutCase';
import { TablutMove } from '../TablutMove';
import { TablutState } from '../TablutState';
import { TablutPieceAndInfluenceMinimax } from '../TablutPieceAndInfluenceMinimax';
import { SandwichThreat } from '../../../jscaip/PieceThreat';
import { TablutRules } from '../TablutRules';

describe('TablutPieceAndInfluenceMinimax', () => {

    let minimax: TablutPieceAndInfluenceMinimax;
    const _: TablutCase = TablutCase.UNOCCUPIED;
    const O: TablutCase = TablutCase.INVADERS;
    const X: TablutCase = TablutCase.DEFENDERS;
    const T: TablutCase = TablutCase.PLAYER_ONE_KING;

    beforeEach(() => {
        const rules: TablutRules = new TablutRules(TablutState);
        minimax = new TablutPieceAndInfluenceMinimax(rules, 'TablutPieceAndInfluenceMinimax');
    });
    it('Should be better of with more piece', () => {
        const weakBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, T, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, T, O, _, X, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with more influence (at piece number equal)', () => {
        const weakBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, _, T, _, O, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, O, _, _, T, _, _, O, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with non threatened piece (at piece number equal)', () => {
        const weakBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, X, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, X, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with non threatened piece (at piece number equal) (opposite one)', () => {
        const weakBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, O, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, _, O, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with more kill than influence', () => {
        const weakBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, X, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _],
            [_, _, _, _, T, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    describe('isThreatened', () => {
        it('should now that empty thrones are threats', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, T, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 1))).toBeTrue();
        });
        it('should see threats coming straight', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [O, _, _, _, T, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
        });
        it('should see threats coming sideways', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, X, _, _, _, _, _],
                [O, _, _, _, T, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
        });
        it('should not consider king threatened by one piece only', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [O, _, _, T, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(3, 4))).toBeFalse();
        });
        it('should not consider opponent-threatened piece as threats', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _, _],
                [_, _, _, O, X, _, O, _, _],
                [_, _, X, X, T, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 1);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            const expectedMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
            const expectedThreats: SandwichThreat[] = [
                new SandwichThreat(new Coord(4, 3), new MGPSet([new Coord(2, 4)])),
                new SandwichThreat(new Coord(3, 4), new MGPSet([new Coord(4, 2)])),
            ];
            expectedMap.set(new Coord(3, 3), new MGPSet(expectedThreats));
            expect(filteredThreatMap.equals(expectedMap)).toBeTrue();
        });
        it('should not consider ensandwiched piece as threats', () => {
            const board: Table<TablutCase> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, T, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(4, 5))).toBeFalse();
        });
    });
    describe('Victory', () => {
        it('Should choose king escape, at depth 1 and more', () => {
            const board: Table<TablutCase> = [
                [_, T, _, _, _, _, _, O, _],
                [_, O, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 1);
            const node: MGPNode<TablutRules, TablutMove, TablutState> = new MGPNode(null, null, state);
            const expectedMove: TablutMove = new TablutMove(new Coord(1, 0), new Coord(0, 0));
            for (let depth: number = 1; depth < 4; depth++) {
                const chosenMove: TablutMove = node.findBestMove(depth, minimax);
                expect(chosenMove).toEqual(expectedMove);
            }
        });
    });
});
