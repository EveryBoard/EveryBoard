import { GamePartSlice } from "src/app/jscaip/GamePartSlice";

export class EncapsulePartSlice extends GamePartSlice<EncapsuleCase> {

    protected readonly board: EncapsuleCase[][];
}

export class EncapsuleCase {

    public readonly small: Player;

    public readonly medium: Player;

    public readonly big: Player;

    constructor(small: Player, medium: Player, big: Player) {
        this.small = small;
        this.medium = medium;
        this.big = big;
    }
}

enum Player {
    BLACK = 0,
    WHITE = 1,
    NONE = 2,
}