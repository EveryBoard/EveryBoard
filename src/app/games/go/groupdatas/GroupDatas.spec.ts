import {GroupDatas} from './GroupDatas';
import {GoPiece} from '../GoPartSlice';
import {Coord} from 'src/app/jscaip/coord/Coord';

describe('GroupDatas:', () => {
    const c: Coord = new Coord(0, 0);

    // dead wrapping => that wrapping alive opposite
    // dead wrapping and his opposite => that opposing
    // two alive wrapping => error

    it('should throw when getWrapped is called on a multi wrapped group', () => {
        const group: GroupDatas = new GroupDatas(GoPiece.EMPTY, [c, c], [c, c], [c, c], [], []);
        expect(() => group.getWrapper()).toThrowError('Incorrect number of wrapper: 2');
    });
    it('should not throw when getWrapped is called on a multi wrapped group where one is the alive opposite of the other', () => {
        const group: GroupDatas = new GroupDatas(GoPiece.EMPTY, [c, c], [], [c, c], [c, c], []);
        expect(group.getWrapper()).toEqual(GoPiece.WHITE);
    });
    it('should return the mono wrapper when alive', () => {
        const group: GroupDatas = new GroupDatas(GoPiece.EMPTY, [c], [c, c], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.BLACK);
    });
    it('should return the alive version of the monowrapper when dead', () => {
        const deadWrapper: GroupDatas = new GroupDatas(GoPiece.EMPTY, [c], [c, c], [], [], [c, c]);
        expect(deadWrapper.getWrapper()).toEqual(GoPiece.BLACK);
    });
    it('should count territory as empty', () => {
        const group: GroupDatas = new GroupDatas(GoPiece.BLACK_TERRITORY, [c], [c, c], [], [], []);
        expect(group.getWrapper()).toEqual(GoPiece.BLACK);
    });
});
