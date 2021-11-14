import { Component } from '@angular/core';
import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { SixNode, SixRules } from 'src/app/games/six/SixRules';
import { SixMinimax } from 'src/app/games/six/SixMinimax';
import { SixLegalityStatus } from 'src/app/games/six/SixLegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexagonalGameComponent }
    from '../../components/game-components/game-component/HexagonalGameComponent';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { SixTutorial } from './SixTutorial';

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
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class SixComponent extends HexagonalGameComponent<SixRules, SixMove, SixState, SixLegalityStatus> {

    public readonly CONCRETE_WIDTH: number = 1000;
    public readonly CONCRETE_HEIGHT: number = 800;
    public state: SixState;

    public pieces: Coord[];
    public disconnecteds: Coord[] = [];
    public cuttableGroups: Coord[][] = [];
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

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new SixRules(SixState);
        this.availableMinimaxes = [
            new SixMinimax(this.rules, 'SixMinimax'),
        ];
        this.encoder = SixMove.encoder;
        this.tutorial = new SixTutorial().tutorial;
        this.SPACE_SIZE = 30;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.50,
                                         new Coord(this.SPACE_SIZE * 2, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.setPieceSize(25);
        this.updateBoard();
    }
    private setPieceSize(rayon: number): void {
        this.SPACE_SIZE = 2 * rayon;
        this.hexaLayout = new HexaLayout(rayon,
                                         new Coord(0, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.Y_OFFSET = this.hexaLayout.getYOffset();
    }
    public cancelMoveAttempt(): void {
        this.selectedPiece = null;
        this.chosenLanding = null;
        this.cuttableGroups = [];
    }
    public updateBoard(): void {
        const node: SixNode = this.rules.node;
        this.state = node.gameState;
        const lastMove: SixMove = this.rules.node.move;
        if (lastMove) {
            this.showLastMove();
        } else {
            // For tutorial
            this.leftCoord = null;
            this.lastDrop = null;
            this.victoryCoords = [];
            this.disconnecteds = [];
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
        const state: SixState = this.rules.node.gameState;
        if (this.rules.getGameStatus(this.rules.node).isEndGame) {
            this.victoryCoords = this.rules.getShapeVictory(lastMove, state);
        }
        this.disconnecteds = this.getDisconnected();
    }
    private getDisconnected(): Coord[] {
        const oldPieces: Coord[] = this.rules.node.mother.gameState.pieces.listKeys();
        const newPieces: Coord[] = this.rules.node.gameState.pieces.listKeys();
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
        const lefterPiece: Coord = this.hexaLayout.getCenterAt(abstractScale.lefterPiece);
        const left: number = lefterPiece.x - this.hexaLayout.size;
        const upperPiece: Coord = this.hexaLayout.getCenterAt(abstractScale.upperPiece);
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
        const player: Player = this.rules.node.gameState.getPieceAt(coord);
        return this.getPlayerClass(player);
    }
    public async onPieceClick(piece: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + piece.x + '_' + piece.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.state.turn < 40) {
            return this.cancelMove(SixFailure.NO_DEPLACEMENT_BEFORE_TURN_40());
        } else if (this.chosenLanding == null) {
            if (this.state.getPieceAt(piece) === this.state.getCurrentOpponent()) {
                return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
            }
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
                return this.cancelMove(SixFailure.CAN_NO_LONGER_DROP());
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
               legality.legal.reason === SixFailure.MUST_CUT();
    }
    private moveVirtuallyPiece(): void {
        this.pieces = this.pieces.filter((c: Coord) => c.equals(this.selectedPiece) === false);
        this.neighboors = this.getEmptyNeighboors();
    }
    private showCuttable(): void {
        const deplacement: SixMove = SixMove.fromDeplacement(this.selectedPiece, this.chosenLanding);
        const piecesAfterDeplacement: MGPMap<Coord, Player> = SixState.deplacePiece(this.state, deplacement);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> =
            SixState.getGroups(piecesAfterDeplacement, deplacement.start.get());
        const biggerGroups: MGPSet<MGPSet<Coord>> = SixRules.getBiggerGroups(groupsAfterMove);
        this.cuttableGroups = [];
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const cuttableGroup: Coord[] = biggerGroups.get(i).getCopy();
            this.cuttableGroups.push(cuttableGroup);
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
