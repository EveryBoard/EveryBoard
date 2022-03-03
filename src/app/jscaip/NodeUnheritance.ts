import { Player, PlayerOrNone } from './Player';

export class NodeUnheritance {

    public static fromWinner(player: PlayerOrNone): NodeUnheritance {
        if (Player.isPlayer(player)) {
            return new NodeUnheritance(player.getVictoryValue());
        } else {
            return new NodeUnheritance(0);
        }
    }
    public toString(): string {
        return '' + this.value;
    }
    constructor(public readonly value: number) {}
}
