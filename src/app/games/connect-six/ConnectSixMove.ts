import { MoveEncoder, NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixFailure } from './ConnectSixFailure';

export class ConnectSixFirstMove extends MoveCoord {

    public static encoder: NumberEncoder<ConnectSixFirstMove> = new class extends NumberEncoder<ConnectSixFirstMove> {
        public maxValue(): number {
            return 18*19 + 18;
        }
        public encodeNumber(move: ConnectSixFirstMove): number {
            // A ConnectSix move ConnectSixes on x from 0 to 18
            // and y from 0 to 18
            // encoded as y*19 + x
            return (move.coord.y * 19) + move.coord.x;
        }
        public decodeNumber(encodedMove: number): ConnectSixFirstMove {
            const x: number = encodedMove % 19;
            const y: number = (encodedMove - x) / 19;
            return new ConnectSixFirstMove(x, y);
        }
    };
    public equals(other: ConnectSixFirstMove): boolean {
        if (this === other) return true;
        return this.coord.equals(other.coord);
    }
    public toString(): string {
        return 'ConnectSixFirstMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
export class ConnectSixDrops extends MoveWithTwoCoords {

    public static from(first: Coord, second: Coord): MGPFallible<ConnectSixDrops> {
        if (first.isNotInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH)) {
            return MGPFallible.failure(ConnectSixFailure.FIRST_COORD_IS_OUT_OF_RANGE());
        } else if (second.isNotInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH)) {
            return MGPFallible.failure(ConnectSixFailure.SECOND_COORD_IS_OUT_OF_RANGE());
        } else {
            return MGPFallible.success(new ConnectSixDrops(first, second));
        }
    }
    public toString(): string {
        return 'TODOTODO';
    }
    public equals(other: ConnectSixMove): boolean {
        return false; // TODOTODO: (a,b) === (b, a)
    }
}

export type ConnectSixMove = ConnectSixFirstMove | ConnectSixDrops;

export const ConnectSixMoveEncoder: MoveEncoder<ConnectSixMove> =
    MoveEncoder.disjunction(ConnectSixFirstMove.encoder,
                            MoveWithTwoCoords.getEncoder(ConnectSixDrops.from),
                            (value: ConnectSixFirstMove): value is ConnectSixFirstMove => {
                                return value instanceof ConnectSixFirstMove;
                            });
