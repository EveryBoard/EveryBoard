import { HexaDirection } from '../HexaDirection';
import { NumberEncoderTestUtils } from './Encoder.spec';

describe('HexaDirection', () => {

    describe('all', () => {
        it('Should have its element in clockwise order', () => {
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
    it('Should stringify nicely', () => {
        expect(HexaDirection.UP.toString()).toEqual('UP');
        expect(HexaDirection.UP_RIGHT.toString()).toEqual('UP_RIGHT');
        expect(HexaDirection.RIGHT.toString()).toEqual('RIGHT');
        expect(HexaDirection.DOWN.toString()).toEqual('DOWN');
        expect(HexaDirection.DOWN_LEFT.toString()).toEqual('DOWN_LEFT');
        expect(HexaDirection.LEFT.toString()).toEqual('LEFT');
    });
    it('Should encode/decode nicely', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            const encoded: number = HexaDirection.encoder.encodeNumber(dir);
            expect(encoded).toBe(i);
            NumberEncoderTestUtils.expectToBeCorrect(HexaDirection.encoder, dir);
        }
    });
    it('Should map to angle correctly', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            expect(HexaDirection.getAngle(dir)).toBe(i * 60);
        }
    });
});
