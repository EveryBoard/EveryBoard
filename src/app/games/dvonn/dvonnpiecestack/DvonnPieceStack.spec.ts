import { DvonnPiece } from "../DvonnPiece";
import { DvonnPieceStack } from "./DvonnPieceStack";

describe('DvonnPieceStack', () => {
    fit('should properly encode and decode stacks of various lengths', () => {
        const stack1: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO]);
        expect(DvonnPieceStack.of(stack1.getValue())).toEqual(stack1);
        const stack2: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]);
        expect(DvonnPieceStack.of(stack2.getValue())).toEqual(stack2);
        const stack3: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]);
        expect(DvonnPieceStack.of(stack3.getValue())).toEqual(stack3);
        const stack4: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.SOURCE, DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ONE]);
        expect(DvonnPieceStack.of(stack4.getValue())).toEqual(stack4);
    });
});
