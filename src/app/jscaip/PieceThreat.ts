import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPSet } from 'src/app/utils/MGPSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly directThreats: MGPSet<Coord>,
                       public readonly mover: MGPSet<Coord>) {
    }

    public equals(other: PieceThreat): boolean {
        return other.directThreats.equals(this.directThreats) &&
               other.mover.equals(this.mover);
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(public readonly directThreat: Coord,
                       public readonly mover: MGPSet<Coord>) {
        super(new MGPSet([directThreat]), mover);
    }
}
