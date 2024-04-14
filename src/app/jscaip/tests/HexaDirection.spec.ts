/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
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

    it('should have a bijective encoder', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            EncoderTestUtils.expectToBeBijective(HexaDirection.encoder, dir);
        }
    });

    it('should map to angle by multiple of 60', () => {
        for (let i: number = 0; i < 6; i++) {
            const dir: HexaDirection = HexaDirection.factory.all[i];
            expect(dir.getAngle()).toBe(i * 60);
        }
    });

});
