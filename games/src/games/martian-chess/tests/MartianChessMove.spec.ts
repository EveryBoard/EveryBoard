/* eslint-disable max-lines-per-function */
import { MGPFallible } from '@everyboard/lib';
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { Coord } from '../../../jscaip/Coord';
import { DirectionFailure } from '../../../jscaip/Direction';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { MartianChessMove, MartianChessMoveFailure } from '../MartianChessMove';
import { MartianChessMoveGenerator } from '../MartianChessMoveGenerator';
import { MartianChessNode, MartianChessRules } from '../MartianChessRules';
import { MartianChessState } from '../MartianChessState';

describe('MartianChessMove', () => {

    const defaultConfig: EmptyRulesConfig = MartianChessRules.get().getDefaultRulesConfig();

    it('should be illegal to choose a coord out of the board', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(-1, -1), new Coord(0, 0));
        const expectedResult: string = MartianChessMoveFailure.START_COORD_OUT_OF_RANGE();
        expect(move.getReasonOr('')).toBe(expectedResult);
    });

    it('should be illegal to land a move out of the board', () => {
        const move: MGPFallible<MartianChessMove> =
            MartianChessMove.from(
                new Coord(0, 0),
                new Coord(MartianChessState.WIDTH, MartianChessState.HEIGHT));
        const expectedResult: string = MartianChessMoveFailure.END_COORD_OUT_OF_RANGE();
        expect(move.getReasonOr('')).toBe(expectedResult);
    });

    it('should be illegal to make a non linar move', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(1, 2));
        const expectedResult: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
        expect(move.getReasonOr('')).toBe(expectedResult);
    });

    it('should be illegal to make a static move', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(0, 0));
        const expectedResult: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        expect(move.getReasonOr('')).toBe(expectedResult);
    });

    it('should override toString correctly', () => {
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();
        expect(move.toString()).toBe('MartianChessMove((0, 0) -> (1, 1))');
        const moveWithCall: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1), true).get();
        expect(moveWithCall.toString()).toBe('MartianChessMove((0, 0) -> (1, 1), CALL_THE_CLOCK)');
    });

    it('should override equals correctly', () => {
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

    it('should have a bijective encoder', () => {
        const rules: MartianChessRules = MartianChessRules.get();
        const moveGenerator: MartianChessMoveGenerator = new MartianChessMoveGenerator();
        const node: MartianChessNode = rules.getInitialNode(defaultConfig);
        const firstTurnMoves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(MartianChessMove.encoder, move);
        }
    });

});
