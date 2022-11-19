import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LascaControlMinimax } from './LascaControlMinimax';
import { LascaMove, LascaMoveFailure } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaPiece, LascaSpace, LascaState } from './LascaState';

class SpaceInfo {
    spaceClasses: string[];
    pieceInfos: LascaPieceInfo[];
}
class LascaPieceInfo {
    classes: string[];
    isOfficer: boolean;
}
@Component({
    selector: 'app-lasca', // Juneau why !
    templateUrl: './lasca.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LascaComponent extends RectangularGameComponent<LascaRules,
                                                                LascaMove,
                                                                LascaState,
                                                                LascaSpace>
{

    public adaptedBoard: SpaceInfo[][] = [];
    private lastMove: MGPOptional<LascaMove> = MGPOptional.empty();
    private validClicks: Coord[] = [];
    private validCaptures: LascaMove[] = [];
    public LascaSpace: typeof LascaSpace = LascaSpace;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.rules = new LascaRules(LascaState);
        this.availableMinimaxes = [
            new LascaControlMinimax(this.rules, 'Lasca Control Minimax'),
        ];
        this.encoder = LascaMove.encoder;
        // this.tutorial = new LascaTutorial().tutorial; TODOTODO
        this.canPass = false;
        this.updateBoard();
    }
    public backgroundColor(x: number, y: number): string {
        if ((x + y) % 2 === 0) {
            return 'darkgrey';
        } else {
            return 'lightgrey';
        }
    }
    public isPlayerZero(piece: LascaSpace): boolean {
        return piece.getCommander().player === Player.ZERO;
    }
    public piecePlayerClass(piece: LascaSpace): string {
        return this.getPlayerClass(piece.getCommander().player);
    }
    public updateBoard(): void {
        this.lastMove = this.rules.node.move;
        const state: LascaState = this.getState();
        this.board = state.getCopiedBoard();
        this.adaptedBoard = [];
        for (let y: number = 0; y < 7; y++) {
            const newRow: SpaceInfo[] = [];
            for (let x: number = 0; x < 7; x++) {
                const newSpace: SpaceInfo = this.getSpaceInfo(x, y);
                newRow.push(newSpace);
            }
            this.adaptedBoard.push(newRow);
        }
        this.validCaptures = LascaRules.getCaptures(this.getState());
    }
    private getSpaceInfo(x: number, y: number): SpaceInfo {
        const space: LascaSpace = this.board[y][x];
        const pieceInfos: LascaPieceInfo[] = [];
        let pieceIndex: number = space.getPileSize() - 1; // Start by the lower piece
        while (pieceIndex >= 0) {
            const piece: LascaPiece = space.get(pieceIndex);
            pieceInfos.push({
                classes: [this.getPlayerClass(piece.player)],
                isOfficer: piece.isOfficer,
            });
            pieceIndex--;
        }
        const spaceClasses: string[] = [];
        if (this.isCaptured(x, y)) {
            spaceClasses.push('captured-fill');
        } else if (this.wasSteppedOn(x, y)) {
            spaceClasses.push('moved-fill');
        }
        return {
            pieceInfos,
            spaceClasses,
        };
    }
    private isCaptured(x: number, y: number): boolean {
        if (this.lastMove.isAbsent()) {
            return false;
        }
        let moveToShow: LascaMove;

        if (this.validClicks.length > 1) {
            moveToShow = LascaMove.fromCapture(this.validClicks).get();
        } else {
            moveToShow = this.lastMove.get();
        }
        const jumpedOverCoord: MGPFallible<MGPSet<Coord>> = moveToShow.getSteppedOverCoords();
        if (jumpedOverCoord.isSuccess()) {
            return jumpedOverCoord.get().toList().some((coord: Coord) => coord.equals(new Coord(x, y)));
        } else {
            return false;
        }
    }
    private wasSteppedOn(x: number, y: number): boolean {
        if (this.lastMove.isPresent()) {
            const lastMove: LascaMove = this.lastMove.get();
            const steppedCoords: Coord[] = lastMove.getCoordsCopy();
            return steppedCoords.some((coord: Coord) => coord.equals(new Coord(x, y)));
        } else {
            return false;
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#coord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clickedCoord);
        const opponent: Player = this.getState().getCurrentOpponent();
        if (clickedSpace.isCommandedBy(opponent)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        if (this.validClicks.length === 0) {
            return this.trySelectingPiece(clickedCoord);
        } else {
            return this.moveClick(clickedCoord);
        }
    }
    public cancelMoveAttempt(): void {
        if (this.validClicks.length > 0) {
            const selectedCoord: Coord = this.validClicks[0];
            const x: number = selectedCoord.x;
            const y: number = selectedCoord.y;
            this.adaptedBoard[y][x] = this.getSpaceInfo(x, y);
            this.validClicks = [];
        }
    }
    public async moveClick(clicked: Coord): Promise<MGPValidation> {
        console.log('moveclick')
        if (clicked.equals(this.validClicks[0])) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        const player: Player = this.getState().getCurrentPlayer();
        if (clickedSpace.isCommandedBy(player)) {
            this.cancelMoveAttempt();
            return this.trySelectingPiece(clicked);
        }
        if (clickedSpace.isEmpty() === false) {
            return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        if (this.validClicks.length === 1) {
            // Doing the second click, either a step or a first capture
            const delta: Coord = this.validClicks[0].getVectorToward(clicked);
            if (Math.abs(delta.x) === 1 && Math.abs(delta.y) === 1) {
                // It is indeed a step
                const step: LascaMove = LascaMove.fromStep(this.validClicks[0], clicked).get();
                return this.chooseMove(step, this.getState());
            }
        }
        // Continuing to capture
        return this.capture(clicked);
    }
    private async capture(clicked: Coord): Promise<MGPValidation> {
        const numberOfClicks: number = this.validClicks.length;
        const lastCoord: Coord = this.validClicks[numberOfClicks - 1];
        const delta: Coord = lastCoord.getVectorToward(clicked);
        if (Math.abs(delta.x) === 2 && Math.abs(delta.y) === 2) {
            this.validClicks.push(clicked);
            const currentMove: LascaMove = LascaMove.fromCapture(this.validClicks).get();
            if (this.validCaptures.some((capture: LascaMove) => capture.equals(currentMove))) {
                return this.chooseMove(currentMove, this.getState());
            } else {
                return MGPValidation.SUCCESS;
            }
        } else {
            return this.cancelMove(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
        }
    }
    private async trySelectingPiece(clicked: Coord): Promise<MGPValidation> {
        console.log('select piece')
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        if (clickedSpace.isEmpty()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            this.selectPiece(clicked);
            return MGPValidation.SUCCESS;
        }
    }
    private selectPiece(coord: Coord): void {
        this.validClicks = [coord];
        for (const pieceInfo of this.adaptedBoard[coord.y][coord.x].pieceInfos) {
            pieceInfo.classes.push('selected-stroke');
        }
    }
}
