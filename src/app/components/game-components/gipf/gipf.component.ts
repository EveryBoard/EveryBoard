import { Component } from '@angular/core';
import { GipfLegalityStatus } from 'src/app/games/gipf/gipf-legality-status/GipfLegalityStatus';
import { GipfMove } from 'src/app/games/gipf/gipf-move/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { GipfRules } from 'src/app/games/gipf/gipf-rules/GipfRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { HexaOrientation } from 'src/app/jscaip/hexa/HexaOrientation';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { AbstractGameComponent } from '../AbstractGameComponent';

@Component({
    selector: 'app-gipf',
    templateUrl: './gipf.component.html',
})
export class GipfComponent extends AbstractGameComponent<GipfMove, GipfPartSlice, GipfLegalityStatus> {
    public rules: GipfRules = new GipfRules(GipfPartSlice);

    private PIECE_SIZE: number = 30;

    public hexaLayout: HexaLayout = new HexaLayout(this.PIECE_SIZE, new Coord(0, 0), HexaOrientation.POINTY);

    public lastMove: GipfMove = null;

    public slice: GipfPartSlice = null;

    public getPieceSize(): number {
        return this.PIECE_SIZE;
    }

    public updateBoard() {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        this.slice = slice;
        this.board = slice.getCopiedBoard();
    }

    public decodeMove(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
    public encodeMove(move: GipfMove): number {
        return GipfMove.encoder.encode(move);
    }

    public isOnBoard(x: number, y: number): boolean {
        return this.slice.hexaBoard.isOnBoard(new Coord(x, y))
    }

    public isPiece(caseContent: number): boolean {
        const piece: GipfPiece = GipfPiece.encoder.decode(caseContent);
        return piece !== GipfPiece.EMPTY;
    }

    public isDoublePiece(caseContent: number): boolean {
        const piece: GipfPiece = GipfPiece.encoder.decode(caseContent);
        return piece.isDouble;
    }

    public getCenter(x: number, y: number): Coord {
        return this.hexaLayout.getCenter(new Coord(x, y));
    }
    public getHexaCoordinates(coord: Coord): string {
        let desc: string = '';
        for (let corner of this.hexaLayout.getHexaCoordinates(coord)) {
            desc += corner.x + ' ' + corner.y + ' ';
        }
        return desc;
    }

    public onClick(x: number, y: number): Promise<MGPValidation> {
        throw new Error("TODO");
    }

    public getPieceStyle(caseContent: number): any {
        const piece: GipfPiece = GipfPiece.encoder.decode(caseContent);
        return {
            fill: piece.player === Player.ZERO ? 'white' : 'black',
            stroke: 'black',
        }
    }
    public cancelMove(reason?: string): void {
        throw new Error('Method not implemented.');
    }
}
