/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { TrexoFailure } from '../TrexoFailure';
import { TrexoMove } from '../TrexoMove';
import { TrexoMoveGenerator } from '../TrexoMoveGenerator';
import { TrexoNode, TrexoRules } from '../TrexoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('TrexoMove', () => {

    const defaultConfig: MGPOptional<EmptyRulesConfig> = TrexoRules.get().getDefaultRulesConfig();

    it('should refuse to create out of board move (player.zero piece)', () => {
        const error: string = '(-1, 0) is out of the TrexoBoard!';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given two coords of piece, with the zero coord being out of range
        const zero: Coord = new Coord(-1, 0);
        const one: Coord = new Coord(0, 0);

        // When trying to create a move with it
        // Then it should fail
        expect(() => TrexoMove.from(zero, one)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });

    it('should refuse to create out of board move (player.one piece)', () => {
        const error: string = '(-1, 0) is out of the TrexoBoard!';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given two coords of piece, with the one coord being out of range
        const zero: Coord = new Coord(0, 0);
        const one: Coord = new Coord(-1, 0);

        // When trying to create a move with it
        // Then it should fail
        expect(() => TrexoMove.from(zero, one)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });

    it('should refuse to create move with two coord not neighbors', () => {
        // Given two non neighboring coords
        const zero: Coord = new Coord(0, 0);
        const one: Coord = new Coord(2, 0);

        // When trying to pass them as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe(TrexoFailure.NON_NEIGHBORING_SPACES());
    });

    it('should succeed creating legal move', () => {
        // Given two in-board neighbors coords
        const zero: Coord = new Coord(2, 2);
        const one: Coord = new Coord(2, 3);

        // When passing them as a param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should succeed
        expect(move.isSuccess()).toBeTrue();
    });

    it('should have a bijective encoder', () => {
        const rules: TrexoRules = TrexoRules.get();
        const moveGenerator: TrexoMoveGenerator = new TrexoMoveGenerator();
        const node: TrexoNode = rules.getInitialNode(defaultConfig);
        const firstTurnMoves: TrexoMove[] = moveGenerator.getListMoves(node, defaultConfig);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(TrexoMove.encoder, move);
        }
    });

    describe('equals', () => {

        it('should be true when two move are equal', () => {
            // Given two identical moves
            const first: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then they should be considered equal!
            expect(equals).toBeTrue();
        });

        it('should be false when two first coords are different', () => {
            // Given two moves with a different first coord
            const first: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(2, 0), new Coord(1, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then they should be considered equal!
            expect(equals).toBeFalse();
        });

        it('should be false when two second coords are different', () => {
            // Given two moves with a different second coord
            const first: TrexoMove = TrexoMove.from(new Coord(1, 0), new Coord(2, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(1, 0), new Coord(0, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then they should be considered equal!
            expect(equals).toBeFalse();
        });

    });

});
