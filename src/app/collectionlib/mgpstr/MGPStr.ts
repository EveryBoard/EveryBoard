import { Comparable } from "../Comparable";

export class MGPStr implements Comparable {

    constructor(private readonly string: String) {}

    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof MGPStr)) return false;
        const ostr: MGPStr = o as MGPStr;
        return ostr.string === this.string;
    }
    public toString(): String {
        return this.string;
    }
}