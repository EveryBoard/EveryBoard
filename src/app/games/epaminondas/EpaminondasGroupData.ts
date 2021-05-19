import { Coord } from 'src/app/jscaip/Coord';
import { GroupDatas } from 'src/app/jscaip/GroupDatas';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';

export class EpaminondasGroupData extends GroupDatas<Player> {

    public values: MGPMap<Player, MGPSet<Coord>>;

    public constructor(color: Player) {
        super(color);
        this.values = new MGPMap();
    }
    public getCoords(): Coord[] {
        return this.values.get(this.color).get().getCopy();
    }
    public countains(coord: Coord): boolean {
        const none: MGPOptional<MGPSet<Coord>> = this.values.get(Player.NONE);
        if (none.isPresent() &&
            none.get().contains(coord))
        {
            return true;
        }
        const zero: MGPOptional<MGPSet<Coord>> = this.values.get(Player.ZERO);
        if (zero.isPresent() &&
            zero.get().contains(coord))
        {
            return true;
        }
        const one: MGPOptional<MGPSet<Coord>> = this.values.get(Player.ONE);
        return one.isPresent() && one.get().contains(coord);
    }
    public addPawn(coord: Coord, color: Player): void {
        const set: MGPSet<Coord> = this.values.get(color).getOrNull();
        let newList: Coord[];
        if (set == null) {
            newList = [coord];
        } else {
            const list: Coord[] = set.getCopy();
            newList = GroupDatas.insertAsEntryPoint(list, coord);
        }
        this.values.put(color, new MGPSet<Coord>(newList));
    }
    public getNeighboorsEntryPoint(): Coord[] {
        const neighboorsEntryPoint: Coord[] = [];
        for (const key of this.values.listKeys()) {
            if (key.equals(this.color) === false) {
                const coord: Coord = this.values.get(key).get().get(0);
                neighboorsEntryPoint.push(coord);
            }
        }
        return neighboorsEntryPoint;
    }
}
