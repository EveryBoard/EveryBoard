import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { TablutCase } from '../TablutCase';
import { TablutMove } from '../TablutMove';
import { TablutPartSlice } from '../TablutPartSlice';
import { TablutPieceAndInfluenceMinimax } from '../TablutPieceAndInfluenceMinimax';
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
    it('Should be better of with non threatened piece (at piece number equal)', () => { console.log('normal')
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
    it('Should be better of with non threatened piece (at piece number equal) (opposite one)', () => { console.log('oppo')
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
            expect(minimax.isThreatened(new Coord(0, 1), state)).toBeTrue();
        });
        it('should see threats coming straight', () => {
            const board: NumberTable = [
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [O, _, _, _, T, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutPartSlice = new TablutPartSlice(board, 0);
            expect(minimax.isThreatened(new Coord(0, 4), state)).toBeTrue();
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
            expect(minimax.isThreatened(new Coord(0, 4), state)).toBeTrue();
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
            expect(minimax.isThreatened(new Coord(0, 4), state)).toBeTrue();
        });
    });
    describe('Victory', () => {
        xit('Should choose king escape, at depth 1 and more', () => {
            const board: NumberTable = [
                [_, T, _, O, O, O, O, O, _],
                [_, _, _, O, _, _, _, _, _],
                [_, O, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutPartSlice = new TablutPartSlice(board, 1);
            const node: MGPNode<TablutRules, TablutMove, TablutPartSlice> = new MGPNode(null, null, state);
            const expectedMove: TablutMove = new TablutMove(new Coord(1, 0), new Coord(0, 0));
            for (let depth: number = 3; depth < 4; depth++) {
                const chosenMove: TablutMove = node.findBestMove(depth, minimax);
                expect(chosenMove).toEqual(expectedMove);
            }
        });
    });
});
