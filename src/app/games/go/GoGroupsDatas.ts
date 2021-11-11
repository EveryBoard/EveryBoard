import { GroupDatas } from 'src/app/jscaip/BoardDatas';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Utils } from 'src/app/utils/utils';
import { GoPiece } from './GoState';

export class GoGroupDatas extends GroupDatas<GoPiece> {

    constructor(color: GoPiece,
                public emptyCoords: Coord[],
                public blackCoords: Coord[],
                public whiteCoords: Coord[],
                public deadBlackCoords: Coord[],
                public deadWhiteCoords: Coord[])
    {
        super(color);
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
    public contains(coord: Coord): boolean {
        const allCoords: Coord[] = this.blackCoords
            .concat(this.whiteCoords
                .concat(this.emptyCoords
                    .concat(this.deadBlackCoords
                        .concat(this.deadWhiteCoords))));
        return allCoords.some((c: Coord) => c.equals(coord));
    }
    public addPawn(coord: Coord, color: GoPiece): void {
        if (this.contains(coord)) {
            throw new Error('This group already contains ' + coord);
        }
        switch (color) {
            case GoPiece.BLACK:
                this.blackCoords = GroupDatas.insertAsEntryPoint(this.blackCoords, coord);
                break;
            case GoPiece.WHITE:
                this.whiteCoords = GroupDatas.insertAsEntryPoint(this.whiteCoords, coord);
                break;
            case GoPiece.DEAD_BLACK:
                this.deadBlackCoords = GroupDatas.insertAsEntryPoint(this.deadBlackCoords, coord);
                break;
            case GoPiece.DEAD_WHITE:
                this.deadWhiteCoords = GroupDatas.insertAsEntryPoint(this.deadWhiteCoords, coord);
                break;
            default:
                Utils.expectToBeMultiple(color, [GoPiece.EMPTY, GoPiece.BLACK_TERRITORY, GoPiece.WHITE_TERRITORY]);
                this.emptyCoords = GroupDatas.insertAsEntryPoint(this.emptyCoords, coord);
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
        const wrapperSizes: MGPMap<GoPiece, number> = new MGPMap();
        wrapperSizes.set(GoPiece.EMPTY, this.emptyCoords.length);
        wrapperSizes.set(GoPiece.BLACK, this.blackCoords.length + this.deadWhiteCoords.length);
        wrapperSizes.set(GoPiece.WHITE, this.whiteCoords.length + this.deadBlackCoords.length);
        wrapperSizes.put(this.color.nonTerritory(), 0);

        const nonEmptyWrapper: MGPMap<GoPiece, number> =
            wrapperSizes.filter((_key: GoPiece, value: number) => value > 0);
        if (nonEmptyWrapper.size() === 1) {
            return nonEmptyWrapper.getByIndex(0).key;
        } else {
            throw new Error(`Can't call getWrapper on non-mono-wrapped group`);
        }
    }
    public getNeighboorsEntryPoint(): Coord[] {
        const neighboorsEntryPoint: Coord[] = [];
        if (this.color !== GoPiece.EMPTY && this.emptyCoords.length > 0) {
            neighboorsEntryPoint.push(this.emptyCoords[0]);
        }
        if (this.color !== GoPiece.BLACK && this.blackCoords.length > 0) {
            neighboorsEntryPoint.push(this.blackCoords[0]);
        }
        if (this.color !== GoPiece.WHITE && this.whiteCoords.length > 0) {
            neighboorsEntryPoint.push(this.whiteCoords[0]);
        }
        if (this.color !== GoPiece.DEAD_BLACK && this.deadBlackCoords.length > 0) {
            neighboorsEntryPoint.push(this.deadBlackCoords[0]);
        }
        if (this.color !== GoPiece.DEAD_WHITE && this.deadWhiteCoords.length > 0) {
            neighboorsEntryPoint.push(this.deadWhiteCoords[0]);
        }
        return neighboorsEntryPoint;
    }
}
