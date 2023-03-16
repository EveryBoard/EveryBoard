import { Coord } from './Coord';
import { MoveEncoder } from '../utils/Encoder';
import { Move } from './Move';
import { JSONValue, JSONValueWithoutArray, Utils } from '../utils/utils';
import { assert } from '../utils/assert';
import { MGPFallible } from '../utils/MGPFallible';

export abstract class MoveWithTwoCoords extends Move {

    public static getEncoder<M extends MoveWithTwoCoords>(generator: (first: Coord, second: Coord) => MGPFallible<M>)
    : MoveEncoder<M>
    {
        return new class extends MoveEncoder<M> {
            public encodeMove(move: M): JSONValueWithoutArray {
                return {
                    first: Coord.encoder.encode(move.first),
                    second: Coord.encoder.encode(move.second),
                };
            }
            public decodeMove(encoded: JSONValue): M {
                // eslint-disable-next-line dot-notation
                assert(Utils.getNonNullable(encoded)['first'] != null, 'Encoded MoveWithTwoCoords should contain a first coord');
                // eslint-disable-next-line dot-notation
                assert(Utils.getNonNullable(encoded)['second'] != null, 'Encoded MoveWithTwoCoords should contain a second coord');
                // eslint-disable-next-line dot-notation
                const first: Coord = Coord.encoder.decode(Utils.getNonNullable(encoded)['first']);
                // eslint-disable-next-line dot-notation
                const second: Coord = Coord.encoder.decode(Utils.getNonNullable(encoded)['second']);
                return generator(first, second).get();
            }
        };
    }
    protected constructor(public readonly first: Coord, public readonly second: Coord) {
        super();
    }
}
