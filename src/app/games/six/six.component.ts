import { Component } from '@angular/core';
import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { SixLegalityInformation, SixNode, SixRules } from 'src/app/games/six/SixRules';
import { SixMinimax } from 'src/app/games/six/SixMinimax';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexagonalGameComponent }
    from '../../components/game-components/game-component/HexagonalGameComponent';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { SixTutorial } from './SixTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';

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
export class SixComponent
    extends HexagonalGameComponent<SixRules, SixMove, SixState, Player, SixLegalityInformation> {

    public readonly CONCRETE_WIDTH: number = 1000;
    public readonly CONCRETE_HEIGHT: number = 800;
    public state: SixState;

    public pieces: Coord[];
    public disconnecteds: Coord[] = [];
    public cuttableGroups: Coord[][] = [];
    public victoryCoords: Coord[];
    public neighbors: Coord[];
    public leftCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastDrop: MGPOptional<Coord> = MGPOptional.empty();

    public selectedPiece: MGPOptional<Coord> = MGPOptional.empty();
    public chosenLanding: MGPOptional<Coord> = MGPOptional.empty();

    public viewBox: string;
    public pointScale: Scale;
    public coordScale: Scale;
    public Y_OFFSET: number;

    private nextClickShouldSelectGroup: boolean = false;

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
        this.selectedPiece = MGPOptional.empty();
        this.chosenLanding = MGPOptional.empty();
        this.cuttableGroups = [];
        this.nextClickShouldSelectGroup = false;
        this.updateBoard(); // Need to refresh the board in case we showed virtual moves for cuts
    }
    public updateBoard(): void {
        const node: SixNode = this.rules.node;
        this.state = node.gameState;
        const lastMove: MGPOptional<SixMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove();
        } else {
            // For tutorial
            this.leftCoord = MGPOptional.empty();
            this.lastDrop = MGPOptional.empty();
            this.victoryCoords = [];
            this.disconnecteds = [];
        }
        this.pieces = this.state.pieces.listKeys();
        this.neighbors = this.getEmptyNeighbors();
        this.viewBox = this.getViewBox();
    }
    public showLastMove(): void {
        const lastMove: SixMove = this.rules.node.move.get();
        this.lastDrop = MGPOptional.of(lastMove.landing.getNext(this.state.offset, 1));
        if (lastMove.isDrop() === false) {
            this.leftCoord = MGPOptional.of(lastMove.start.get().getNext(this.state.offset, 1));
        } else {
            this.leftCoord = MGPOptional.empty();
        }
        const state: SixState = this.rules.node.gameState;
        if (this.rules.getGameStatus(this.rules.node).isEndGame) {
            this.victoryCoords = this.rules.getShapeVictory(lastMove, state);
        }
        this.disconnecteds = this.getDisconnected();
    }
    private getDisconnected(): Coord[] {
        const oldPieces: Coord[] = this.rules.node.mother.get().gameState.pieces.listKeys();
        const newPieces: Coord[] = this.rules.node.gameState.pieces.listKeys();
        const disconnecteds: Coord[] =[];
        for (const oldPiece of oldPieces) {
            const start: MGPOptional<Coord> = this.rules.node.move.get().start;
            if (start.equalsValue(oldPiece) === false &&
                newPieces.some((newCoord: Coord) => newCoord.equals(oldPiece.getNext(this.state.offset, 1))) === false)
            {
                disconnecteds.push(oldPiece.getNext(this.state.offset, 1));
            }
        }
        const lastDrop: Coord = this.lastDrop.get();
        if (this.pieces.some((coord: Coord) => coord.equals(lastDrop)) === false &&
            newPieces.some((coord: Coord) => coord.equals(lastDrop)) === false)
        {
            disconnecteds.push(lastDrop); // Dummy captured his own piece
        }
        return disconnecteds;
    }
    public getEmptyNeighbors(): Coord[] {
        let legalLandings: Coord[] = SixRules.getLegalLandings(this.state);
        if (this.chosenLanding.isPresent()) {
            const chosenLanding: Coord = this.chosenLanding.get();
            legalLandings = legalLandings.filter((c: Coord) => c.equals(chosenLanding) === false);
        }
        return legalLandings;
    }
    private getViewBox(): string {
        const abstractScale: Scale = this.getAbstractBoardUse(this.pieces, this.neighbors, this.disconnecteds);
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
    public getAbstractBoardUse(pieces: Coord[], neighbors: Coord[], disconnecteds: Coord[]): Scale {
        const coords: Coord[] = pieces.concat(neighbors).concat(disconnecteds);
        let upperPiece: MGPOptional<Coord> = MGPOptional.empty();
        let lefterPiece: MGPOptional<Coord> = MGPOptional.empty();
        let maxX: number = Number.MIN_SAFE_INTEGER;
        let maxY: number = Number.MIN_SAFE_INTEGER;
        let minX: number = Number.MAX_SAFE_INTEGER;
        let minY: number = Number.MAX_SAFE_INTEGER;
        for (const coord of coords) {
            const coordY: number = (2 * coord.y) + coord.x; // in half Y_OFFSETs
            const coordX: number = coord.x; // in number of columns
            if (coordX < minX) {
                minX = coordX;
                lefterPiece = MGPOptional.of(coord);
            }
            if (coordY < minY) {
                minY = coordY;
                upperPiece = MGPOptional.of(coord);
            }
            maxX = Math.max(maxX, coordX + 1);
            maxY = Math.max(maxY, coordY + 2);
        }
        return {
            minX, minY, maxX, maxY,
            upperPiece: upperPiece.get(),
            lefterPiece: lefterPiece.get(),
        };
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
            return this.cancelMove(SixFailure.NO_MOVEMENT_BEFORE_TURN_40());
        } else if (this.chosenLanding.isAbsent()) {
            if (this.state.getPieceAt(piece) === this.state.getCurrentOpponent()) {
                return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
            }
            this.selectedPiece = MGPOptional.of(piece);
            return MGPValidation.SUCCESS;
        } else {
            const cuttingMove: SixMove = SixMove.fromCut(this.selectedPiece.get(),
                                                         this.chosenLanding.get(),
                                                         piece);
            return this.chooseMove(cuttingMove, this.state);
        }
    }
    public async onNeighborClick(neighbor: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#neighbor_' + neighbor.x + '_' + neighbor.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.nextClickShouldSelectGroup) {
            return this.cancelMove(SixFailure.MUST_CUT());
        }
        if (this.state.turn < 40) {
            return this.chooseMove(SixMove.fromDrop(neighbor), this.state);
        } else {
            if (this.selectedPiece.isAbsent()) {
                return this.cancelMove(SixFailure.CAN_NO_LONGER_DROP());
            } else {
                const movement: SixMove = SixMove.fromMovement(this.selectedPiece.get(), neighbor);
                const legality: MGPFallible<SixLegalityInformation> =
                    SixRules.isLegalPhaseTwoMove(movement, this.state);
                if (this.neededCutting(legality)) {
                    this.chosenLanding = MGPOptional.of(neighbor);
                    this.moveVirtuallyPiece();
                    this.showCuttable();
                    this.nextClickShouldSelectGroup = true;
                    return MGPValidation.SUCCESS;
                } else {
                    return this.chooseMove(movement, this.state);
                }
            }
        }
    }
    private neededCutting(legality: MGPFallible<SixLegalityInformation>): boolean {
        return legality.isFailure() && legality.getReason() === SixFailure.MUST_CUT();
    }
    private moveVirtuallyPiece(): void {
        const selectedPiece: Coord = this.selectedPiece.get();
        this.pieces = this.pieces.filter((c: Coord) => c.equals(selectedPiece) === false);
        this.neighbors = this.getEmptyNeighbors();
    }
    private showCuttable(): void {
        const movement: SixMove = SixMove.fromMovement(this.selectedPiece.get(), this.chosenLanding.get());
        const piecesAfterDeplacement: ReversibleMap<Coord, Player> = SixState.deplacePiece(this.state, movement);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> =
            SixState.getGroups(piecesAfterDeplacement, movement.start.get());
        const biggerGroups: MGPSet<MGPSet<Coord>> = SixRules.getBiggerGroups(groupsAfterMove);
        this.cuttableGroups = [];
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const cuttableGroup: Coord[] = biggerGroups.get(i).getCopy();
            this.cuttableGroups.push(cuttableGroup);
        }
    }
    public getSelectedPieceClass(): string {
        if (this.chosenLanding.isPresent()) {
            return 'moved';
        } else {
            return 'selected';
        }
    }
}
