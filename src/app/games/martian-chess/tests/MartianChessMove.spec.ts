import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MartianChessDummyMinimax } from '../MartianChessDummyMinimax';
import { MartianChessMove, MartianChessMoveFailure } from '../MartianChessMove';
import { MartianChessRules } from '../MartianChessRules';
import { MartianChessState } from '../MartianChessState';

describe('MartianChessMove', () => {
    it('should be illegal to choose a coord out of the board', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(-1, -1), new Coord(0, 0));
        const expectedResult: string = MartianChessMoveFailure.START_COORD_OUT_OF_RANGE;
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should be illegal to land a move out of the board', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(4, 8));
        const expectedResult: string = MartianChessMoveFailure.END_COORD_OUT_OF_RANGE;
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should be illegal to make a non linar move', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(1, 2));
        const expectedResult: string = 'Non linear move are not allowed: 1, 2';
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should be illegal to make a static move', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(0, 0));
        const expectedResult: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should overwrite correctly toString', () => {
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();
        expect(move.toString()).toBe('MartianChessMove((0, 0) -> (1, 1))');
        const moveWithCall: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1), true).get();
        expect(moveWithCall.toString()).toBe('MartianChessMove((0, 0) -> (1, 1), CALL_THE_CLOCK)');
    });
    it('should overwrite correctly equals', () => {
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();
        const moveWithDifferntStart: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(1, 1)).get();
        const moveWithDifferntEnd: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(2, 2)).get();
        const moveWithClockCall: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1), true).get();
        const twin: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();
        expect(move.equals(twin)).toBeTrue();
        expect(move.equals(moveWithDifferntStart)).toBeFalse();
        expect(move.equals(moveWithDifferntEnd)).toBeFalse();
        expect(move.equals(moveWithClockCall)).toBeFalse();
    });
    it('should encode decode correctly', () => {
        const rules: MartianChessRules = new MartianChessRules(MartianChessState);
        const minimax: MartianChessDummyMinimax = new MartianChessDummyMinimax(rules, 'dummy');
        const firstTurnMoves: MartianChessMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeCorrect(MartianChessMove.encoder, move);
        }
    });
});
