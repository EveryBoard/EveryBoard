import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoBoard } from 'src/app/games/kamisado/KamisadoBoard';
import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoRules } from 'src/app/games/kamisado/KamisadoRules';
import { KamisadoMinimax } from 'src/app/games/kamisado/KamisadoMinimax';
import { KamisadoFailure } from 'src/app/games/kamisado/KamisadoFailure';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { KamisadoTutorial } from './KamisadoTutorial';

@Component({
    selector: 'app-kamisado',
    templateUrl: './kamisado.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class KamisadoComponent extends RectangularGameComponent<KamisadoRules,
                                                                KamisadoMove,
                                                                KamisadoState,
                                                                KamisadoPiece>
{
    public UNOCCUPIED: KamisadoPiece = KamisadoPiece.NONE;
    public lastMove: KamisadoMove = null;
    public chosen: Coord = new Coord(-1, -1);
    public chosenAutomatically: boolean = false;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new KamisadoRules(KamisadoState);
        this.availableMinimaxes = [
            new KamisadoMinimax(this.rules, 'KamisadoMinimax'),
        ];
        this.encoder = KamisadoMove.encoder;
        this.tutorial = new KamisadoTutorial().tutorial;
        this.canPass = false;
        this.updateBoard();
    }
    public backgroundColor(x: number, y: number): string {
        return KamisadoBoard.getColorAt(x, y).rgb;
    }
    public isPlayerZero(piece: KamisadoPiece): boolean {
        return piece.player === Player.ZERO;
    }
    public pieceColor(piece: KamisadoPiece): string {
        return piece.color.rgb;
    }
    public piecePlayerClass(piece: KamisadoPiece): string {
        return this.getPlayerClass(piece.player);
    }
    public updateBoard(): void {
        const state: KamisadoState = this.rules.node.gameState;
        this.board = state.getCopiedBoard();
        this.lastMove = this.rules.node.move;

        this.canPass = KamisadoRules.mustPass(state);
        if (this.canPass || state.coordToPlay.isAbsent()) {
            this.chosenAutomatically = false;
            this.chosen = new Coord(-1, -1);
        } else {
            this.chosenAutomatically = true;
            this.chosen = state.coordToPlay.get();
        }
    }
    public async pass(): Promise<MGPValidation> {
        if (this.canPass) {
            return this.chooseMove(KamisadoMove.PASS, this.rules.node.gameState, null, null);
        } else {
            return this.cancelMove(RulesFailure.CANNOT_PASS());
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.canPass) {
            return this.cancelMove(RulesFailure.MUST_PASS());
        }
        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else if (this.chosenAutomatically === false && x === this.chosen.x && y === this.chosen.y) {
            // user selected the already-selected piece
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            const piece: KamisadoPiece = this.rules.node.gameState.getPieceAtXY(x, y);
            const player: Player = this.rules.node.gameState.getCurrentPlayer();
            if (piece.belongsTo(player)) {
                // Player clicked on another of its pieces, select it if he can
                if (this.chosenAutomatically) {
                    return this.cancelMove(KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
                } else {
                    this.chosen = new Coord(x, y);
                    return MGPValidation.SUCCESS;
                }
            } else {
                return await this.chooseDestination(x, y);
            }
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        const piece: KamisadoPiece = this.rules.node.gameState.getPieceAtXY(x, y);
        const opponent: Player = this.rules.node.gameState.getCurrentOpponent();
        if (piece.belongsTo(opponent)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        this.chosen = new Coord(x, y);
        return MGPValidation.SUCCESS;
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        const move: KamisadoMove = KamisadoMove.of(chosenPiece, chosenDestination);
        return this.chooseMove(move, this.rules.node.gameState, null, null);
    }
    public cancelMoveAttempt(): void {
        if (!this.chosenAutomatically) {
            this.chosen = new Coord(-1, -1);
        }
    }
}
