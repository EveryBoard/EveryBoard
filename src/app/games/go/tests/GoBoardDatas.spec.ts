import { BoardDatas, GroupInfos } from '../../../jscaip/BoardDatas';
import { GoState, GoPiece } from '../GoState';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatasFactory } from '../GoGroupDatasFactory';

describe('GoBoardDatas', () => {
    const _: GoPiece = GoPiece.EMPTY;

    const X: GoPiece = GoPiece.WHITE;

    const O: GoPiece = GoPiece.BLACK;

    beforeAll(() => {
        GoState.HEIGHT = 5;
        GoState.WIDTH = 5;
    });
    it('should create one big group for initial board', () => {
        const board: Table<GoPiece> = GoState.getStartingBoard();
        const datas: BoardDatas = BoardDatas.ofBoard(board, new GoGroupDatasFactory());
        const allZeroBoard: number[][] = ArrayUtils.createTable<number>(GoState.WIDTH, GoState.HEIGHT, 0);
        expect(datas.groupIndexes).toEqual(allZeroBoard);
        expect(datas.groups.length).toBe(1);
        const groupInfos: GroupInfos = datas.groups[0];
        expect(groupInfos.coords.length).toBe(GoState.WIDTH * GoState.HEIGHT);
        expect(groupInfos.neighboorsEP.length).toBe(0);
    });
    it('should create three neighboor group', () => {
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, X, X, _],
            [_, _, O, _, _],
            [_, _, _, _, _],
        ];
        const datas: BoardDatas = BoardDatas.ofBoard(board, new GoGroupDatasFactory());
        const groupIndexes: number[][] = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 2, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        expect(datas.groupIndexes).toEqual(groupIndexes);
        expect(datas.groups.length).toBe(3);

        const emptyGroupInfos: GroupInfos = datas.groups[0];
        expect(emptyGroupInfos.coords.length).toBe(22);
        expect(emptyGroupInfos.neighboorsEP).toEqual([new Coord(2, 3), new Coord(2, 2)]);

        const whiteGroupInfos: GroupInfos = datas.groups[1];
        expect(whiteGroupInfos.coords.length).toBe(2, 'White group is composed of two stones');
        expect(whiteGroupInfos.neighboorsEP).toEqual([new Coord(2, 1), new Coord(2, 3)]);

        const blackGroupInfos: GroupInfos = datas.groups[2];
        expect(blackGroupInfos.coords.length).toBe(1, 'Black group is composed of two stones');
        expect(blackGroupInfos.neighboorsEP).toEqual([new Coord(1, 3), new Coord(2, 2)]);
    });
});
