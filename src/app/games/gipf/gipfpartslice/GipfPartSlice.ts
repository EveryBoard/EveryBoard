import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";
import { Coord } from "src/app/jscaip/coord/Coord";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { HexaBoard } from "src/app/jscaip/hexa/HexaBoard";
import { Player } from "src/app/jscaip/player/Player";
import { GipfPiece } from "../gipfpiece/GipfPiece";

export class GipfPartSlice extends GamePartSlice {
    public static getInitialSlice(): GipfPartSlice {
        return new GipfPartSlice(HexaBoard.empty(3, GipfPiece.EMPTY, GipfPiece.encoder), 0, 15, 15, true, true, 0, 0, MGPOptional.empty());
    }
    public constructor(public hexaBoard: HexaBoard<GipfPiece>,
                       turn: number,
                       public sidePieces: [number, number],
                       public canPlaceDouble: [boolean, boolean],
                       public capturedPieces: [number, number]) {
        super(hexaBoard.toNumberTable(), turn);
    }

    public getNumberOfPiecesToPlace(player: Player): number {
        return this.sidePieces[player.value];
    }

    public getNumberOfPiecesCaptured(player: Player): number {
        return this.capturedPieces[player.value];
    }

    public playerCanStillPlaceDouble(player: Player): boolean {
        return this.canPlaceDouble[player.value];
    }

    public getDoublePiecesOnBoard(player: Player): number {
        let doubles: number = 0;
        this.hexaBoard.forEachCoord((_: Coord, content: GipfPiece) => {
            if (content.isDouble && content.player === player) {
                doubles += 1;
            }
        });
        return doubles;
    }

}
