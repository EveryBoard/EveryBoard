import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Table } from 'src/app/utils/ArrayUtils';

export class MartianChessPiece {

    public static EMPTY: MartianChessPiece = new MartianChessPiece(0);
    public static PAWN: MartianChessPiece = new MartianChessPiece(1);
    public static DRONE: MartianChessPiece = new MartianChessPiece(2);
    public static QUEEN: MartianChessPiece = new MartianChessPiece(3);

    private constructor(private readonly value: number) {}
}
export class MartianChessState extends GameStateWithTable<MartianChessPiece> {

    public constructor(board: Table<MartianChessPiece>, turn: number) {
        super(board, turn);
    }
}
