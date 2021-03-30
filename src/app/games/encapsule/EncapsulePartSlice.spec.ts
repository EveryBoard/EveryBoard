import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { EncapsulePiece } from './EncapsuleEnums';
import { EncapsuleCase, EncapsulePartSlice } from './EncapsulePartSlice';

fdescribe('EncapsulePartSlice', () => {
    const emptyCase: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
    const emptyCaseNumber: number = emptyCase.encode();
    const emptyBoard: number[][] = ArrayUtils.createBiArray(3, 3, emptyCaseNumber);
    it('should forbid construction of slice with null remaining pieces', () => {
        expect(() => new EncapsulePartSlice(emptyBoard, 0, null)).toThrow();
    });
});

fdescribe('EncapsuleCase', () => {
    it('should forbid construction with any null member', () => {
        expect(() => new EncapsuleCase(null, Player.NONE, Player.NONE)).toThrow();
        expect(() => new EncapsuleCase(Player.NONE, null, Player.NONE)).toThrow();
        expect(() => new EncapsuleCase(Player.NONE, Player.NONE, null)).toThrow();
    });
    describe('getBiggest', () => {
        it('should return the biggest case', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);
            expect(c.getBiggest()).toBe(EncapsulePiece.BIG_BLACK);
        });
    });
    describe('tryToSupperposePiece', () => {
        it('should forbid supperposing the empty piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.NONE);
            expect(() => c.tryToSuperposePiece(EncapsulePiece.NONE)).toThrow();
        });
        it('should forbid superposing a smaller piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.NONE);
            expect(c.tryToSuperposePiece(EncapsulePiece.MEDIUM_BLACK).isPresent()).toBeFalse();
        });
        it('should allow superposing a bigger piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.NONE);
            const expected: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);

            const superposed: MGPOptional<EncapsuleCase> = c.tryToSuperposePiece(EncapsulePiece.BIG_BLACK);

            expect(superposed.isPresent()).toBeTrue();
            expect(superposed.get().encode()).toBe(expected.encode());
        });
    });
    describe('removeBiggest', () => {
        it('should forbid to remove a piece from the empty case', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
            expect(() => c.removeBiggest()).toThrow();
        });
        it('should remove the biggest case', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.ZERO);

            const result: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} = c.removeBiggest();

            const expectedCase: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ONE, Player.NONE);
            const expectedPiece: EncapsulePiece = EncapsulePiece.BIG_BLACK;
            expect(result.removedCase.encode()).toBe(expectedCase.encode());
            expect(result.removedPiece).toBe(expectedPiece);
        });
    });
    describe('put', () => {
        it('should forbid putting a none piece', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
            expect(() => c.put(EncapsulePiece.NONE)).toThrow();
        });
        it('should put on top of smaller pieces', () => {
            const c: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE);

            const newCase: EncapsuleCase = c.put(EncapsulePiece.MEDIUM_BLACK);

            const expectedCase: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.ZERO, Player.NONE);
            expect(newCase.encode()).toBe(expectedCase.encode());
        });
    });
});
