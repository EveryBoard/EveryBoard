import { Component } from '@angular/core';
import { ReversiConfig, ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiState } from './ReversiState';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Direction } from 'src/app/jscaip/Direction';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { MCTS } from 'src/app/jscaip/MCTS';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiMinimax } from './ReversiMinimax';

@Component({
    selector: 'app-reversi',
    templateUrl: './reversi.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ReversiComponent extends RectangularGameComponent<ReversiRules,
                                                               ReversiMove,
                                                               ReversiState,
                                                               PlayerOrNone,
                                                               ReversiConfig,
                                                               ReversiLegalityInformation>
{
    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public lastMove: Coord = new Coord(-2, -2);

    private capturedCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Reversi');
        this.availableAIs = [
            new ReversiMinimax(),
            new MCTS($localize`MCTS`, new ReversiMoveGenerator(), this.rules),
        ];
        this.encoder = ReversiMove.encoder;
        this.canPass = false;
        this.scores = MGPOptional.of([2, 2]);
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: ReversiMove = new ReversiMove(x, y);
        return await this.chooseMove(chosenMove);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ReversiState = this.getState();

        this.board = state.getCopiedBoard();
        this.capturedCoords = [];

        // Will be set to the real value in showLastMove if there is a last move
        this.lastMove = new Coord(-2, -2);

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = this.rules.playerCanOnlyPass(state);
    }

    public override async showLastMove(move: ReversiMove): Promise<void> {
        this.lastMove = move.coord;
        const player: Player = this.getState().getCurrentPlayer();
        const opponent: Player = this.getState().getCurrentOpponent();
        for (const dir of Direction.DIRECTIONS) {
            let captured: Coord = this.lastMove.getNext(dir, 1);
            while (this.getState().isOnBoard(captured) &&
                   this.getState().getPieceAt(captured) === opponent &&
                   this.getPreviousState().getPieceAt(captured) === player)
            {
                this.capturedCoords.push(captured);
                captured = captured.getNext(dir, 1);
            }
        }
    }

    public getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.capturedCoords.some((c: Coord) => c.equals(coord))) {
            return ['captured-fill'];
        } else if (coord.equals(this.lastMove)) {
            return ['moved-fill'];
        } else {
            return [];
        }
    }

    public getPieceClass(x: number, y: number): string {
        return this.getPlayerClass(this.board[y][x]);
    }

    public override async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'ReversiComponent: pass() can only be called if canPass is true');
        return this.onClick(ReversiMove.PASS.coord.x, ReversiMove.PASS.coord.y);
    }

}
