/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { MGPOptional } from '@everyboard/lib';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { EncapsuleSpace, EncapsuleState } from '../EncapsuleState';

describe('EncapsuleState', () => {

    const _: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);

    const emptyBoard: EncapsuleSpace[][] = TableUtils.create(3, 3, _);

    describe('getPieceAt', () => {
        it('should return the expected space', () => {
            const someSpace: EncapsuleSpace = new EncapsuleSpace(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [someSpace, _, _],
                [_, _, _]];
            const state: EncapsuleState = new EncapsuleState(board, 0, []);
            expect(state.getPieceAtXY(0, 1)).toBe(someSpace);
        });
    });
    describe('isDroppable', () => {
        it('should not consider pieces of the opponent as droppable', () => {
            const state: EncapsuleState = new EncapsuleState(emptyBoard, 0, [EncapsulePiece.SMALL_LIGHT]);
            expect(state.isDroppable(EncapsulePiece.SMALL_LIGHT)).toBeFalse();
        });
        it('should not consider pieces not remaining as droppable', () => {
            const state: EncapsuleState = new EncapsuleState(emptyBoard, 0, []);
            expect(state.isDroppable(EncapsulePiece.SMALL_DARK)).toBeFalse();
        });
        it('should only consider a piece that is remaining and of the current player as droppable', () => {
            const state: EncapsuleState = new EncapsuleState(emptyBoard, 0, [EncapsulePiece.SMALL_DARK]);
            expect(state.isDroppable(EncapsulePiece.SMALL_DARK)).toBeTrue();
        });
    });
});

describe('EncapsuleSpace', () => {

    describe('isEmpty', () => {
        it('should consider the empty space empty', () => {
            const empty: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(empty.isEmpty()).toBeTrue();
        });
        it('should consider other spaces non empty', () => {
            const someSpace: EncapsuleSpace = new EncapsuleSpace(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(someSpace.isEmpty()).toBeFalse();
        });
    });
    describe('toList', () => {
        it('should produce a list containing all pieces of the space', () => {
            const someSpace: EncapsuleSpace = new EncapsuleSpace(Player.ONE, Player.ZERO, Player.ZERO);
            const list: EncapsulePiece[] = someSpace.toList();
            expect(list.length).toBe(3);
            expect(list[0]).toBe(EncapsulePiece.SMALL_LIGHT);
            expect(list[1]).toBe(EncapsulePiece.MEDIUM_DARK);
            expect(list[2]).toBe(EncapsulePiece.BIG_DARK);
        });
        it('should not include empty pieces in the list', () => {
            const someSpace: EncapsuleSpace = new EncapsuleSpace(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(someSpace.toList().length).toBe(1);
        });
    });
    describe('getBiggest', () => {
        it('should return the biggest piece of the space', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, Player.ZERO);
            expect(c.getBiggest()).toBe(EncapsulePiece.BIG_DARK);
        });
    });
    describe('tryToSupperposePiece', () => {
        it('should forbid supperposing the empty piece', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            expect(() => c.tryToSuperposePiece(EncapsulePiece.NONE)).toThrow();
        });
        it('should forbid superposing a smaller piece', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            expect(c.tryToSuperposePiece(EncapsulePiece.MEDIUM_DARK).isPresent()).toBeFalse();
        });
        it('should allow superposing a bigger piece', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            const expected: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, Player.ZERO);

            const superposed: MGPOptional<EncapsuleSpace> = c.tryToSuperposePiece(EncapsulePiece.BIG_DARK);

            expect(superposed.isPresent()).toBeTrue();
            expect(superposed.get()).toEqual(expected);
        });
    });
    describe('removeBiggest', () => {
        it('should forbid to remove a piece from the empty space', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(() => c.removeBiggest()).toThrow();
        });
        it('should remove the biggest piece of the space', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, Player.ZERO);

            const result: {removedSpace: EncapsuleSpace, removedPiece: EncapsulePiece} = c.removeBiggest();

            const expectedSpace: EncapsuleSpace = new EncapsuleSpace(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            const expectedPiece: EncapsulePiece = EncapsulePiece.BIG_DARK;
            expect(result.removedSpace).toEqual(expectedSpace);
            expect(result.removedPiece).toBe(expectedPiece);
        });
    });
    describe('put', () => {
        it('should forbid putting an empty piece', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(() => c.put(EncapsulePiece.NONE)).toThrow();
        });
        it('should put on top of smaller pieces', () => {
            const c: EncapsuleSpace = new EncapsuleSpace(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);

            const newSpace: EncapsuleSpace = c.put(EncapsulePiece.MEDIUM_DARK);

            const expectedSpace: EncapsuleSpace = new EncapsuleSpace(Player.ONE, Player.ZERO, PlayerOrNone.NONE);
            expect(newSpace).toEqual(expectedSpace);
        });
    });
});
