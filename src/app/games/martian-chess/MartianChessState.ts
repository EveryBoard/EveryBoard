import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { MartianChessMove } from './MartianChessMove';

export class MartianChessPiece {

    public static EMPTY: MartianChessPiece = new MartianChessPiece(0);
    public static PAWN: MartianChessPiece = new MartianChessPiece(1);
    public static DRONE: MartianChessPiece = new MartianChessPiece(2);
    public static QUEEN: MartianChessPiece = new MartianChessPiece(3);

    public static tryMerge(left: MartianChessPiece, right: MartianChessPiece): MGPOptional<MartianChessPiece> {
        const firstValue: number = left.value;
        const secondValue: number = right.value;
        assert(firstValue !== 0 && secondValue !== 0, 'tryMerge cannot be called with empty pieces');
        const totalValue: number = firstValue + secondValue;
        if (totalValue === 2 || totalValue === 3) {
            return MGPOptional.of(MartianChessPiece.from(totalValue));
        } else {
            return MGPOptional.empty();
        }
    }
    private static from(value: number): MartianChessPiece {
        switch (value) {
            case MartianChessPiece.DRONE.value: return MartianChessPiece.DRONE;
            default:
                Utils.expectToBe(value, MartianChessPiece.QUEEN.value);
                return MartianChessPiece.QUEEN;
        }
    }
    private constructor(private readonly value: number) {}

    public getValue(): number {
        return this.value;
    }
    public equals(other: MartianChessPiece): boolean {
        return this.getValue() === other.getValue();
    }
}
export class MartianChessCapture {

    public static from(pieces: MartianChessPiece[]): MartianChessCapture {
        const map: MGPMap<MartianChessPiece, number> = new MGPMap<MartianChessPiece, number>();
        for (const piece of pieces) {
            MartianChessCapture.addToMap(map, piece);
        }
        return new MartianChessCapture(map);
    }
    public static addToMap(map: MGPMap<MartianChessPiece, number>, piece: MartianChessPiece): void {
        const oldValue: MGPOptional<number> = map.get(piece);
        if (oldValue.isPresent()) {
            map.replace(piece, oldValue.get() + 1);
        } else {
            map.set(piece, 1);
        }
    }
    constructor(public readonly captures: MGPMap<MartianChessPiece, number>) {
        captures.makeImmutable();
    }
    public toValue(): number {
        let sum: number = 0;
        this.captures.forEach((item: {key: MartianChessPiece, value: number}) => {
            sum += item.key.getValue() * item.value;
        });
        return sum;
    }
    public add(piece: MartianChessPiece): MartianChessCapture {
        const newMap: MGPMap<MartianChessPiece, number> = this.captures.getCopy();
        MartianChessCapture.addToMap(newMap, piece);
        return new MartianChessCapture(newMap);
    }
}
export class MartianChessState extends GameStateWithTable<MartianChessPiece> {

    public static getInitialState(): MartianChessState {
        const _: MartianChessPiece = MartianChessPiece.EMPTY;
        const A: MartianChessPiece = MartianChessPiece.PAWN;
        const B: MartianChessPiece = MartianChessPiece.DRONE;
        const C: MartianChessPiece = MartianChessPiece.QUEEN;
        const board: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        return new MartianChessState(board, 0, MGPOptional.empty());
    }
    public readonly captured: MGPMap<Player, MartianChessCapture>;

    public constructor(board: Table<MartianChessPiece>,
                       turn: number,
                       public readonly lastMove: MGPOptional<MartianChessMove> = MGPOptional.empty(),
                       public readonly countDown: MGPOptional<number> = MGPOptional.empty(),
                       captured?: MGPMap<Player, MartianChessCapture>)
    {
        super(board, turn);
        if (captured == null) {
            captured = new MGPMap();
            captured.set(Player.ZERO, MartianChessCapture.from([]));
            captured.set(Player.ONE, MartianChessCapture.from([]));
        }
        captured.makeImmutable();
        this.captured = captured;
    }
    public getPlayerTerritory(player: Player): [number, number] {
        if (player === Player.ZERO) {
            return [0, 3];
        } else {
            return [4, 7];
        }
    }
    public isTherePieceOnPlayerSide(piece: MartianChessPiece): boolean {
        const currentPlayer: Player = this.getCurrentPlayer();
        const yRange: [number, number] = this.getPlayerTerritory(currentPlayer);
        for (let y: number = yRange[0]; y <= yRange[1]; y++) {
            for (let x: number = 0; x < 4; x++) {
                if (this.getPieceAtXY(x, y) === piece) {
                    return true;
                }
            }
        }
        return false;
    }
    public getScoreOf(player: Player): number {
        return this.captured.get(player).get().toValue();
    }
    public getEmptyTerritory(): MGPOptional<Player> {
        if (this.isTerritoryEmpty(Player.ZERO)) {
            return MGPOptional.of(Player.ZERO);
        } else if (this.isTerritoryEmpty(Player.ONE)) {
            return MGPOptional.of(Player.ONE);
        } else {
            return MGPOptional.empty();
        }
    }
    public isTerritoryEmpty(player: Player): boolean {
        const yRange: [number, number] = this.getPlayerTerritory(player);
        for (let y: number = yRange[0]; y <= yRange[1]; y++) {
            for (let x: number = 0; x < 4; x++) {
                if (this.getPieceAtXY(x, y) !== MartianChessPiece.EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }
    public isInOpponentTerritory(coord: Coord): boolean {
        const opponent: Player = this.getCurrentOpponent();
        const opponentTerritoryRange: [number, number] = this.getPlayerTerritory(opponent);
        return opponentTerritoryRange[0] <= coord.y && coord.y <= opponentTerritoryRange[1];
    }
    public isInPlayerTerritory(coord: Coord): boolean {
        const player: Player = this.getCurrentPlayer();
        const opponentTerritoryRange: [number, number] = this.getPlayerTerritory(player);
        return opponentTerritoryRange[0] <= coord.y && coord.y <= opponentTerritoryRange[1];
    }
    public getCapturesOf(player: number): [number, number, number] {
        const capture: MartianChessCapture = this.captured.get(Player.fromTurn(player)).get();
        return [
            capture.captures.get(MartianChessPiece.PAWN).getOrElse(0),
            capture.captures.get(MartianChessPiece.DRONE).getOrElse(0),
            capture.captures.get(MartianChessPiece.QUEEN).getOrElse(0),
        ];
    }
}
