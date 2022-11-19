import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Utils } from 'src/app/utils/utils';

export class LascaPiece {
    public static readonly ZERO: LascaPiece = new LascaPiece(Player.ZERO, false);
    public static readonly ONE: LascaPiece = new LascaPiece(Player.ONE, false);
    public static readonly ZERO_OFFICER: LascaPiece = new LascaPiece(Player.ZERO, true);
    public static readonly ONE_OFFICER: LascaPiece = new LascaPiece(Player.ONE, true);

    public static from(player: Player, isOfficer: boolean): LascaPiece {
        if (player === Player.ZERO) {
            if (isOfficer) {
                return LascaPiece.ZERO_OFFICER;
            } else {
                return LascaPiece.ZERO;
            }
        } else {
            if (isOfficer) {
                return LascaPiece.ONE_OFFICER;
            } else {
                return LascaPiece.ONE;
            }
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
}
export class LascaSpace {

    public static EMPTY: LascaSpace = new LascaSpace([]);

    public constructor(private readonly pieces: readonly LascaPiece[]) {}

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
    public getCommandedPile(): LascaSpace {
        return new LascaSpace(ArrayUtils.copyImmutableArray(this.pieces).slice(1));
    }
    public capturePiece(piece: LascaPiece): LascaSpace {
        return new LascaSpace(ArrayUtils.copyImmutableArray(this.pieces).concat(piece));
    }
    public addPileBelow(pile: LascaSpace): LascaSpace {
        const belowPieces: LascaPiece[] = ArrayUtils.copyImmutableArray(pile.pieces);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let resultingPile: LascaSpace = this;
        for (const piece of belowPieces) {
            resultingPile = resultingPile.capturePiece(piece);
        }
        return resultingPile;
    }
    public getPileSize(): number {
        return this.pieces.length;
    }
    public promoteCommander(): LascaSpace {
        let commander: LascaPiece = this.getCommander();
        if (commander.isOfficer) {
            return this;
        } else {
            commander = LascaPiece.from(commander.player, true);
            const remainingPile: LascaSpace = this.getCommandedPile();
            const commandingPile: LascaSpace = new LascaSpace([commander]);
            return commandingPile.addPileBelow(remainingPile);
        }
    }
    public get(index: number): LascaPiece {
        return this.pieces[index];
    }
    public toString(length: number): string {
        let leftFill: number = length - this.getPileSize();
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

export class LascaState extends GameStateWithTable<LascaSpace> {

    public static getInitialState(): LascaState {
        const O: LascaSpace = new LascaSpace([LascaPiece.ZERO]);
        const X: LascaSpace = new LascaSpace([LascaPiece.ONE]);
        const _: LascaSpace = LascaSpace.EMPTY;
        const board: Table<LascaSpace> = [
            [X, _, X, _, X, _, X],
            [_, X, _, X, _, X, _],
            [X, _, X, _, X, _, X],
            [_, _, _, _, _, _, _],
            [O, _, O, _, O, _, O],
            [_, O, _, O, _, O, _],
            [O, _, O, _, O, _, O],
        ];
        // const board: Table<LascaSpace> = [
        //     [_, _, X, _, X, _, X],
        //     [_, X, _, X, _, X, _],
        //     [X, _, O, _, X, _, X],
        //     [_, _, _, _, _, _, _],
        //     [O, _, O, _, O, _, O],
        //     [_, O, _, O, _, O, _],
        //     [O, _, O, _, O, _, O],
        // ];
        return new LascaState(board, 0);
    }
    public static from(board: Table<LascaSpace>, turn: number): MGPFallible<LascaState> {
        return MGPFallible.success(new LascaState(board, turn));
    }
    public getPileOf(player: Player): Coord[] {
        const pileCoords: Coord[] = [];
        for (let y: number = 0; y < 7; y++) {
            for (let x: number = 0; x < 7; x++) {
                if (this.getPieceAtXY(x, y).isCommandedBy(player)) {
                    pileCoords.push(new Coord(x, y));
                }
            }
        }
        return pileCoords;
    }
    public set(coord: Coord, value: LascaSpace): LascaState {
        const newBoard: LascaSpace[][] = this.getCopiedBoard();
        newBoard[coord.y][coord.x] = value;
        return new LascaState(newBoard, this.turn);
    }
    public remove(coord: Coord): LascaState {
        return this.set(coord, LascaSpace.EMPTY);
    }
    public incrementTurn(): LascaState {
        return new LascaState(this.getCopiedBoard(), this.turn + 1);
    }
    public getFinishLineOf(player: Player): number {
        if (player === Player.ZERO) {
            return 0;
        } else {
            return 6;
        }
    }
    public toString(): string {
        let biggerPile: number = 1;
        for (let y: number = 0; y < 7; y++) {
            for (let x: number = 0; x < 7; x++) {
                const newPileSize: number = this.getPieceAtXY(x, y).getPileSize();
                biggerPile = Math.max(biggerPile, newPileSize);
            }
        }
        const lines: string[] = [];
        for (let y: number = 0; y < 7; y++) {
            const spaces: string[] = [];
            for (let x: number = 0; x < 7; x++) {
                spaces.push(this.getPieceAtXY(x, y).toString(biggerPile));
            }
            lines.push(spaces.join(' '));
        }
        return lines.join('\n');
    }
}
