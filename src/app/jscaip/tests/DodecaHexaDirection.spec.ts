/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib';
import { DodecaHexaDirection } from '../DodecaHexaDirection';

describe('DodecaHexaDirection', () => {

    describe('all', () => {

        it('should have its element in clockwise order', () => {
            const expectedList: DodecaHexaDirection[] = [
                DodecaHexaDirection.DIRECTION_000,
                DodecaHexaDirection.DIRECTION_030,
                DodecaHexaDirection.DIRECTION_060,
                DodecaHexaDirection.DIRECTION_090,
                DodecaHexaDirection.DIRECTION_120,
                DodecaHexaDirection.DIRECTION_150,
                DodecaHexaDirection.DIRECTION_180,
                DodecaHexaDirection.DIRECTION_210,
                DodecaHexaDirection.DIRECTION_240,
                DodecaHexaDirection.DIRECTION_270,
                DodecaHexaDirection.DIRECTION_300,
                DodecaHexaDirection.DIRECTION_330,
            ];
            expect(expectedList).toEqual(DodecaHexaDirection.factory.all);
        });

    });

    it('should stringify "orthogonally" the 8 "Ordinal" directions', () => {
        expect(DodecaHexaDirection.DIRECTION_000.toString()).toEqual('UP');
        expect(DodecaHexaDirection.DIRECTION_060.toString()).toEqual('UP_RIGHT');
        expect(DodecaHexaDirection.DIRECTION_120.toString()).toEqual('RIGHT');
        expect(DodecaHexaDirection.DIRECTION_150.toString()).toEqual('DOWN_RIGHT');
        expect(DodecaHexaDirection.DIRECTION_180.toString()).toEqual('DOWN');
        expect(DodecaHexaDirection.DIRECTION_240.toString()).toEqual('DOWN_LEFT');
        expect(DodecaHexaDirection.DIRECTION_300.toString()).toEqual('LEFT');
        expect(DodecaHexaDirection.DIRECTION_330.toString()).toEqual('UP_LEFT');
    });

    it('should stringify "as angles" the 4 knight-like directions', () => {
        expect(DodecaHexaDirection.DIRECTION_030.toString()).toEqual('DIRECTION_030');
        expect(DodecaHexaDirection.DIRECTION_090.toString()).toEqual('DIRECTION_090');
        expect(DodecaHexaDirection.DIRECTION_210.toString()).toEqual('DIRECTION_210');
        expect(DodecaHexaDirection.DIRECTION_270.toString()).toEqual('DIRECTION_270');
    });

    it('should have a bijective encoder', () => {
        for (const dir of DodecaHexaDirection.factory.all) {
            EncoderTestUtils.expectToBeBijective(DodecaHexaDirection.encoder, dir);
        }
    });

    it('should map to angle by multiple of 30', () => {
        for (let i: number = 0; i < 12; i++) {
            const dir: DodecaHexaDirection = DodecaHexaDirection.factory.all[i];
            const angle: number = i * 30;
            const oppositeAngle: number = (angle + 180) % 360;
            expect(dir.getAngle()).toBe(angle);
            expect(dir.getOpposite().getAngle()).toBe(oppositeAngle);
        }
    });

});
