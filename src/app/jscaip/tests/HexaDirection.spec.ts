import { HexaDirection } from '../HexaDirection';
import { NumberEncoderTestUtils } from './Encoder.spec';

describe('HexaDirection', () => {
    describe('all', () => {
        it('Should have it\'s element in clockwise order', () => {
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
        for (let i: number; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            const encoded: number = HexaDirection.encoder.encodeNumber(dir);
            const decoded: HexaDirection = HexaDirection.encoder.decodeNumber(encoded);
            expect(encoded).toBe(i);
            expect(decoded.equals(dir));
        }
        expect(HexaDirection.encoder.maxValue()).toBe(5);
    });
});
