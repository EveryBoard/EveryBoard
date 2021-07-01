import { YinshBoard } from 'src/app/games/yinsh/YinshBoard';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';

export class YinshGameState extends GamePartSlice {
    public static getInitialSlice(): YinshGameState {
        return new YinshGameState(YinshBoard.EMPTY, [5, 5], 0);
    }
    public constructor(public readonly hexaBoard: YinshBoard,
                       public readonly sideRings: [number, number],
                       turn: number) {
        super(hexaBoard.toNumberTable(), turn);
    }
}
