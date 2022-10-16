/* eslint-disable max-lines-per-function */
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { HexaDirection } from '../HexaDirection';

describe('HexaDirection', () => {

    describe('all', () => {
        it('should have its element in clockwise order', () => {
            const expectedList: HexaDirection[] = [
                HexaDirection.UP,
                HexaDirection.UP_RIGHT,
                HexaDirection.RIGHT,
                HexaDirection.DOWN,
                HexaDirection.DOWN_LEFT,
                HexaDirection.LEFT,
            ];
            expect(expectedList).toEqual(HexaDirection.factory.all);
        });
    });
    it('should stringify nicely', () => {
        expect(HexaDirection.UP.toString()).toEqual('UP');
        expect(HexaDirection.UP_RIGHT.toString()).toEqual('UP_RIGHT');
        expect(HexaDirection.RIGHT.toString()).toEqual('RIGHT');
        expect(HexaDirection.DOWN.toString()).toEqual('DOWN');
        expect(HexaDirection.DOWN_LEFT.toString()).toEqual('DOWN_LEFT');
        expect(HexaDirection.LEFT.toString()).toEqual('LEFT');
    });
    it('should encode/decode nicely', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            const encoded: number = HexaDirection.encoder.encodeNumber(dir);
            expect(encoded).toBe(i);
            NumberEncoderTestUtils.expectToBeCorrect(HexaDirection.encoder, dir);
        }
    });
    it('should map to angle correctly', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            expect(HexaDirection.getAngle(dir)).toBe(i * 60);
        }
    });
});
