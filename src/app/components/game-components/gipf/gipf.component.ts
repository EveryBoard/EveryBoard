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

    private PIECE_SIZE: number = 45;

    public boardIndices: number[] = [-3, -2, -1, 0, 1, 2, 3];

    public hexaLayout: HexaLayout = new HexaLayout(this.PIECE_SIZE, new Coord(300, 300), HexaOrientation.FLAT);

    public lastMove: GipfMove = null;
    // Selection phases:
    // 1. Initial capture
    //    Optional, only do it if there is a possible capture, in which case it is required to capture
    //    Show all possible capture, let the user click on all captured items and highlight them
    //    Once the user clicks on the "capture these elements" button, apply the capture.
    //    Do this until there are no more possible capture, then move to phase 2
    // 2. Placement.
    //    Select an "entrance", then a direction. Then update the board so that all pieces move in the right direction.
    // 3. Final capture
    //    Just like the initial one

    public getPieceSize(): number {
        return this.PIECE_SIZE * 0.65;
    }

    public updateBoard() {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
    }

    public decodeMove(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
    public encodeMove(move: GipfMove): number {
        return GipfMove.encoder.encode(move);
    }

    public isOnBoard(x: number, y: number): boolean {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        const ret = slice.hexaBoard.isOnBoard(new Coord(x, y))
        if (!ret) { console.log({x, y}); }
        return ret;
    }

    private getPiece(x: number, y: number): GipfPiece {
        const slice: GipfPartSlice = this.rules.node.gamePartSlice;
        const piece: GipfPiece = slice.hexaBoard.getAt(new Coord(x, y));
        return piece;
    }

    public isPiece(x: number, y: number): boolean {
        const piece: GipfPiece = this.getPiece(x, y);
        return piece !== GipfPiece.EMPTY;
    }

    public isDoublePiece(x: number, y: number): boolean {
        const piece: GipfPiece = this.getPiece(x, y);
        return piece.isDouble;
    }

    public getCenter(x: number, y: number): Coord {
        return this.hexaLayout.getCenter(new Coord(x, y));
    }
    public getHexaCoordinates(coord: Coord): string {
        let desc: string = '';
        const coords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordinates(coord);
        for (let corner of coords) {
            desc += corner.x + ' ' + corner.y + ' ';
        }
        desc += coords[0].x + ' ' + coords[0].y;
        return desc;
    }
    public getHexaCoordinatesForXY(x: number, y: number): string {
        return this.getHexaCoordinates(new Coord(x, y));
    }

    public onClick(x: number, y: number): Promise<MGPValidation> {
        throw new Error("TODO");
    }

    public getPieceStyle(x: number, y: number): any {
        const piece: GipfPiece = this.getPiece(x, y);
        return {
            fill: piece.player === Player.ZERO ? 'white' : 'black',
            stroke: 'black',
        }
    }
    public cancelMove(reason?: string): void {
        throw new Error('Method not implemented.');
    }
}
