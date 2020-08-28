import { Coord } from "src/app/jscaip/coord/Coord";
import { GoPiece, GoPartSlice } from "../GoPartSlice";
import { Orthogonale } from "src/app/jscaip/DIRECTION";

export class GroupDatas {

    public static VERBOSE: boolean = false;

    constructor(public color: GoPiece,
                public emptyCoords: Coord[],
                public blackCoords: Coord[],
                public whiteCoords: Coord[],
                public deadBlackCoords: Coord[],
                public deadWhiteCoords: Coord[]) {
    }
    public static getGroupDatas(coord: Coord, board: GoPiece[][]): GroupDatas {
        if (GroupDatas.VERBOSE) console.log("GroupDatas.getGroupDatas("+coord+", "+board+")");
        let color: GoPiece = board[coord.y][coord.x];
        let groupDatas: GroupDatas = new GroupDatas(color, [], [], [], [], []);
        return GroupDatas._getGroupDatas(coord, board, groupDatas);
    }
    private static _getGroupDatas(coord: Coord, board: GoPiece[][], groupDatas: GroupDatas): GroupDatas {
        if (GroupDatas.VERBOSE) console.log("GroupDatas._getGroupDatas: ", groupDatas, coord);
        let color: GoPiece = board[coord.y][coord.x];
        groupDatas.addPawn(coord, color);
        if (color === groupDatas.color) {
            for (let direction of Orthogonale.ORTHOGONALES) {
                let nextCoord: Coord = coord.getNext(direction);
                if (nextCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
                    if (!groupDatas.countains(nextCoord)) {
                        groupDatas = GroupDatas._getGroupDatas(nextCoord, board, groupDatas);
                    }
                }
            }
        }
        return groupDatas;
    }
    public getCoords(): Coord[] {
        if (this.color === GoPiece.BLACK) {
            return this.blackCoords;
        } else if (this.color === GoPiece.WHITE) {
            return this.whiteCoords;
        } else if (this.color === GoPiece.DEAD_BLACK) {
            return this.deadBlackCoords;
        } else if (this.color === GoPiece.DEAD_WHITE) {
            return this.deadWhiteCoords;
        } else {
            return this.emptyCoords;
        }
    }
    public countains(coord: Coord): boolean {
        let allCoords: Coord[] = this.blackCoords
                        .concat(this.whiteCoords
                        .concat(this.emptyCoords
                        .concat(this.deadBlackCoords
                        .concat(this.deadWhiteCoords))));
        return allCoords.some(c => c.equals(coord));
    }
    public selfCountains(coord: Coord): boolean {
        const ownCoords: Coord[] = this.getCoords();
        return ownCoords.some(c => c.equals(coord));
    }
    public addPawn(coord: Coord, color: GoPiece) {
        if (this.countains(coord)) {
            throw new Error("Ce groupe contient déjà " + coord);
        }
        if (color === GoPiece.BLACK) {
            this.blackCoords = GroupDatas.insertAsEntryPoint(this.blackCoords, coord);
        } else if (color === GoPiece.WHITE) {
            this.whiteCoords = GroupDatas.insertAsEntryPoint(this.whiteCoords, coord);
        } else if (color === GoPiece.DEAD_BLACK) {
            this.deadBlackCoords = GroupDatas.insertAsEntryPoint(this.deadBlackCoords, coord);
        } else if (color === GoPiece.DEAD_WHITE) {
            this.deadWhiteCoords = GroupDatas.insertAsEntryPoint(this.deadWhiteCoords, coord);
        } else if (color === GoPiece.EMPTY ||
                   color === GoPiece.BLACK_TERRITORY ||
                   color === GoPiece.WHITE_TERRITORY){
            this.emptyCoords = GroupDatas.insertAsEntryPoint(this.emptyCoords, coord);
        // } else if (color === GoPiece.BLACK_TERRITORY) { // TODO: decide if it's needed
        //     this.blackTerritoryCoords = GroupDatas.insertAsEntryPoint(this.blackTerritoryCoords, coord);
        // } else if (color === GoPiece.WHITE_TERRITORY) {
        //    this.whiteTerritoryCoords = GroupDatas.insertAsEntryPoint(this.whiteTerritoryCoords, coord);
        } else {
            throw new Error("Cette couleur de pion de Go n'existe pas: " + color.value);
        }
    }
    public static insertAsEntryPoint(list: Coord[], coord: Coord): Coord[] {
        if (list.length === 0) {
            return [coord];
        } else {
            const first: Coord = list[0];
            if (coord.compareTo(first) < 0) {
                return [coord].concat(list);
            } else {
                return list.concat([coord]);
            }
        }
    }
    public isMonoWrapped(): boolean {
        // If a group is empty, we assign him 1, else 2
        // If only the group of the group and the group of his wrapper are filled, result will be 2*2*1
        const emptyWrapper: number = this.emptyCoords.length === 0 ? 1 : 2;
        const blackWrapper: number = (this.blackCoords.length + this.deadWhiteCoords.length) === 0 ? 1 : 2;
        const whiteWrapper: number = (this.whiteCoords.length + this.deadBlackCoords.length) === 0 ? 1 : 2;
        // const deadBlackWrapper: number = this.deadBlackCoords.length === 0 ? 1 : 2;
        // const deadWhiteWrapper: number = this.deadWhiteCoords.length === 0 ? 1 : 2;
        return (emptyWrapper * blackWrapper * whiteWrapper) === 4;
    }
    public getWrapper(): GoPiece {
        // If a piece is wrapped by a player and/or by dead pawn of his opponent, it's returning the player
        // If a piece is wrapped by two player, it's throwing
        // If a piece is wrapped by a player and dead pawn of this player, it's throwing
        // color, [ empty, black, white, deadblack, deadwhite ]
        // empty, [  0(2),     0,     4,         2,         0 ] => WHITE
        // empty, [  0(2),     2,     2,         0,         0 ] => throw
        // empty, [  0(2),     0,     0,         6,         0 ] => WHITE
        const wrapperSizes: number[] = [];
        wrapperSizes[GoPiece.EMPTY.value] = this.emptyCoords.length;
        wrapperSizes[GoPiece.BLACK.value] = this.blackCoords.length + this.deadWhiteCoords.length;
        wrapperSizes[GoPiece.WHITE.value] = this.whiteCoords.length + this.deadBlackCoords.length;
        wrapperSizes[this.color.nonTerritory().value] = 0;

        const nbWrapper: number = wrapperSizes.filter(wrapperSize => wrapperSize > 0).length;
        if (nbWrapper === 1) {
            const wrapper: number = wrapperSizes.findIndex(wrapperSize => wrapperSize > 0);
            return GoPiece.of(wrapper);
        } else {
            throw new Error("Incorrect number of wrapper: " + nbWrapper);
        }
    }
    public getNeighboorsEntryPoint(): Coord[] {
        const neighboorsEntryPoint: Coord[] = [];
        if (this.color !== GoPiece.EMPTY && this.emptyCoords.length > 0)
            neighboorsEntryPoint.push(this.emptyCoords[0]);
        if (this.color !== GoPiece.BLACK && this.blackCoords.length > 0)
            neighboorsEntryPoint.push(this.blackCoords[0]);
        if (this.color !== GoPiece.WHITE && this.whiteCoords.length > 0)
            neighboorsEntryPoint.push(this.whiteCoords[0]);
        if (this.color !== GoPiece.DEAD_BLACK && this.deadBlackCoords.length > 0)
            neighboorsEntryPoint.push(this.deadBlackCoords[0]);
        if (this.color !== GoPiece.DEAD_WHITE && this.deadWhiteCoords.length > 0)
            neighboorsEntryPoint.push(this.deadWhiteCoords[0]);
        return neighboorsEntryPoint;
    }
}