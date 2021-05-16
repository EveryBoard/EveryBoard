import { ComparableObject } from '../utils/Comparable';

export class NodeUnheritance implements ComparableObject {

    public equals(o: ComparableObject): boolean {
        throw new Error('NodeUnheritance.equals not overriden.');
    }
    public toString(): string {
        return '' + this.value;
    }
    constructor(public readonly value: number) {}
}
