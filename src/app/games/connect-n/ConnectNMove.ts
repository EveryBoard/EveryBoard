import { ArrayUtils, Encoder, Set } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { Move } from '../../jscaip/Move';

export class ConnectNMove extends Move {

    public static encoder: Encoder<ConnectNMove> = Encoder.tuple(
        [Encoder.list<Coord>(Coord.encoder)],
        (move: ConnectNMove): [Coord[]] => [ArrayUtils.copy(move.coords.toList())],
        (fields: [Coord[]]): ConnectNMove => ConnectNMove.of(fields[0]),
    );

    public static of(coords: Coord[]): ConnectNMove {
        return new ConnectNMove(new Set(coords));
    }

    public constructor(
        public readonly coords: Set<Coord>,
    ) {
        super();
    }

    public toString(): string {
        return 'ConnectNMove(' + this.coords.toString() + ')';
    }
    public equals(other: ConnectNMove): boolean {
        return this.coords.equals(other.coords);
    }
}
