import { YinshBoard } from 'src/app/games/yinsh/YinshBoard';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { YinshPiece } from './YinshPiece';

export class YinshGameState extends GamePartSlice {
    public static getInitialSlice(): YinshGameState {
        return new YinshGameState(YinshBoard.EMPTY, [5, 5], 0);
    }
    public constructor(public readonly hexaBoard: YinshBoard,
                       public readonly sideRings: [number, number],
                       turn: number) {
        super(hexaBoard.toNumberTable(), turn);
    }
    public isInitialPlacementPhase(): boolean {
        return this.turn < 10;
    }
    public equals(other: YinshGameState): boolean {
        if (this === other) return true;
        if (this.turn !== other.turn) return false;
        if (this.sideRings[0] !== other.sideRings[0]) return false;
        if (this.sideRings[1] !== other.sideRings[1]) return false;
        if (this.hexaBoard.equals(other.hexaBoard, (p1: YinshPiece, p2: YinshPiece) => p1 === p2) === false) {
            return false;
        }
        return true;
    }
}
