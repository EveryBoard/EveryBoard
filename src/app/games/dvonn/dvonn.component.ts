import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';
import { DvonnRules } from 'src/app/games/dvonn/DvonnRules';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { PointyHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { HexagonalGameComponent }
    from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { DvonnScoreHeuristic } from './DvonnScoreHeuristic';
import { DvonnOrderedMoveGenerator } from './DvonnOrderedMoveGenerator';
import { DvonnMaxStacksHeuristic } from './DvonnMaxStacksHeuristic';
import { DvonnMoveGenerator } from './DvonnMoveGenerator';
import { Utils } from 'src/app/utils/utils';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class DvonnComponent extends HexagonalGameComponent<DvonnRules, DvonnMove, DvonnState, DvonnPieceStack> {

    public lastMove: MGPOptional<DvonnMove> = MGPOptional.empty();
    public chosen: MGPOptional<Coord> = MGPOptional.empty();
    public disconnecteds: { coord: Coord, spaceContent: DvonnPieceStack }[] = [];
    public state: DvonnState;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Dvonn');
        this.availableAIs = [
            new Minimax($localize`Stacks`, this.rules, new DvonnMaxStacksHeuristic(), new DvonnOrderedMoveGenerator()),
            new Minimax($localize`Score`, this.rules, new DvonnScoreHeuristic(), new DvonnOrderedMoveGenerator()),
            new MCTS($localize`MCTS`, new DvonnMoveGenerator(), this.rules),
        ];
        this.encoder = DvonnMove.encoder;
        this.scores = MGPOptional.of(DvonnRules.getScores(this.getState()));

        this.SPACE_SIZE = 30;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.50,
                                         new Coord(-this.SPACE_SIZE, this.SPACE_SIZE * 2),
                                         PointyHexaOrientation.INSTANCE);
        this.state = this.getState();
        this.hexaBoard = this.getState().board;
    }

    public override hideLastMove(): void {
        this.lastMove = MGPOptional.empty();
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.state = this.getState();
        this.disconnecteds = [];
        this.canPass = this.rules.canOnlyPass(this.state);
        this.scores = MGPOptional.of(DvonnRules.getScores(this.state));
    }

    public override async showLastMove(move: DvonnMove): Promise<void> {
        this.lastMove = MGPOptional.of(move);
        const previousState: DvonnState = this.getPreviousState();
        const state: DvonnState = this.getState();
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.isOnBoard(coord) === true &&
                    coord.equals(this.lastMove.get().getStart()) === false) {
                    const stack: DvonnPieceStack = state.getPieceAt(coord);
                    const previousStack: DvonnPieceStack = previousState.getPieceAt(coord);
                    if (stack.isEmpty() && previousStack.hasPieces()) {
                        const coord: Coord = new Coord(x, y);
                        const disconnected: { coord: Coord, spaceContent: DvonnPieceStack } =
                            { coord, spaceContent: previousStack };
                        this.disconnecteds.push(disconnected);
                    }
                }
            }
        }
    }

    public override cancelMoveAttempt(): void {
        this.chosen = MGPOptional.empty();
    }

    public override async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'DvonnComponent: pass() can only be called if canPass is true');
        return await this.chooseMove(DvonnMove.PASS);
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen.isAbsent()) {
            return this.choosePiece(x, y);
        } else if (this.chosen.equalsValue(new Coord(x, y))) {
            // Deselects the piece
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            return await this.chooseDestination(x, y);
        }
    }

    public async choosePiece(x: number, y: number): Promise<MGPValidation> {
        const coord: Coord = new Coord(x, y);
        const legal: MGPValidation = this.rules.isMovablePiece(this.getState(), coord);
        if (legal.isSuccess()) {
            this.chosen = MGPOptional.of(coord);
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(legal.getReason());
        }
    }

    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const state: DvonnState = this.getState();
        const chosenPiece: Coord = this.chosen.get();
        const chosenDestination: Coord = new Coord(x, y);
        const move: MGPFallible<DvonnMove> = DvonnMove.from(chosenPiece, chosenDestination);
        if (move.isFailure()) {
            if (this.rules.isMovablePiece(state, chosenDestination).isSuccess()) {
                // Change piece selection
                return this.choosePiece(x, y);
            } else {
                return this.cancelMove(move.getReason());
            }
        } else {
            // The only way to know whether we can select the other piece is to check the move legality
            const legality: MGPValidation = this.rules.isLegal(move.get(), state, this.config);
            if (legality.isFailure() && this.rules.isMovablePiece(state, chosenDestination).isSuccess()) {
                return this.choosePiece(x, y);
            } else {
                return this.chooseMove(move.get());
            }
        }
    }

    public getPieceClasses(stack: DvonnPieceStack): string[] {
        if (stack.containsSource() && stack.getSize() === 1) {
            return ['nonplayer-fill', 'dashed-stroke'];
        }
        const playerColor: string = this.getPlayerClass(stack.getOwner());
        if (stack.containsSource()) {
            return [playerColor, 'nonplayer-stroke', 'dashed-stroke'];
        }
        return [playerColor];
    }

}
