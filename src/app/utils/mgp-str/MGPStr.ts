import { Comparable } from '../collection-lib/Comparable';

export class MGPStr implements Comparable {
    constructor(private readonly string: string) {}

    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof MGPStr)) return false;
        const ostr: MGPStr = o as MGPStr;
        return ostr.string === this.string;
    }
    public toString(): string {
        return this.string;
    }
}
