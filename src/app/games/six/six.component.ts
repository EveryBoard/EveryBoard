import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SixGameState } from 'src/app/games/six/SixGameState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { SixMinimax, SixNode, SixRules } from 'src/app/games/six/SixRules';
import { SixLegalityStatus } from 'src/app/games/six/SixLegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { JSONValue } from 'src/app/utils/utils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexagonalGameComponent }
    from '../../components/game-components/abstract-game-component/HexagonalGameComponent';
import { Minimax } from 'src/app/jscaip/Minimax';

interface Scale {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number
    upperPiece: Coord,
    lefterPiece: Coord,
}
@Component({
    selector: 'app-six',
    templateUrl: './six.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class SixComponent extends HexagonalGameComponent<SixMove, SixGameState, SixLegalityStatus> {

    public availableMinimaxes: Minimax<SixMove, SixGameState, SixLegalityStatus>[] = [
        // TODO:does minimax use legality status ????
        new SixMinimax('SixMinimax'),
    ];
    public readonly CONCRETE_WIDTH: number = 1000;
    public readonly CONCRETE_HEIGHT: number = 800;
    public rules: SixRules = new SixRules(SixGameState);
    public state: SixGameState;

    public pieces: Coord[];
    public disconnecteds: Coord[] = [];
    public cuttables: Coord[] = [];
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
    public PIECE_SIZE: number = 30;

    public hexaLayout: HexaLayout =
        new HexaLayout(this.PIECE_SIZE * 1.50,
                       new Coord(this.PIECE_SIZE * 2, 0),
                       FlatHexaOrientation.INSTANCE);

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
        this.cuttables = [];
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
        const lastMove: SixMove = this.rules.node.move;
        if (lastMove) {
            this.showLastMove();
        } else {
            // For didacticial
            this.leftCoord = null;
            this.lastDrop = null;
            this.victoryCoords = [];
        }
        this.pieces = this.state.pieces.listKeys();
        this.neighboors = this.getEmptyNeighboors();
        this.viewBox = this.getViewBox();
    }
    public showLastMove(): void {
        const lastMove: SixMove = this.rules.node.move;
        this.lastDrop = lastMove.landing.getNext(this.state.offset, 1);
        if (lastMove.isDrop() === false) {
            this.leftCoord = lastMove.start.get().getNext(this.state.offset, 1);
        } else {
            this.leftCoord = null;
        }
        const minimax: SixMinimax = new SixMinimax('SixMinimax'); // TODO: move to rules and remove ?
        if (this.rules.node.isEndGame(minimax)) {
            this.victoryCoords = this.rules.node.getOwnValue(minimax).victory;
        }
        this.disconnecteds = this.getDisconnected();
    }
    private getDisconnected(): Coord[] {
        const oldPieces: Coord[] = this.rules.node.mother.gamePartSlice.pieces.listKeys();
        const newPieces: Coord[] = this.rules.node.gamePartSlice.pieces.listKeys();
        const disconnecteds: Coord[] =[];
        for (const oldPiece of oldPieces) {
            if (oldPiece.equals(this.rules.node.move.start.getOrNull()) === false &&
                newPieces.some((newCoord: Coord) => newCoord.equals(oldPiece.getNext(this.state.offset, 1))) === false)
            {
                disconnecteds.push(oldPiece.getNext(this.state.offset, 1));
            }
        }
        if (this.pieces.some((coord: Coord) => coord.equals(this.lastDrop)) === false &&
            newPieces.some((coord: Coord) => coord.equals(this.lastDrop)) === false)
        {
            disconnecteds.push(this.lastDrop); // Dummy captured his own piece
        }
        return disconnecteds;
    }
    public getEmptyNeighboors(): Coord[] {
        let legalLandings: Coord[] = SixRules.getLegalLandings(this.state);
        if (this.chosenLanding) {
            legalLandings = legalLandings.filter((c: Coord) => c.equals(this.chosenLanding) === false);
        }
        return legalLandings;
    }
    private getViewBox(): string {
        const abstractScale: Scale = this.getAbstractBoardUse(this.pieces, this.neighboors, this.disconnecteds);
        const abstractWidth: number = abstractScale.maxX - abstractScale.minX;
        const abstractHeight: number = abstractScale.maxY - abstractScale.minY;

        const verticalSize: number = this.CONCRETE_HEIGHT / (Math.sin(Math.PI/3) * abstractHeight);
        const horizontalSize: number = this.CONCRETE_WIDTH / ((1.5 * abstractWidth) + 0.5);
        const commonSize: number = Math.min(verticalSize, horizontalSize);

        this.setPieceSize(commonSize);
        const lefterPiece: Coord = this.hexaLayout.getCenter(abstractScale.lefterPiece);
        const left: number = lefterPiece.x - this.hexaLayout.size;
        const upperPiece: Coord = this.hexaLayout.getCenter(abstractScale.upperPiece);
        const up: number = upperPiece.y - this.hexaLayout.getYOffset();
        return (left - 10) + ' ' + (up - 10) + ' ' +
               (this.CONCRETE_WIDTH + 20) + ' ' +
               (this.CONCRETE_HEIGHT + 20);
    }
    public getAbstractBoardUse(pieces: Coord[], neighboors: Coord[], disconnecteds: Coord[]): Scale {
        const coords: Coord[] = pieces.concat(neighboors).concat(disconnecteds);
        let upperPiece: Coord;
        let lefterPiece: Coord;
        let maxX: number = Number.MIN_SAFE_INTEGER;
        let maxY: number = Number.MIN_SAFE_INTEGER;
        let minX: number = Number.MAX_SAFE_INTEGER;
        let minY: number = Number.MAX_SAFE_INTEGER;
        for (const coord of coords) {
            const coordY: number = (2 * coord.y) + coord.x; // en demi Y_OFFSETs
            const coordX: number = coord.x; // en nombre de colonnes, simplement
            if (coordX < minX) {
                minX = coordX;
                lefterPiece = coord;
            }
            if (coordY < minY) {
                minY = coordY;
                upperPiece = coord;
            }
            maxX = Math.max(maxX, coordX + 1);
            maxY = Math.max(maxY, coordY + 2);
        }
        return { minX, minY, maxX, maxY, upperPiece, lefterPiece };
    }
    public getPieceClass(coord: Coord): string {
        const player: Player = this.rules.node.gamePartSlice.getPieceAt(coord);
        return this.getPlayerClass(player);
    }
    public async onPieceClick(piece: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + piece.x + '_' + piece.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.state.turn < 40) {
            return this.cancelMove(SixFailure.NO_DEPLACEMENT_BEFORE_TURN_40);
        } else if (this.chosenLanding == null) {
            this.selectedPiece = piece;
            return MGPValidation.SUCCESS;
        } else {
            const cuttingMove: SixMove = SixMove.fromCut(this.selectedPiece, this.chosenLanding, piece);
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
                return this.cancelMove(SixFailure.CAN_NO_LONGER_DROP);
            } else {
                const deplacement: SixMove = SixMove.fromDeplacement(this.selectedPiece, neighboor);
                const legality: SixLegalityStatus = SixRules.isLegalPhaseTwoMove(deplacement, this.state);
                if (this.neededCutting(legality)) {
                    this.chosenLanding = neighboor;
                    this.moveVirtuallyPiece();
                    this.showCuttable();
                    return MGPValidation.SUCCESS;
                } else {
                    return this.chooseMove(deplacement, this.state, null, null);
                }
            }
        }
    }
    private neededCutting(legality: SixLegalityStatus): boolean {
        return legality.legal.isFailure() &&
               legality.legal.reason === SixFailure.MUST_CUT;
    }
    private moveVirtuallyPiece(): void {
        this.pieces = this.pieces.filter((c: Coord) => c.equals(this.selectedPiece) === false);
        this.neighboors = this.getEmptyNeighboors();
    }
    private showCuttable(): void {
        const deplacement: SixMove = SixMove.fromDeplacement(this.selectedPiece, this.chosenLanding);
        const piecesAfterDeplacement: MGPMap<Coord, Player> = SixGameState.deplacePiece(this.state, deplacement);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> =
            SixGameState.getGroups(piecesAfterDeplacement, deplacement.start.get());
        const biggerGroups: MGPSet<MGPSet<Coord>> = SixRules.getBiggerGroups(groupsAfterMove);
        this.cuttables = [];
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const subList: Coord[] = biggerGroups.get(i).getCopy();
            this.cuttables = this.cuttables.concat(subList);
        }
    }
    public getSelectedPieceClass(): string {
        if (this.chosenLanding) {
            return 'moved';
        } else {
            return 'selected';
        }
    }
}
