import { Player } from './Player';

export class NodeUnheritance {

    public static fromWinner(player: Player): NodeUnheritance {
        if (player === Player.NONE) {
            return new NodeUnheritance(0);
        } else {
            return new NodeUnheritance(player.getVictoryValue());
        }
    }
    public toString(): string {
        return '' + this.value;
    }
    constructor(public readonly value: number) {}
}
