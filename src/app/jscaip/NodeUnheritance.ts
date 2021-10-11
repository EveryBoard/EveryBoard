import { ComparableObject } from '../utils/Comparable';
import { Player } from './Player';

export class NodeUnheritance implements ComparableObject {

    public static fromWinner(player: Player): NodeUnheritance {
        if (player === Player.NONE) {
            return new NodeUnheritance(0);
        } else {
            return new NodeUnheritance(player.getVictoryValue());
        }
    }
    public equals(o: ComparableObject): boolean {
        throw new Error('NodeUnheritance.equals not overriden.');
    }
    public toString(): string {
        return '' + this.value;
    }
    constructor(public readonly value: number) {}
}
