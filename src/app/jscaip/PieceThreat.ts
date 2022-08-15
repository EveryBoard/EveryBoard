import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPSet } from 'src/app/utils/MGPSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly directThreats: MGPSet<Coord>,
                       public readonly mover: MGPSet<Coord>) {
    }

    public equals(o: PieceThreat): boolean {
        return o.directThreats.equals(this.directThreats) &&
               o.mover.equals(this.mover);
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(public readonly directThreat: Coord,
                       public readonly mover: MGPSet<Coord>) {
        super(new MGPSet([directThreat]), mover);
    }
}
