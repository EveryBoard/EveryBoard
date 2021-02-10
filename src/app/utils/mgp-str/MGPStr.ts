import { Comparable } from '../collection-lib/Comparable';

export class MGPStr implements Comparable {
    constructor(private readonly string: string) {}

    public equals(o: MGPStr): boolean {
        if (o === this) return true;
        return o.string === this.string;
    }
    public toString(): string {
        return this.string;
    }
}
