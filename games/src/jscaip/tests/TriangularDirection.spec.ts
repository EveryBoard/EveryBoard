/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { TriangularDirection } from '../TriangularDirection';

describe('TriangularDirection', () => {

    describe('all', () => {

        it('should have its element in clockwise order', () => {
            const expectedList: TriangularDirection[] = [
                TriangularDirection.LEFT,
                TriangularDirection.UP_LEFT,
                TriangularDirection.UP_RIGHT,
                TriangularDirection.RIGHT,
                TriangularDirection.DOWN_RIGHT,
                TriangularDirection.DOWN_LEFT,
            ];
            expect(expectedList).toEqual(TriangularDirection.factory.all);
        });

    });

    it('should stringify directions', () => {
        expect(TriangularDirection.LEFT.toString()).toEqual('LEFT');
        expect(TriangularDirection.UP_LEFT.toString()).toEqual('UP_LEFT');
        expect(TriangularDirection.UP_RIGHT.toString()).toEqual('UP_RIGHT');
        expect(TriangularDirection.RIGHT.toString()).toEqual('RIGHT');
        expect(TriangularDirection.DOWN_RIGHT.toString()).toEqual('DOWN_RIGHT');
        expect(TriangularDirection.DOWN_LEFT.toString()).toEqual('DOWN_LEFT');
    });

    it('should have a bijective encoder', () => {
        for (const dir of TriangularDirection.factory.all) {
            EncoderTestUtils.expectToBeBijective(TriangularDirection.encoder, dir);
        }
    });

    it('should provide angle', () => {
        expect(TriangularDirection.LEFT.getAngle()).toEqual(270);
        expect(TriangularDirection.UP_LEFT.getAngle()).toEqual(300);
        expect(TriangularDirection.UP_RIGHT.getAngle()).toEqual(60);
        expect(TriangularDirection.RIGHT.getAngle()).toEqual(90);
        expect(TriangularDirection.DOWN_RIGHT.getAngle()).toEqual(120);
        expect(TriangularDirection.DOWN_LEFT.getAngle()).toEqual(240);
    });

});
