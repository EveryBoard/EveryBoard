import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SixGameState } from 'src/app/games/six/six-game-state/SixGameState';
import { SixMove } from 'src/app/games/six/six-move/SixMove';
import { SixFailure, SixNode, SixRules } from 'src/app/games/six/six-rules/SixRules';
import { SixLegalityStatus } from 'src/app/games/six/SixLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/hexa/HexaOrientation';
import { Player } from 'src/app/jscaip/player/Player';
import { JSONValue } from 'src/app/utils/collection-lib/utils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { HexagonalGameComponent } from '../HexagonalGameComponent';

interface Scale {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number
    upperPiece: Coord,
}
@Component({
    selector: 'app-six',
    templateUrl: './six.component.html',
})
export class SixComponent extends HexagonalGameComponent<SixMove, SixGameState, SixLegalityStatus> {

    public readonly CONCRETE_WIDTH: number = 1000;
    public readonly CONCRETE_HEIGHT: number = 800;
    public rules: SixRules = new SixRules(SixGameState);
    public state: SixGameState;

    public pieces: Coord[];
    public disconnected: Coord[];
    public victoryCoords: Coord[];
    public neighboors: Coord[];
    public leftCoord: Coord = null;
    public lastDrop: Coord = null;

    public selectedPiece: Coord;
    public chosenLanding: Coord;

    public viewBox: string;
    public pointScale: Scale;
    public coordScale: Scale;
    public Y_OFFSET: number;

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.setPieceSize(25);
        this.updateBoard();
    }
    private setPieceSize(rayon: number): void {
        this.PIECE_SIZE = 2 * rayon;
        this.hexaLayout = new HexaLayout(rayon,
                                         new Coord(0, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.Y_OFFSET = this.hexaLayout.getYOffset();
    }
    public cancelMoveAttempt(): void {
        this.selectedPiece = null;
        this.chosenLanding = null;
    }
    public decodeMove(encodedMove: JSONValue): SixMove {
        return SixMove.encoder.decode(encodedMove);
    }
    public encodeMove(move: SixMove): JSONValue {
        return SixMove.encoder.encode(move);
    }
    public updateBoard(): void {
        const node: SixNode = this.rules.node;
        this.state = node.gamePartSlice;
        this.showLastMove();
        this.pieces = this.state.pieces.listKeys();
        this.neighboors = this.getEmptyNeighboors();
        this.viewBox = this.getViewBox();
    }
    public showLastMove(): void {
        const lastMove: SixMove = this.rules.node.move;
        if (lastMove) {
            this.lastDrop = lastMove.landing.getNext(this.state.offset, 1);
            if (lastMove.isDrop() === false) {
                this.leftCoord = lastMove.start.get().getNext(this.state.offset, 1);
            }
            if (this.rules.node.isEndGame()) {
                this.victoryCoords = this.rules.getShapeVictory(this.lastDrop, this.rules.node.gamePartSlice);
                //this.victoryCoords = this.victoryCoords.map((c: Coord) => c.getNext(this.state.offset, 1));
            }
        }
    }
    public hideLastMove(): void {
        this.lastDrop = null;
        this.leftCoord = null;
        this.disconnected = [];
        this.victoryCoords = [];
    }
    public getEmptyNeighboors(): Coord[] {
        return this.rules.getLegalLandings(this.state);
    }
    private getViewBox(): string {
        const abstractScale: Scale = this.getAbstractBoardUse(this.pieces, this.neighboors);
        const abstractWidth: number = abstractScale.maxX - abstractScale.minX;
        const abstractHeight: number = abstractScale.maxY - abstractScale.minY;

        const verticalSize: number = this.CONCRETE_HEIGHT / (Math.sin(Math.PI/3) * abstractHeight);
        const horizontalSize: number = this.CONCRETE_WIDTH / ((1.5 * abstractWidth) + 0.5);
        const commonSize: number = Math.min(verticalSize, horizontalSize);

        this.setPieceSize(commonSize);
        const left: number = -2.5 * this.hexaLayout.size;
        const upperPiece: Coord = this.hexaLayout.getCenter(abstractScale.upperPiece);
        const up: number = upperPiece.y - this.hexaLayout.getYOffset();
        return (left - 10) + ' ' + (up - 10) + ' ' +
               (this.CONCRETE_WIDTH + 20) + ' ' +
               (this.CONCRETE_HEIGHT + 20);
    }
    public getAbstractBoardUse(pieces: Coord[], neighboors: Coord[]): Scale {
        const coords: Coord[] = pieces.concat(neighboors);
        let upperPiece: Coord;
        let maxX: number = Number.MIN_SAFE_INTEGER;
        let maxY: number = Number.MIN_SAFE_INTEGER;
        let minX: number = Number.MAX_SAFE_INTEGER;
        let minY: number = Number.MAX_SAFE_INTEGER;
        for (const coord of coords) {
            const coordY: number = (2 * coord.y) + coord.x; // en demi Y_OFFSETs
            const coordX: number = coord.x; // en nombre de colonnes, simplement
            minX = Math.min(minX, coordX);
            if (coordY < minY) {
                minY = coordY;
                upperPiece = coord;
            }
            maxX = Math.max(maxX, coordX + 1);
            maxY = Math.max(maxY, coordY + 2);
        }
        return { minX, minY, maxX, maxY, upperPiece };
    }
    public getPieceFill(coord: Coord): string {
        const player: Player = this.rules.node.gamePartSlice.getPieceAt(coord);
        return this.getPlayerColor(player);
    }
    public async onPieceClick(piece: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + piece.x + '_' + piece.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.state.turn < 40) {
            return this.cancelMove('TODO: DROP BEFORE 40th turn');
        } else if (this.selectedPiece == null) {
            this.selectedPiece = piece;
            return MGPValidation.SUCCESS;
        } else {
            const cuttingMove: SixMove = SixMove.fromCuttingDeplacement(this.selectedPiece, this.chosenLanding, piece);
            return this.chooseMove(cuttingMove, this.state, null, null);
        }
    }
    public async onNeighboorClick(neighboor: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#neighboor_' + neighboor.x + '_' + neighboor.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.state.turn < 40) {
            return this.chooseMove(SixMove.fromDrop(neighboor), this.state, null, null);
        } else {
            if (this.selectedPiece == null) {
                return this.cancelMove('TODO: select a piece to move first, you can no longer drop pieces!');
            } else {
                const deplacement: SixMove = SixMove.fromDeplacement(this.selectedPiece, neighboor);
                const legality: SixLegalityStatus = this.rules.isLegalDeplacement(deplacement, this.state);
                if (this.neededCutting(legality)) {
                    this.chosenLanding = neighboor;
                    this.message('COUPEZ');
                    return MGPValidation.SUCCESS;
                } else {
                    return this.chooseMove(deplacement, this.state, null, null);
                }
            }
        }
    }
    public neededCutting(legality: SixLegalityStatus): boolean {
        return legality.legal.isFailure() &&
               legality.legal.reason === SixFailure.MUST_CUT;
    }
}
