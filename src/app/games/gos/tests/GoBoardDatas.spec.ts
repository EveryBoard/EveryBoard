/* eslint-disable max-lines-per-function */
import { BoardData, GroupInfos } from '../../../jscaip/BoardData';
import { GoState } from '../GoState';
import { GoPiece } from '../GoPiece';
import { TableUtils, Table } from 'src/app/jscaip/TableUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { OrthogonalGoGroupDataFactory } from '../GoGroupDataFactory';

describe('GoBoardData for Go', () => {

    const _: GoPiece = GoPiece.EMPTY;
    const X: GoPiece = GoPiece.LIGHT;
    const O: GoPiece = GoPiece.DARK;

    const width: number = 5;
    const height: number = 5;

    it('should create one big group for initial board', () => {
        const board: Table<GoPiece> = GoState.getStartingBoard(width, height);
        const data: BoardData = BoardData.ofBoard(board, new OrthogonalGoGroupDataFactory());
        const allZeroBoard: number[][] = TableUtils.create(width, height, 0);
        expect(data.groupIndices).toEqual(allZeroBoard);
        expect(data.groups.length).toBe(1);
        const groupInfos: GroupInfos = data.groups[0];
        expect(groupInfos.coords.length).toBe(width * height);
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
        const data: BoardData = BoardData.ofBoard(board, new OrthogonalGoGroupDataFactory());
        const groupIndices: number[][] = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 2, 0, 0],
            [0, 0, 0, 0, 0],
        ];
        expect(data.groupIndices).toEqual(groupIndices);
        expect(data.groups.length).toBe(3);

        const emptyGroupInfos: GroupInfos = data.groups[0];
        expect(emptyGroupInfos.coords.length).toBe(22);
        expect(emptyGroupInfos.neighborsEntryPoints).toEqual([new Coord(2, 3), new Coord(2, 2)]);

        const lightGroupInfos: GroupInfos = data.groups[1];
        expect(lightGroupInfos.coords.length).toBe(2, 'Light group is composed of two stones');
        expect(lightGroupInfos.neighborsEntryPoints).toEqual([new Coord(2, 1), new Coord(2, 3)]);

        const darkGroupInfos: GroupInfos = data.groups[2];
        expect(darkGroupInfos.coords.length).toBe(1, 'Dark group is composed of two stones');
        expect(darkGroupInfos.neighborsEntryPoints).toEqual([new Coord(1, 3), new Coord(2, 2)]);
    });

});
