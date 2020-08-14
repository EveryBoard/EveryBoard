import { GroupInfos, GroupDatas } from "../gorules/GoRules";
import { GoPiece, GoPartSlice } from "../GoPartSlice";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { Coord } from "src/app/jscaip/coord/Coord";

export class GoBoardDatas {

    private constructor(
        readonly groupIndexes: ReadonlyArray<ReadonlyArray<number>>,
        readonly groups: ReadonlyArray<GroupInfos>
    ) { }
    public static ofGoPiece(board: GoPiece[][]): GoBoardDatas {
        let groupIndexes: number[][] = ArrayUtils.createBiArray<number>(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, -1);
        let boardGroupsCoords: Coord[][] = [];
        for (let y: number = 0; y < GoPartSlice.HEIGHT; y++) {
            for (let x: number = 0; x < GoPartSlice.WIDTH; x++) {
                if (groupIndexes[y][x] === -1) {
                    const groupEntryPoint: Coord = new Coord(x, y);
                    const groupDatas: GroupDatas = GroupDatas.getGroupDatas(groupEntryPoint, board);
                    const groupCoords: Coord[] = groupDatas.getCoords();
                    const newGroupIndex = boardGroupsCoords.length;
                    const newGroupCoords: Coord[] = [];
                    for (let coord of groupCoords) {
                        groupIndexes[coord.y][coord.x] = newGroupIndex;
                        newGroupCoords.push(coord);
                    }
                    boardGroupsCoords.push(newGroupCoords);
                }
            }
        }
        const groups: GroupInfos[] = [];
        for (let boardGroupCoords of boardGroupsCoords) {

        }
        return new GoBoardDatas(groupIndexes, groups);
    }
    public static ofBoard(board: number[][]): GoBoardDatas {
        const pieceBoard: GoPiece[][] = GoPartSlice.mapNumberBoard(board);
        return GoBoardDatas.ofGoPiece(pieceBoard);
    }
}