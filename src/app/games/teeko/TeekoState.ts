import { PlayerOrNoneGameStateWithTable } from '@everyboard/games';

export class TeekoState extends PlayerOrNoneGameStateWithTable {

    public static readonly WIDTH: number = 5;

    public isInDropPhase(): boolean {
        return this.turn < 8;
    }

}
