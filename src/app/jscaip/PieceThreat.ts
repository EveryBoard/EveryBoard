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
    public toString(): string {
        throw new Error('Method not implemented.');
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(direct: Coord,
                       public readonly mover: MGPSet<Coord>)
    {
        super(new MGPSet([direct]), mover);
    }
}
