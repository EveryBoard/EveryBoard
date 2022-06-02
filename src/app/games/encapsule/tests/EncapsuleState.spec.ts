/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { EncapsuleCase, EncapsuleState } from '../EncapsuleState';

describe('EncapsuleState', () => {

    const _: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);

    const emptyBoard: EncapsuleCase[][] = ArrayUtils.createTable(3, 3, _);

    describe('getPieceAt', () => {
        it('should return the expected space', () => {
            const someCase: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            const board: EncapsuleCase[][] = [
                [_, _, _],
                [someCase, _, _],
                [_, _, _]];
            const state: EncapsuleState = new EncapsuleState(board, 0, []);
            expect(state.getPieceAt(new Coord(0, 1))).toBe(someCase);
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

describe('EncapsuleCase', () => {

    describe('isEmpty', () => {
        it('should consider the empty space empty', () => {
            const empty: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(empty.isEmpty()).toBeTrue();
        });
        it('should consider other cases non empty', () => {
            const someCase: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(someCase.isEmpty()).toBeFalse();
        });
    });
    describe('toList', () => {
        it('should produce a list containing all pieces of the space', () => {
            const someCase: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.ZERO, Player.ZERO);
            const list: EncapsulePiece[] = someCase.toList();
            expect(list.length).toBe(3);
            expect(list[0]).toBe(EncapsulePiece.SMALL_LIGHT);
            expect(list[1]).toBe(EncapsulePiece.MEDIUM_DARK);
            expect(list[2]).toBe(EncapsulePiece.BIG_DARK);
        });
        it('should not include empty pieces in the list', () => {
            const someCase: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(someCase.toList().length).toBe(1);
        });
    });
    describe('getBiggest', () => {
        it('should return the biggest piece of the space', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);
            expect(c.getBiggest()).toBe(EncapsulePiece.BIG_DARK);
        });
    });
    describe('tryToSupperposePiece', () => {
        it('should forbid supperposing the empty piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            expect(() => c.tryToSuperposePiece(EncapsulePiece.NONE)).toThrow();
        });
        it('should forbid superposing a smaller piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            expect(c.tryToSuperposePiece(EncapsulePiece.MEDIUM_DARK).isPresent()).toBeFalse();
        });
        it('should allow superposing a bigger piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            const expected: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);

            const superposed: MGPOptional<EncapsuleCase> = c.tryToSuperposePiece(EncapsulePiece.BIG_DARK);

            expect(superposed.isPresent()).toBeTrue();
            expect(superposed.get().encode()).toBe(expected.encode());
        });
    });
    describe('removeBiggest', () => {
        it('should forbid to remove a piece from the empty space', () => {
            const c: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(() => c.removeBiggest()).toThrow();
        });
        it('should remove the biggest piece of the space', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);

            const result: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} = c.removeBiggest();

            const expectedCase: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, PlayerOrNone.NONE);
            const expectedPiece: EncapsulePiece = EncapsulePiece.BIG_DARK;
            expect(result.removedCase.encode()).toBe(expectedCase.encode());
            expect(result.removedPiece).toBe(expectedPiece);
        });
    });
    describe('put', () => {
        it('should forbid putting a none piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            expect(() => c.put(EncapsulePiece.NONE)).toThrow();
        });
        it('should put on top of smaller pieces', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);

            const newCase: EncapsuleCase = c.put(EncapsulePiece.MEDIUM_DARK);

            const expectedCase: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.ZERO, PlayerOrNone.NONE);
            expect(newCase.encode()).toBe(expectedCase.encode());
        });
    });
});
