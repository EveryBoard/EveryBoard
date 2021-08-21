import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnGameState } from 'src/app/games/dvonn/DvonnGameState';
import { DvonnRules } from 'src/app/games/dvonn/DvonnRules';
import { DvonnMinimax } from 'src/app/games/dvonn/DvonnMinimax';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { HexagonalGameComponent }
    from 'src/app/components/game-components/abstract-game-component/HexagonalGameComponent';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MaxStacksDvonnMinimax } from './MaxStacksDvonnMinimax';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { dvonnTutorial } from './DvonnTutorial';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})

export class DvonnComponent extends HexagonalGameComponent<DvonnMove, DvonnGameState> {

    private static CASE_SIZE: number = 30;
    public rules: DvonnRules = new DvonnRules(DvonnGameState);

    public scores: number[] = [0, 0];
    public lastMove: DvonnMove = null;
    public chosen: Coord = null;
    public canPass: boolean = false;
    public disconnecteds: { x: number, y: number, caseContent: DvonnPieceStack }[] = [];
    public hexaBoard: DvonnBoard;

    public hexaLayout: HexaLayout =
        new HexaLayout(DvonnComponent.CASE_SIZE * 1.50,
                       new Coord(-DvonnComponent.CASE_SIZE, DvonnComponent.CASE_SIZE * 2),
                       PointyHexaOrientation.INSTANCE);
    public encoder: MoveEncoder<DvonnMove> = DvonnMove.encoder;

    public tutorial: TutorialStep[] = dvonnTutorial;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.availableMinimaxes = [
            new DvonnMinimax(this.rules, 'DvonnMinimax'),
            new MaxStacksDvonnMinimax(this.rules, 'DvonnMinimaxMaximizeStacks'),
        ];
        this.showScore = true;
        this.scores = DvonnRules.getScores(this.rules.node.gamePartSlice);
        this.hexaBoard = this.rules.node.gamePartSlice.hexaBoard;
    }
    public updateBoard(): void {
        const slice: DvonnGameState = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.hexaBoard = slice.hexaBoard;
        this.lastMove = this.rules.node.move;
        this.disconnecteds = [];
        if (this.lastMove) {
            this.calculateDisconnecteds();
        }
        this.canPass = this.rules.canOnlyPass(slice);
        this.scores = DvonnRules.getScores(slice);
    }
    private calculateDisconnecteds(): void {
        const previousSlice: DvonnGameState = this.rules.node.mother.gamePartSlice;
        const slice: DvonnGameState = this.rules.node.gamePartSlice;
        for (let y: number = 0; y < slice.hexaBoard.height; y++) {
            for (let x: number = 0; x < slice.hexaBoard.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (slice.hexaBoard.isOnBoard(coord) === true &&
                    coord.equals(this.lastMove.coord) === false) {
                    const stack: DvonnPieceStack = slice.hexaBoard.getAt(coord);
                    const previousStack: DvonnPieceStack = previousSlice.hexaBoard.getAt(coord);
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
            return await this.chooseMove(DvonnMove.PASS, this.rules.node.gamePartSlice, null, null);
        } else {
            return MGPValidation.failure(RulesFailure.CANNOT_PASS);
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
        const legal: MGPValidation = this.rules.isMovablePiece(this.rules.node.gamePartSlice, coord);
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
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
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
    public getPieceSize(): number {
        return DvonnComponent.CASE_SIZE;
    }
}
