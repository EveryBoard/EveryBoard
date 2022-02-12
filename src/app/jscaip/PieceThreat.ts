import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPSet } from 'src/app/utils/MGPSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly direct: MGPSet<Coord>,
                       public readonly mover: MGPSet<Coord>) { }

    public equals(o: PieceThreat): boolean {
        return o.direct.equals(this.direct) &&
               o.mover.equals(this.mover);
    }
}

export class SandwichThreat implements ComparableObject {

    public constructor(public readonly direct: Coord,
                       public readonly mover: MGPSet<Coord>) {
    }
    public equals(o: SandwichThreat): boolean {
        return o.direct.equals(this.direct) &&
               o.mover.equals(this.mover);
    }
}
