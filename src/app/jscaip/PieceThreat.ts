import { Coord } from 'src/app/jscaip/Coord';
import { ComparableObject } from '@everyboard/lib';
import { ImmutableCoordSet } from './CoordSet';

export class PieceThreat implements ComparableObject {

    public constructor(public readonly directThreats: ImmutableCoordSet,
                       public readonly mover: ImmutableCoordSet) {
    }

    public equals(other: PieceThreat): boolean {
        return other.directThreats.equals(this.directThreats) &&
               other.mover.equals(this.mover);
    }
}

export class SandwichThreat extends PieceThreat {

    public constructor(public readonly directThreat: Coord, mover: ImmutableCoordSet) {
        super(new ImmutableCoordSet([directThreat]), mover);
    }
}
