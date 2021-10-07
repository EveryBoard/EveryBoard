import { Player } from 'src/app/jscaip/Player';
import { DvonnPieceStack } from '../DvonnPieceStack';

describe('DvonnPieceStack', () => {

    const stack1: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 1, false);
    const stack2: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);
    const stack4: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 4, true);
    const stack8: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 8, true);

    describe('encoder', () => {
        it('should properly encode and decode stacks of various lengths', () => {
            expect(DvonnPieceStack.encoder.decode(stack1.getValue())).toEqual(stack1);
            expect(DvonnPieceStack.encoder.decode(stack2.getValue())).toEqual(stack2);
            expect(DvonnPieceStack.encoder.decode(stack4.getValue())).toEqual(stack4);
            expect(DvonnPieceStack.encoder.decode(stack8.getValue())).toEqual(stack8);
        });
        it('should encode big piece smaller than maxValue', () => {
            const bigStack: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 49, true);
            expect(bigStack.getValue()).toBeLessThan(DvonnPieceStack.encoder.maxValue());
        });
    });
    describe('append', () => {
        it('should properly concatenate stacks', () => {
            expect(DvonnPieceStack.append(stack4, stack4)).toEqual(stack8);
        });
        it('should preserve owner of the first stack', () => {
            expect(DvonnPieceStack.append(stack1, stack2).getOwner()).toEqual(Player.ZERO);
        });
    });
    describe('belongsTo', () => {
        it('should identify owner of stacks', () => {
            expect(stack1.belongsTo(Player.ZERO)).toBeTrue();
            expect(stack2.belongsTo(Player.ONE)).toBeTrue();
            expect(stack4.belongsTo(Player.ZERO)).toBeTrue();
            expect(stack8.belongsTo(Player.ZERO)).toBeTrue();
            const source: DvonnPieceStack = DvonnPieceStack.SOURCE;
            expect(source.belongsTo(Player.ZERO)).toBeFalse();
            expect(source.belongsTo(Player.ONE)).toBeFalse();
        });
    });
    describe('containsSource', () => {
        it('should identify sources', () => {
            expect(stack1.containsSource()).toBeFalse();
            expect(stack2.containsSource()).toBeFalse();
            expect(stack4.containsSource()).toBeTrue();
            expect(stack8.containsSource()).toBeTrue();
        });
    });
    describe('getOwner', () => {
        it('should return the owner', () => {
            expect(stack1.getOwner()).toBe(Player.ZERO);
            expect(stack2.getOwner()).toBe(Player.ONE);
        });
    });
    describe('belongsTo', () => {
        it('should identify that piece belongs to the right player', () => {
            expect(stack1.belongsTo(Player.ZERO)).toBeTrue();
            expect(stack1.belongsTo(Player.ONE)).toBeFalse();
        });
    });
    describe('isEmpty', () => {
        it('should identify whether the stack is empty', () => {
            expect(DvonnPieceStack.EMPTY.isEmpty()).toBeTrue();
            expect(DvonnPieceStack.PLAYER_ZERO.isEmpty()).toBeFalse();
        });
    });
    describe('getSize', () => {
        it('should return the size of the stack', () => {
            expect(stack1.getSize()).toBe(1);
            expect(stack2.getSize()).toBe(2);
            expect(stack4.getSize()).toBe(4);
            expect(stack8.getSize()).toBe(8);
        });
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(stack1.toString()).toBeTruthy();
        });
    });
});
