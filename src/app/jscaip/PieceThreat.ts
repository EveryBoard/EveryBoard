import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from '@everyboard/lib';
import { CoordSet } from './CoordSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly directThreats: CoordSet,
                       public readonly mover: CoordSet) {
    }

    public equals(other: PieceThreat): boolean {
        return other.directThreats.equals(this.directThreats) &&
               other.mover.equals(this.mover);
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(public readonly directThreat: Coord, mover: CoordSet) {
        super(new CoordSet([directThreat]), mover);
    }
}
