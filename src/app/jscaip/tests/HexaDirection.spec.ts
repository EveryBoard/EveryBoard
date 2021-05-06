import { HexaDirection } from '../HexaDirection';

describe('HexaDirection', () => {
    describe('all', () => {
        it('Should have it\'s element in clockwise order', () => {
            const expectedList: HexaDirection[] = [
                HexaDirection.UP,
                HexaDirection.UP_RIGHT,
                HexaDirection.DOWN_RIGHT,
                HexaDirection.DOWN,
                HexaDirection.DOWN_LEFT,
                HexaDirection.UP_LEFT,
            ];
            expect(expectedList).toEqual(HexaDirection.factory.all);
        });
    });
});
