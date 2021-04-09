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
    public neighboors: Coord[];
    public leftCoord: Coord = null;
    public lastDrop: Coord = null;

    public selectedPiece: Coord;
    public chosenLanding: Coord;

    public viewBox: string;
    public pointScale: Scale;
    public coordScale: Scale;

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.PIECE_SIZE = 50;
        this.hexaLayout = new HexaLayout(this.PIECE_SIZE,
                                         new Coord(0, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.updateBoard();
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
        console.table(this.state.toRepresentation())
        console.log({
            state: this.state,
            move: node.move })
        this.showLastMove();
        this.pieces = this.state.pieces.listKeys();
        this.neighboors = this.getEmptyNeighboors();
        // this.setScale();
        this.viewBox = this.getViewBox();
    }
    public showLastMove(): void {
        const lastMove: SixMove = this.rules.node.move;
        if (lastMove) {
            this.lastDrop = lastMove.landing.getNext(this.state.offset, 1);
            if (lastMove.isDrop() === false) {
                this.leftCoord = lastMove.start.get().getNext(this.state.offset, 1);
            }
        }
    }
    public hideLastMove(): void {
        this.lastDrop = null;
        this.leftCoord = null;
    }
    public getEmptyNeighboors(): Coord[] {
        return this.rules.getLegalLandings(this.state);
    }
    private setScale(): void {
        const scales: { coord: Scale, point: Scale } = this.getScales(this.pieces, this.neighboors);
        if (this.coordScale == null) {
            this.coordScale = scales.coord;
            this.pointScale = scales.coord;
        } else {
            console.log({
                diffMin: {
                    x: this.coordScale.minX - scales.coord.minX,
                    y: this.coordScale.minY - scales.coord.minY,
                },
                offset: this.state.offset,
            })
        }
    }
    private getViewBox(): string {
        const scales: { coord: Scale, point: Scale } = this.getScales(this.pieces, this.neighboors);
        const usedWidth: number = (2 * this.PIECE_SIZE) + scales.point.maxX - scales.point.minX;
        const usedHeight: number = (2 * this.PIECE_SIZE) + scales.point.maxY - scales.point.minY;
        const widthOverstepRatio: number = usedWidth / this.CONCRETE_WIDTH;
        const heightOverstepRatio: number = usedHeight / this.CONCRETE_HEIGHT;
        if (widthOverstepRatio > 1 || heightOverstepRatio > 1) {
            console.log("wanting " + this.CONCRETE_WIDTH + " x " + this.CONCRETE_HEIGHT)
            console.log("using " + usedWidth + " x " + usedHeight)
            const overstepRatio: number = Math.max(widthOverstepRatio, heightOverstepRatio);
            console.log('Ratio de dépassement: (' + overstepRatio + ")");
            console.log("piece size before: " + this.PIECE_SIZE)
            this.PIECE_SIZE /= Math.floor(overstepRatio);
            console.log("piece size (floored) now: " + Math.floor(this.PIECE_SIZE))
        } else {
            console.log('pas de dépassement');
        }
        const width: number = this.CONCRETE_WIDTH / (this.state.width + 2);
        const height: number = this.CONCRETE_HEIGHT / (this.state.height + 2);
        this.PIECE_SIZE = Math.min(width, height);
        this.hexaLayout = new HexaLayout(this.PIECE_SIZE / 2,
                                         new Coord(0, 0),
                                         FlatHexaOrientation.INSTANCE);
        return (-1.5 * this.PIECE_SIZE) + ' ' +
               (-1.5 * this.PIECE_SIZE) + ' ' +
               this.CONCRETE_WIDTH + ' ' +
               this.CONCRETE_HEIGHT;
    }
    private OldgetViewBox(): string {
        const scales: { coord: Scale, point: Scale } = this.getScales(this.pieces, this.neighboors);
        const width: number = Math.ceil(scales.point.maxX - scales.point.minX);
        const height: number = Math.ceil(scales.point.maxY - scales.point.minY);
        const horizontalRatio: number = width / this.CONCRETE_WIDTH;
        const verticalRatio: number = height / this.CONCRETE_HEIGHT;
        const distortion: number = Math.max(horizontalRatio, verticalRatio);
        if (distortion > 1) {
            console.log('what we have to draw is ' + distortion + ' times to big');
            console.log( this.PIECE_SIZE + ' will become ' + this.PIECE_SIZE/distortion);
            this.PIECE_SIZE /= distortion;
            this.hexaLayout = this.hexaLayout = new HexaLayout(this.PIECE_SIZE,
                                                               new Coord(0, 0),
                                                               FlatHexaOrientation.INSTANCE);
        }
        const padding: number = 10;
        return (Math.ceil(scales.point.minX) - padding) + ' ' +
               (Math.ceil(scales.point.minY) - padding) + ' ' +
               this.CONCRETE_WIDTH + ' ' +
               this.CONCRETE_HEIGHT;
    }
    public getScales(pieces: Coord[], neighboors: Coord[]): { point: Scale, coord: Scale } {
        const newCoordScale: Scale = {
            minX: Number.MAX_SAFE_INTEGER,
            minY: Number.MAX_SAFE_INTEGER,
            maxX: Number.MIN_SAFE_INTEGER,
            maxY: Number.MIN_SAFE_INTEGER,
        };
        const newPointScale: Scale = {
            minX: Number.MAX_SAFE_INTEGER,
            minY: Number.MAX_SAFE_INTEGER,
            maxX: Number.MIN_SAFE_INTEGER,
            maxY: Number.MIN_SAFE_INTEGER,
        };
        const coords: Coord[] = pieces.concat(neighboors);
        for (const coord of coords) {
            newCoordScale.minX = Math.min(newCoordScale.minX, coord.x);
            newCoordScale.maxX = Math.max(newCoordScale.maxX, coord.x);
            newCoordScale.minY = Math.min(newCoordScale.minY, coord.y);
            newCoordScale.maxY = Math.max(newCoordScale.maxY, coord.y);
            const cornerCoords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordinates(coord);
            for (const cornerCoord of cornerCoords) {
                newPointScale.minX = Math.min(newPointScale.minX, cornerCoord.x);
                newPointScale.maxX = Math.max(newPointScale.maxX, cornerCoord.x);
                newPointScale.minY = Math.min(newPointScale.minY, cornerCoord.y);
                newPointScale.maxY = Math.max(newPointScale.maxY, cornerCoord.y);
            }
        }
        return { point: newPointScale, coord: newCoordScale };
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
                    this.message("COUPEZ")
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
