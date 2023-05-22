import { Component } from '@angular/core';
import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { SixLegalityInformation, SixRules } from 'src/app/games/six/SixRules';
import { SixBoardValue, SixMinimax } from 'src/app/games/six/SixMinimax';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexagonalGameComponent }
    from '../../components/game-components/game-component/HexagonalGameComponent';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { SixTutorial } from './SixTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ViewBox } from 'src/app/components/game-components/GameComponentUtils';

@Component({
    selector: 'app-six',
    templateUrl: './six.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class SixComponent
    extends HexagonalGameComponent<SixRules, SixMove, SixState, Player, SixLegalityInformation, SixBoardValue>
{
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

    private nextClickShouldSelectGroup: boolean = false;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = SixRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new SixMinimax(this.rules, 'SixMinimax'),
        ];
        this.encoder = SixMove.encoder;
        this.tutorial = new SixTutorial().tutorial;
        this.SPACE_SIZE = 30;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.50,
                                         new Coord(this.SPACE_SIZE * 2, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.updateBoard();
    }
    public override cancelMoveAttempt(): void {
        this.selectedPiece = MGPOptional.empty();
        this.chosenLanding = MGPOptional.empty();
        this.cuttableGroups = [];
        this.nextClickShouldSelectGroup = false;
        this.updateBoard(); // Need to refresh the board in case we showed virtual moves for cuts
    }
    public updateBoard(): void {
        this.state = this.node.gameState;
        const lastMove: MGPOptional<SixMove> = this.node.move;
        if (lastMove.isAbsent()) {
            // For tutorial
            this.hideLastMove();
        }
        this.pieces = this.state.getPieceCoords();
        this.neighbors = this.getEmptyNeighbors();
        this.viewBox = this.getViewBox();
    }
    public hideLastMove(): void {
        this.leftCoord = MGPOptional.empty();
        this.lastDrop = MGPOptional.empty();
        this.victoryCoords = [];
        this.disconnecteds = [];
    }
    private getViewBox(): string {
        const coords: Coord[] = this.pieces.concat(this.disconnecteds).concat(this.neighbors);
        return ViewBox.fromHexa(coords, this.hexaLayout, this.STROKE_WIDTH).toSVGString();
    }
    public override showLastMove(move: SixMove): void {
        this.lastDrop = MGPOptional.of(move.landing);
        if (move.isDrop() === false) {
            this.leftCoord = MGPOptional.of(move.start.get());
        } else {
            this.leftCoord = MGPOptional.empty();
        }
        const state: SixState = this.getState();
        if (this.rules.getGameStatus(this.node).isEndGame) {
            this.victoryCoords = this.rules.getShapeVictory(move, state);
        }
        this.disconnecteds = this.getDisconnected();
    }
    private getDisconnected(): Coord[] {
        const oldPieces: Coord[] = this.getPreviousState().getPieceCoords();
        const newPieces: Coord[] = this.getState().getPieceCoords();
        const disconnecteds: Coord[] =[];
        for (const oldPiece of oldPieces) {
            const start: MGPOptional<Coord> = this.node.move.get().start;
            if (start.equalsValue(oldPiece) === false &&
                newPieces.some((newCoord: Coord) => newCoord.equals(oldPiece)) === false)
            {
                disconnecteds.push(oldPiece);
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
    public getPieceClass(coord: Coord): string {
        const player: PlayerOrNone = this.getState().getPieceAt(coord);
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
            } else if (this.selectedPiece.equalsValue(piece)) {
                this.selectedPiece = MGPOptional.empty();
            } else {
                this.selectedPiece = MGPOptional.of(piece);
            }
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
        const stateAfterMove: SixState = this.state.movePiece(movement);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterMove.getGroups();
        const biggerGroups: MGPSet<MGPSet<Coord>> = SixRules.getBiggerGroups(groupsAfterMove);
        this.cuttableGroups = [];
        for (const cuttableGroup of biggerGroups) {
            this.cuttableGroups.push(cuttableGroup.toList());
        }
    }
    public getSelectedPieceClass(): string {
        if (this.chosenLanding.isPresent()) {
            return 'moved-fill';
        } else {
            return 'selected-stroke';
        }
    }
}
