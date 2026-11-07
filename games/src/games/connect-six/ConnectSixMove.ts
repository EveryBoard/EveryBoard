import { ArrayUtils, Encoder, Set } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { Move } from '../../jscaip/Move';

export class ConnectSixMove extends Move {

    public static encoder: Encoder<ConnectSixMove> = Encoder.tuple(
        [Encoder.list<Coord>(Coord.encoder)],
        (move: ConnectSixMove): [Coord[]] => [ArrayUtils.copy(move.coords.toList())],
        (fields: [Coord[]]): ConnectSixMove => ConnectSixMove.of(fields[0]),
    );

    public static of(coords: Coord[]): ConnectSixMove {
        if (coords.length === 0) {
            throw new Error(`Should not create move with zero drops`);
        }
        return new ConnectSixMove(new Set(coords));
    }

    public constructor(public readonly coords: Set<Coord>) {
        super();
    }

    public toString(): string {
        return 'ConnectSixMove(' + this.coords.toString() + ')';
    }
    public equals(other: ConnectSixMove): boolean {
        return this.coords.equals(other.coords);
    }
}
