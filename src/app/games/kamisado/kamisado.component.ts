import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoBoard } from 'src/app/games/kamisado/KamisadoBoard';
import { KamisadoMove, KamisadoPieceMove } from 'src/app/games/kamisado/KamisadoMove';
import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoRules } from 'src/app/games/kamisado/KamisadoRules';
import { KamisadoFailure } from 'src/app/games/kamisado/KamisadoFailure';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/assert';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MCTS } from 'src/app/jscaip/MCTS';
import { Minimax } from 'src/app/jscaip/Minimax';
import { KamisadoHeuristic } from './KamisadoHeuristic';
import { KamisadoMoveGenerator } from './KamisadoMoveGenerator';

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
    public UNOCCUPIED: KamisadoPiece = KamisadoPiece.EMPTY;
    public lastMove: MGPOptional<KamisadoMove> = MGPOptional.empty();
    public lastPieceMove: MGPOptional<KamisadoPieceMove> = MGPOptional.empty();
    public chosen: MGPOptional<Coord> = MGPOptional.empty();
    public chosenAutomatically: boolean = false;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Kamisado');
        this.availableAIs = [
            new Minimax($localize`Minimax`, KamisadoRules.get(), new KamisadoHeuristic(), new KamisadoMoveGenerator()),
            new MCTS($localize`MCTS`, new KamisadoMoveGenerator(), this.rules),
        ];
        this.encoder = KamisadoMove.encoder;
        this.hasAsymmetricBoard = true;
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
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: KamisadoState = this.getState();
        this.board = state.getCopiedBoard();
        this.lastPieceMove = MGPOptional.empty();

        this.canPass = KamisadoRules.mustPass(state);
        const isFinished: boolean = this.rules.getGameStatus(this.node) !== GameStatus.ONGOING;
        if (this.canPass || state.coordToPlay.isAbsent() || isFinished) {
            this.chosenAutomatically = false;
            this.chosen = MGPOptional.empty();
        } else {
            this.chosenAutomatically = true;
            this.chosen = state.coordToPlay;
        }
    }
    public override async showLastMove(move: KamisadoMove): Promise<void> {
        if (KamisadoMove.isPiece(move)) {
            this.lastPieceMove = MGPOptional.of(move);
        }
    }
    public override async pass(): Promise<MGPValidation> {
        assert(this.canPass, 'KamisadoComponent: pass() must be called only if canPass is true');
        return this.chooseMove(KamisadoMove.PASS);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.canPass) {
            return this.cancelMove(RulesFailure.MUST_PASS());
        }
        if (this.chosen.isAbsent()) {
            return this.choosePiece(x, y);
        } else if (this.chosenAutomatically === false && this.chosen.equalsValue(clickedCoord)) {
            // user selected the already-selected piece
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else {
            const piece: KamisadoPiece = this.getState().getPieceAtXY(x, y);
            const player: Player = this.getState().getCurrentPlayer();
            if (piece.belongsTo(player)) {
                // Player clicked on another of its pieces, select it if he can
                if (this.chosenAutomatically) {
                    return this.cancelMove(KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
                } else {
                    this.chosen = MGPOptional.of(clickedCoord);
                    return MGPValidation.SUCCESS;
                }
            } else {
                return await this.chooseDestination(x, y);
            }
        }
    }
    public async choosePiece(x: number, y: number): Promise<MGPValidation> {
        const piece: KamisadoPiece = this.getState().getPieceAtXY(x, y);
        const opponent: Player = this.getState().getCurrentOpponent();
        if (piece.belongsTo(opponent)) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        this.chosen = MGPOptional.of(new Coord(x, y));
        return MGPValidation.SUCCESS;
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen.get();
        const chosenDestination: Coord = new Coord(x, y);
        const move: KamisadoMove = KamisadoMove.of(chosenPiece, chosenDestination);
        return this.chooseMove(move);
    }
    public override cancelMoveAttempt(): void {
        if (this.chosenAutomatically === false) {
            this.chosen = MGPOptional.empty();
        }
    }
}
