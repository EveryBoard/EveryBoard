import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';
import { DvonnRules } from 'src/app/games/dvonn/DvonnRules';
import { DvonnMinimax } from 'src/app/games/dvonn/DvonnMinimax';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { HexagonalGameComponent }
    from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { MaxStacksDvonnMinimax } from './MaxStacksDvonnMinimax';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { DvonnTutorial } from './DvonnTutorial';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class DvonnComponent extends HexagonalGameComponent<DvonnRules, DvonnMove, DvonnState, DvonnPieceStack> {

    public scores: number[] = [0, 0];
    public lastMove: DvonnMove = null;
    public chosen: Coord = null;
    public disconnecteds: { x: number, y: number, caseContent: DvonnPieceStack }[] = [];
    public state: DvonnState;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new DvonnRules(DvonnState);
        this.availableMinimaxes = [
            new DvonnMinimax(this.rules, 'DvonnMinimax'),
            new MaxStacksDvonnMinimax(this.rules, 'DvonnMinimaxMaximizeStacks'),
        ];
        this.encoder = DvonnMove.encoder;
        this.tutorial = new DvonnTutorial().tutorial;
        this.SPACE_SIZE = 30;
        this.showScore = true;
        this.canPass = false;
        this.scores = DvonnRules.getScores(this.rules.node.gameState);
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.50,
                                         new Coord(-this.SPACE_SIZE, this.SPACE_SIZE * 2),
                                         PointyHexaOrientation.INSTANCE);
        this.state = this.rules.node.gameState;
        this.hexaBoard = this.rules.node.gameState.board;
    }
    public hideLastMove(): void {
        this.lastMove = null;
    }
    public updateBoard(): void {
        this.cancelMoveAttempt();
        this.state = this.rules.node.gameState;
        this.lastMove = this.rules.node.move;
        this.disconnecteds = [];
        if (this.lastMove) {
            this.calculateDisconnecteds();
        } else {
            this.hideLastMove();
        }
        this.canPass = this.rules.canOnlyPass(this.state);
        this.scores = DvonnRules.getScores(this.state);
    }
    private calculateDisconnecteds(): void {
        const previousState: DvonnState = this.rules.node.mother.gameState;
        const state: DvonnState = this.rules.node.gameState;
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.isOnBoard(coord) === true &&
                    coord.equals(this.lastMove.coord) === false) {
                    const stack: DvonnPieceStack = state.getPieceAt(coord);
                    const previousStack: DvonnPieceStack = previousState.getPieceAt(coord);
                    if (stack.isEmpty() && !previousStack.isEmpty()) {
                        const disconnected: { x: number, y: number, caseContent: DvonnPieceStack } =
                            { x, y, caseContent: previousStack };
                        this.disconnecteds.push(disconnected);
                    }
                }
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.chosen = null;
    }
    public async pass(): Promise<MGPValidation> {
        if (this.canPass) {
            return await this.chooseMove(DvonnMove.PASS, this.rules.node.gameState, null, null);
        } else {
            return MGPValidation.failure(RulesFailure.CANNOT_PASS());
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen === null) {
            return this.choosePiece(x, y);
        } else if (this.chosen.equals(new Coord(x, y))) {
            // Deselects the piece
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            return await this.chooseDestination(x, y);
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        const coord: Coord = new Coord(x, y);
        const legal: MGPValidation = this.rules.isMovablePiece(this.rules.node.gameState, coord);
        if (legal.isSuccess()) {
            this.chosen = coord;
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(legal.getReason());
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        // By construction, only valid moves can be created
        const move: DvonnMove = DvonnMove.of(chosenPiece, chosenDestination);
        return this.chooseMove(move, this.rules.node.gameState, null, null);
    }
    public getPieceClasses(stack: DvonnPieceStack): string[] {
        if (stack.containsSource() && stack.getSize() === 1) {
            return ['other-piece', 'dashed-stroke'];
        }
        const playerColor: string = this.getPlayerClass(stack.getOwner());
        if (stack.containsSource()) {
            return [playerColor, 'other-piece-stroke', 'dashed-stroke'];
        }
        return [playerColor];
    }
}
