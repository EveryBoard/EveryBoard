import { GroupDatas, GroupDatasFactory } from 'src/app/jscaip/BoardDatas';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { comparableEquals } from 'src/app/utils/Comparable';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';

export class EpaminondasGroupData extends GroupDatas<number> {

    public values: MGPMap<number, MGPSet<Coord>>;

    public constructor(color: number) {
        super(color);
        this.values = new MGPMap();
    }
    public getCoords(): Coord[] {
        return this.values.get(this.color).get().getCopy();
    }
    public contains(coord: Coord): boolean {
        const none: MGPOptional<MGPSet<Coord>> = this.values.get(Player.NONE.value);
        if (none.isPresent() &&
            none.get().contains(coord))
        {
            return true;
        }
        const zero: MGPOptional<MGPSet<Coord>> = this.values.get(Player.ZERO.value);
        if (zero.isPresent() &&
            zero.get().contains(coord))
        {
            return true;
        }
        const one: MGPOptional<MGPSet<Coord>> = this.values.get(Player.ONE.value);
        return one.isPresent() && one.get().contains(coord);
    }
    public addPawn(coord: Coord, color: number): void {
        const set: MGPSet<Coord> = this.values.get(color).getOrElse(new MGPSet());
        const list: Coord[] = set.getCopy();
        const newList: Coord[] = GroupDatas.insertAsEntryPoint(list, coord);
        this.values.put(color, new MGPSet<Coord>(newList));
    }
    public getNeighboorsEntryPoint(): Coord[] {
        const neighboorsEntryPoint: Coord[] = [];
        for (const key of this.values.listKeys()) {
            if (comparableEquals(key, this.color) === false) {
                const coord: Coord = this.values.get(key).get().get(0);
                neighboorsEntryPoint.push(coord);
            }
        }
        return neighboorsEntryPoint;
    }
}

export class EpaminondasGroupDatasFactory extends GroupDatasFactory<number> {
    public getNewInstance(color: number): EpaminondasGroupData {
        return new EpaminondasGroupData(color);
    }
    public getDirections(): ReadonlyArray<Direction> {
        return Direction.DIRECTIONS as ReadonlyArray<Direction>;
    }
}
