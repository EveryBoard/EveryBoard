import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { Utils } from 'src/app/utils/utils';

export class LascaPiece {

    public static readonly ZERO: LascaPiece = new LascaPiece(Player.ZERO, false);
    public static readonly ONE: LascaPiece = new LascaPiece(Player.ONE, false);
    public static readonly ZERO_OFFICER: LascaPiece = new LascaPiece(Player.ZERO, true);
    public static readonly ONE_OFFICER: LascaPiece = new LascaPiece(Player.ONE, true);

    public static getPlayerOfficer(player: Player): LascaPiece {
        if (player === Player.ZERO) {
            return LascaPiece.ZERO_OFFICER;
        } else {
            return LascaPiece.ONE_OFFICER;
        }
    }
    private constructor(public readonly player: Player, public readonly isOfficer: boolean) {}

    public toString(): string {
        switch (this) {
            case LascaPiece.ZERO: return 'u';
            case LascaPiece.ONE: return 'v';
            case LascaPiece.ZERO_OFFICER: return 'O';
            default:
                Utils.expectToBe(this, LascaPiece.ONE_OFFICER);
                return 'X';
        }
    }
    public equals(other: LascaPiece): boolean {
        return this === other;
    }
}
export class LascaStack {

    public static EMPTY: LascaStack = new LascaStack([]);

    public constructor(public readonly pieces: ReadonlyArray<LascaPiece>) {
    }
    public isEmpty(): boolean {
        return this.pieces.length === 0;
    }
    public isCommandedBy(player: Player): boolean {
        if (this.isEmpty()) {
            return false;
        }
        return this.getCommander().player === player;
    }
    public getCommander(): LascaPiece {
        return this.pieces[0];
    }
    public getPiecesUnderCommander(): LascaStack {
        return new LascaStack(this.pieces.slice(1));
    }
    public capturePiece(piece: LascaPiece): LascaStack {
        return new LascaStack(this.pieces.concat(piece));
    }
    public addStackBelow(stack: LascaStack): LascaStack {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let resultingStack: LascaStack = this;
        for (const piece of stack.pieces) {
            resultingStack = resultingStack.capturePiece(piece);
        }
        return resultingStack;
    }
    public getStackSize(): number {
        return this.pieces.length;
    }
    public promoteCommander(): LascaStack {
        let commander: LascaPiece = this.getCommander();
        if (commander.isOfficer) {
            return this;
        } else {
            commander = LascaPiece.getPlayerOfficer(commander.player);
            const remainingStack: LascaStack = this.getPiecesUnderCommander();
            const commandingStack: LascaStack = new LascaStack([commander]);
            return commandingStack.addStackBelow(remainingStack);
        }
    }
    public get(index: number): LascaPiece {
        return this.pieces[index];
    }
    public toString(length: number): string {
        let leftFill: number = length - this.getStackSize();
        let result: string = '';
        while (leftFill > 0) {
            result += '_';
            leftFill--;
        }
        for (const piece of this.pieces) {
            result += piece.toString();
        }
        return result;
    }
}

export class LascaState extends GameStateWithTable<LascaStack> {

    public static readonly SIZE: number = 7;

    public static getInitialState(): LascaState {
        const O: LascaStack = new LascaStack([LascaPiece.ZERO]);
        const X: LascaStack = new LascaStack([LascaPiece.ONE]);
        const _: LascaStack = LascaStack.EMPTY;
        const board: Table<LascaStack> = [
            [X, _, X, _, X, _, X],
            [_, X, _, X, _, X, _],
            [X, _, X, _, X, _, X],
            [_, _, _, _, _, _, _],
            [O, _, O, _, O, _, O],
            [_, O, _, O, _, O, _],
            [O, _, O, _, O, _, O],
        ];
        return new LascaState(board, 0);
    }
    public static from(board: Table<LascaStack>, turn: number): LascaState {
        return new LascaState(board, turn);
    }
    public static isNotOnBoard(coord: Coord): boolean {
        return coord.isNotInRange(LascaState.SIZE, LascaState.SIZE);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(LascaState.SIZE, LascaState.SIZE);
    }
    public getStacksOf(player: Player): Coord[] {
        const stackCoords: Coord[] = [];
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                if (this.getPieceAtXY(x, y).isCommandedBy(player)) {
                    stackCoords.push(new Coord(x, y));
                }
            }
        }
        return stackCoords;
    }
    public set(coord: Coord, value: LascaStack): LascaState {
        const newBoard: LascaStack[][] = this.getCopiedBoard();
        newBoard[coord.y][coord.x] = value;
        return new LascaState(newBoard, this.turn);
    }
    public remove(coord: Coord): LascaState {
        return this.set(coord, LascaStack.EMPTY);
    }
    public incrementTurn(): LascaState {
        return new LascaState(this.getCopiedBoard(), this.turn + 1);
    }
    public getFinishLineOf(player: Player): number {
        if (player === Player.ZERO) {
            return 0;
        } else {
            return LascaState.SIZE - 1;
        }
    }
    public toString(): string {
        let biggerStack: number = 1;
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                const newStackSize: number = this.getPieceAtXY(x, y).getStackSize();
                biggerStack = Math.max(biggerStack, newStackSize);
            }
        }
        const lines: string[] = [];
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            const squares: string[] = [];
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                squares.push(this.getPieceAtXY(x, y).toString(biggerStack));
            }
            lines.push(squares.join(' '));
        }
        return lines.join('\n');
    }
}
