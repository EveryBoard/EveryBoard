import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { TablutCase } from '../TablutCase';
import { TablutMove } from '../TablutMove';
import { TablutPartSlice } from '../TablutPartSlice';
import { TablutPieceAndInfluenceMinimax } from '../TablutPieceAndInfluenceMinimax';
import { SandwichThreat } from '../../../jscaip/PieceThreat';
import { TablutRules } from '../TablutRules';

describe('TablutPieceAndInfluenceMinimax', () => {

    let minimax: TablutPieceAndInfluenceMinimax;
    const _: number = TablutCase.UNOCCUPIED.value;
    const O: number = TablutCase.INVADERS.value;
    const X: number = TablutCase.DEFENDERS.value;
    const T: number = TablutCase.PLAYER_ONE_KING.value;

    beforeEach(() => {
        const rules: TablutRules = new TablutRules(TablutPartSlice);
        minimax = new TablutPieceAndInfluenceMinimax(rules, 'TablutPieceAndInfluenceMinimax');
    });
    it('Should be better of with more piece', () => {
        const weakBoard: NumberTable = [
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
        const weakState: TablutPartSlice = new TablutPartSlice(weakBoard, 0);
        const strongBoard: NumberTable = [
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
        const strongState: TablutPartSlice = new TablutPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with more influence (at piece number equal)', () => {
        const weakBoard: NumberTable = [
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
        const weakState: TablutPartSlice = new TablutPartSlice(weakBoard, 0);
        const strongBoard: NumberTable = [
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
        const strongState: TablutPartSlice = new TablutPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with non threatened piece (at piece number equal)', () => {
        const weakBoard: NumberTable = [
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
        const weakState: TablutPartSlice = new TablutPartSlice(weakBoard, 0);
        const strongBoard: NumberTable = [
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
        const strongState: TablutPartSlice = new TablutPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with non threatened piece (at piece number equal) (opposite one)', () => {
        const weakBoard: NumberTable = [
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
        const weakState: TablutPartSlice = new TablutPartSlice(weakBoard, 0);
        const strongBoard: NumberTable = [
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
        const strongState: TablutPartSlice = new TablutPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    it('Should be better of with more kill than influence', () => {
        const weakBoard: NumberTable = [
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
        const weakState: TablutPartSlice = new TablutPartSlice(weakBoard, 0);
        const strongBoard: NumberTable = [
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
        const strongState: TablutPartSlice = new TablutPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
    describe('isThreatened', () => {
        it('should now that empty thrones are threats', () => {
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(minimax.isThreatened(new Coord(0, 1), state, filteredThreatMap)).toBeTrue();
        });
        it('should see threats coming straight', () => {
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(minimax.isThreatened(new Coord(0, 4), state, filteredThreatMap)).toBeTrue();
        });
        it('should see threats coming sideways', () => {
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(minimax.isThreatened(new Coord(0, 4), state, filteredThreatMap)).toBeTrue();
        });
        it('should not consider king threatened by one piece only', () => {
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(minimax.isThreatened(new Coord(3, 4), state, filteredThreatMap)).toBeFalse();
        });
        it('should not consider opponent-threatened piece as threats', () => {
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 1);
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
            const board: NumberTable = [
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
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(minimax.isThreatened(new Coord(4, 5), state, filteredThreatMap)).toBeFalse();
        });
    });
    describe('Victory', () => {
        xit('Should choose king escape, at depth 1 and more', () => {
            const board: NumberTable = [
                [_, T, _, _, _, _, _, O, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutPartSlice = new TablutPartSlice(board, 1);
            const node: MGPNode<TablutRules, TablutMove, TablutPartSlice> = new MGPNode(null, null, state);
            const expectedMove: TablutMove = new TablutMove(new Coord(1, 0), new Coord(0, 0));
            for (let depth: number = 1; depth < 4; depth++) {
                const chosenMove: TablutMove = node.findBestMove(depth, minimax);
                expect(chosenMove).toEqual(expectedMove);
            }
        });
    });
});
