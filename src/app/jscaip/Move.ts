import { Comparable } from "src/app/collectionlib/MGPMap";

export abstract class Move implements Comparable {

    public abstract toString(): String;

    public abstract equals(o: any): boolean;

    public abstract encode(): number;

    public abstract decode(encodedMove: number): Move;
}