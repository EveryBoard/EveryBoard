import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPSet } from 'src/app/utils/MGPSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly directs: MGPSet<Coord>,
                       public readonly mover: MGPSet<Coord>) { }

    public equals(o: PieceThreat): boolean {
        return o.directs.equals(this.directs) &&
               o.mover.equals(this.mover);
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(public readonly direct: Coord,
                       public readonly mover: MGPSet<Coord>) {
        super(new MGPSet([direct]), mover);
    }
}
