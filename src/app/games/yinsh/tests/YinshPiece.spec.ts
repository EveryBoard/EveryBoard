/* eslint-disable max-lines-per-function */
import { EncoderTestUtils, Utils } from '@everyboard/lib';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { YinshPiece } from '../YinshPiece';

describe('YinshPiece', () => {

    it('should have a bijective encoder', () => {
        for (const piece of [
            YinshPiece.EMPTY,
            YinshPiece.MARKER_ZERO,
            YinshPiece.MARKER_ONE,
            YinshPiece.RING_ZERO,
            YinshPiece.RING_ONE]) {
            EncoderTestUtils.expectToBeBijective(YinshPiece.encoder, piece);
        }
    });

    it('should have redefined toString', () => {
        expect(YinshPiece.UNREACHABLE.toString()).toBe('NONE');
        expect(YinshPiece.EMPTY.toString()).toBe('EMPTY');
        expect(YinshPiece.MARKER_ZERO.toString()).toBe('MARKER_ZERO');
        expect(YinshPiece.MARKER_ONE.toString()).toBe('MARKER_ONE');
        expect(YinshPiece.RING_ZERO.toString()).toBe('RING_ZERO');
        expect(YinshPiece.RING_ONE.toString()).toBe('RING_ONE');
    });

    it('should forbid flipping a non-player piece', () => {
        spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given a non-player piece
        const piece: YinshPiece = YinshPiece.EMPTY;
        // When trying to flip it
        // Then it should fail
        const message: string = 'cannot flip a non-player piece';
        expect(() => piece.flip()).toThrowError('Assertion failure: ' + message);
        expect(Utils.logError).toHaveBeenCalledWith('Assertion failure', message, undefined);
    });

});
