/* eslint-disable max-lines-per-function */
import { BoardDatas, GroupInfos } from '../../../jscaip/BoardDatas';
import { GoState, GoPiece } from '../GoState';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatasFactory } from '../GoGroupDatasFactory';
import { GoConfig } from '../GoConfig';

describe('GoBoardDatas', () => {

    const _: GoPiece = GoPiece.EMPTY;

    const X: GoPiece = GoPiece.LIGHT;

    const O: GoPiece = GoPiece.DARK;

    const config: GoConfig = new GoConfig(5, 5);

    it('should create one big group for initial board', () => {
        const board: Table<GoPiece> = GoState.getStartingBoard(config);
        const datas: BoardDatas = BoardDatas.ofBoard(board, new GoGroupDatasFactory());
        const allZeroBoard: number[][] = ArrayUtils.createTable<number>(config.width, config.height, 0);
        expect(datas.groupIndexes).toEqual(allZeroBoard);
        expect(datas.groups.length).toBe(1);
        const groupInfos: GroupInfos = datas.groups[0];
        expect(groupInfos.coords.length).toBe(config.width * config.height);
        expect(groupInfos.neighborsEntryPoints.length).toBe(0);
    });
    it('should create three neighbor group', () => {
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
        expect(emptyGroupInfos.neighborsEntryPoints).toEqual([new Coord(2, 3), new Coord(2, 2)]);

        const lightGroupInfos: GroupInfos = datas.groups[1];
        expect(lightGroupInfos.coords.length).toBe(2, 'Light group is composed of two stones');
        expect(lightGroupInfos.neighborsEntryPoints).toEqual([new Coord(2, 1), new Coord(2, 3)]);

        const darkGroupInfos: GroupInfos = datas.groups[2];
        expect(darkGroupInfos.coords.length).toBe(1, 'Dark group is composed of two stones');
        expect(darkGroupInfos.neighborsEntryPoints).toEqual([new Coord(1, 3), new Coord(2, 2)]);
    });
});
