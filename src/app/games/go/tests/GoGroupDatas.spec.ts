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
});
