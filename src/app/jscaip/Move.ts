import { ComparableObject } from 'src/app/utils/collection-lib/Comparable';
import { JSONValue } from '../utils/utils/utils';

export abstract class Move implements ComparableObject {
    public abstract toString(): string;

    public abstract equals(o: Move): boolean;

    public abstract encode(): JSONValue;

    public abstract decode(encodedMove: JSONValue): Move;
}
