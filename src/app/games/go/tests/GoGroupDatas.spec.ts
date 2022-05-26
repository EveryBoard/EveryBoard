/* eslint-disable max-lines-per-function */
import { GoPiece } from '../GoState';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatas } from 'src/app/games/go/GoGroupsDatas';

describe('GoGroupDatas:', () => {

    const coord: Coord = new Coord(0, 0);

    // dead wrapping => that wrapping alive opposite
    // dead wrapping and his opposite => that opposing
    // two alive wrapping => error

    it('should throw when getWrapped is called on a multi wrapped group', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY,
                                                     [coord, coord],
                                                     [coord, coord],
                                                     [coord, coord],
                                                     [],
                                                     []);
        expect(() => group.getWrapper()).toThrowError(`Can't call getWrapper on non-mono-wrapped group`);
    });
    it('should throw when addPawn is called two times with the same coord', () => {
        // Givne any GoGroupDatas containing "coord" already
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY, [], [], [], [], []);
        group.addPawn(coord, GoPiece.BLACK);

        // When adding the coord again
        // Then it should throw
        const expectedError: string = 'Assertion failure: This group already contains (0, 0) (extra data: undefined)';
        let failed: boolean = false;
        try {
            group.addPawn(coord, GoPiece.BLACK);
        } catch (error) {
            expect(error.message).toBe(expectedError);
            failed = true;
        }
        expect(failed).toBeTrue();
    });
    it('should not throw when getWrapped is called on a multi wrapped group where one is the alive opposite of the other', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY,
                                                     [coord, coord],
                                                     [],
                                                     [coord, coord],
                                                     [coord, coord],
                                                     []);
        expect(group.getWrapper()).toEqual(GoPiece.WHITE);
    });
    it('should return the mono wrapper when alive', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY, [coord], [coord, coord], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.BLACK);
    });
    it('should return the alive version of the monowrapper when dead', () => {
        const deadWrapper: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY,
                                                           [coord],
                                                           [coord, coord],
                                                           [],
                                                           [],
                                                           [coord, coord]);
        expect(deadWrapper.getWrapper()).toEqual(GoPiece.BLACK);
    });
    it('should count territory as empty', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.BLACK_TERRITORY, [coord], [coord, coord], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.BLACK);
    });
    describe('getNeighborsEntryPoint', () => {
        it('should give entry points for each neighbor groups', () => {
            // Given a group with all kind of neighbors
            const group: GoGroupDatas = new GoGroupDatas(GoPiece.BLACK_TERRITORY,
                                                         [coord],
                                                         [],
                                                         [coord],
                                                         [coord],
                                                         [coord]);
            // When asking for neighbors entry points
            const neighborsEntryPoint: Coord[] = group.getNeighborsEntryPoint();

            // Then the four entry coord should be there
            expect(neighborsEntryPoint.length).toBe(4);
        });
    });
});
