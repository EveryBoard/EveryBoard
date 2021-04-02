import { Comparable } from 'src/app/utils/collection-lib/Comparable';
import { JSONValue } from '../utils/collection-lib/utils';

export abstract class Move implements Comparable {
    public abstract toString(): string;

    public abstract equals(o: Move): boolean;

    public abstract encode(): JSONValue;

    public abstract decode(encodedMove: JSONValue): Move;
}
