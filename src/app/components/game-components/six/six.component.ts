import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SixGameState } from 'src/app/games/six/six-game-state/SixGameState';
import { SixMove } from 'src/app/games/six/six-move/SixMove';
import { SixNode, SixRules } from 'src/app/games/six/six-rules/SixRules';
import { SixLegalityStatus } from 'src/app/games/six/SixLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/hexa/HexaOrientation';
import { Player } from 'src/app/jscaip/player/Player';
import { JSONValue } from 'src/app/utils/collection-lib/utils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { HexagonalGameComponent } from '../HexagonalGameComponent';

@Component({
    selector: 'app-six',
    templateUrl: './six.component.html',
})
export class SixComponent extends HexagonalGameComponent<SixMove, SixGameState, SixLegalityStatus> {

    public readonly CONCRETE_WIDTH: number = 1000;
    public readonly CONCRETE_HEIGHT: number = 800;
    public rules: SixRules = new SixRules(SixGameState);
    private state: SixGameState;

    public pieces: Coord[];
    public disconnected: Coord[];
    public neighboors: Coord[];
    public leftCase: Coord = null;
    public lastDrop: Coord = null;

    public selectedPiece: Coord;

    public viewBox: string;

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.PIECE_SIZE = 50;
        this.hexaLayout = new HexaLayout(this.PIECE_SIZE,
                                         new Coord(0, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.updateBoard();
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
        this.pieces = this.state.pieces.listKeys();
        this.neighboors = this.getEmptyNeighboors();
        this.viewBox = this.getViewBox();
        const lastMove: SixMove = node.move;
        if (lastMove) {
            this.lastDrop = lastMove.landing;
            if (lastMove.isDrop() === false) {
                this.leftCase = lastMove.start.get();
            }
        }
    }
    public getEmptyNeighboors(): Coord[] {
        return this.rules.getLegalLandings(this.state);
    }
    private getViewBox(): string {
        const scale: { minX: number, minY: number, maxX: number, maxY: number } =
            this.getScale(this.pieces, this.neighboors);
        const width: number = Math.ceil(scale.maxX - scale.minX);
        const height: number = Math.ceil(scale.maxY - scale.minY);
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
        console.log( { scaleAfter: this.getScale(this.pieces, this.neighboors ) });
        const padding: number = 10;
        return (Math.ceil(scale.minX) - padding) + ' ' +
               (Math.ceil(scale.minY) - padding) + ' ' +
               this.CONCRETE_WIDTH + ' ' +
               this.CONCRETE_HEIGHT;
    }
    public getScale(pieces: Coord[], neighboors: Coord[]): { minX: number, minY: number, maxX: number, maxY: number } {
        let minX: number = Number.MAX_SAFE_INTEGER;
        let minY: number = Number.MAX_SAFE_INTEGER;
        let maxX: number = Number.MIN_SAFE_INTEGER;
        let maxY: number = Number.MIN_SAFE_INTEGER;
        const coords: Coord[] = pieces.concat(neighboors);
        for (const coord of coords) {
            const cornerCoords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordinates(coord);
            for (const cornerCoord of cornerCoords) {
                minX = Math.min(minX, cornerCoord.x);
                maxX = Math.max(maxX, cornerCoord.x);
                minY = Math.min(minY, cornerCoord.y);
                maxY = Math.max(maxY, cornerCoord.y);
            }
        }
        return { minX, minY, maxX, maxY };
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
        } else {
            this.selectedPiece = piece;
            return MGPValidation.SUCCESS;
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
                // TODO
            } else {
                return this.chooseMove(SixMove.fromDeplacement(this.selectedPiece, neighboor), this.state, null, null);
            }
        }
    }
}
