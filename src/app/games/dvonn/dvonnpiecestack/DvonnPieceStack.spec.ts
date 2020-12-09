import { Player } from "src/app/jscaip/Player";
import { DvonnPiece } from "../DvonnPiece";
import { DvonnPieceStack } from "./DvonnPieceStack";

describe('DvonnPieceStack', () => {
    const stack1: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO]);
    const stack2: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ZERO]);
    const stack4: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]);
    const stack8: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE, DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]);

    it('should properly encode and decode stacks of various lengths', () => {
        expect(DvonnPieceStack.of(stack1.getValue())).toEqual(stack1);
        expect(DvonnPieceStack.of(stack2.getValue())).toEqual(stack2);
        expect(DvonnPieceStack.of(stack4.getValue())).toEqual(stack4);
        expect(DvonnPieceStack.of(stack8.getValue())).toEqual(stack8);
    });
    it('should properly concatenate stacks', () => {
        expect(DvonnPieceStack.append(stack4, stack4)).toEqual(stack8);
    });
    it('should identify owner of stacks', () => {
        expect(stack1.belongsTo(Player.ZERO)).toBeTrue();
        expect(stack2.belongsTo(Player.ONE)).toBeTrue();
        expect(stack4.belongsTo(Player.ZERO)).toBeTrue();
        expect(stack8.belongsTo(Player.ZERO)).toBeTrue();
        const source: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.SOURCE]);
        expect(source.belongsTo(Player.ZERO)).toBeFalse();
        expect(source.belongsTo(Player.ONE)).toBeFalse();
    });
    it('should identify sources', () => {
        expect(stack1.containsSource()).toBeFalse();
        expect(stack2.containsSource()).toBeFalse();
        expect(stack4.containsSource()).toBeTrue();
        expect(stack8.containsSource()).toBeTrue();
    });
 });
