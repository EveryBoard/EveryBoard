import { PlayerOrNone } from './Player';

export class BoardValue {

    public static fromWinner(player: PlayerOrNone): BoardValue {
        if (player.isPlayer()) {
            return new BoardValue(player.getVictoryValue());
        } else {
            return new BoardValue(0);
        }
    }
    public toString(): string {
        return '' + this.value;
    }
    public constructor(public readonly value: number) {}
}
