/* eslint-disable max-lines-per-function */
import { GoPiece } from '../GoState';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatas } from 'src/app/games/go/GoGroupsDatas';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { fakeAsync } from '@angular/core/testing';

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
    it('should throw when addPawn is called two times with the same coord', fakeAsync(() => {
        // Given any GoGroupDatas containing "coord" already
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY, [], [], [], [], []);
        group.addPawn(coord, GoPiece.DARK);

        // When adding the coord again
        // Then it should throw
        const expectedError: string = 'This group already contains (0, 0)';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        expect(() => group.addPawn(coord, GoPiece.DARK)).toThrowError('Assertion failure: ' + expectedError);
    }));
    it('should not throw when getWrapped is called on a multi wrapped group where one is the alive opposite of the other', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY,
                                                     [coord, coord],
                                                     [],
                                                     [coord, coord],
                                                     [coord, coord],
                                                     []);
        expect(group.getWrapper()).toEqual(GoPiece.LIGHT);
    });
    it('should return the mono wrapper when alive', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY, [coord], [coord, coord], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.DARK);
    });
    it('should return the alive version of the monowrapper when dead', () => {
        const deadWrapper: GoGroupDatas = new GoGroupDatas(GoPiece.EMPTY,
                                                           [coord],
                                                           [coord, coord],
                                                           [],
                                                           [],
                                                           [coord, coord]);
        expect(deadWrapper.getWrapper()).toEqual(GoPiece.DARK);
    });
    it('should count territory as empty', () => {
        const group: GoGroupDatas = new GoGroupDatas(GoPiece.DARK_TERRITORY, [coord], [coord, coord], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.DARK);
    });
    describe('getNeighborsEntryPoint', () => {
        it('should give entry points for each neighbor groups', () => {
            // Given a group with all kind of neighbors
            const group: GoGroupDatas = new GoGroupDatas(GoPiece.DARK_TERRITORY,
                                                         [coord],
                                                         [],
                                                         [coord],
                                                         [coord],
                                                         [coord]);
            // When asking for neighbors entry points
            const neighborsEntryPoint: Coord[] = group.getNeighborsEntryPoints();

            // Then the four entry coords should be there
            expect(neighborsEntryPoint.length).toBe(4);
        });
    });
});
