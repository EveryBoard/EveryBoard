import { Component } from '@angular/core';
import { ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiState } from './ReversiState';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Direction } from 'src/app/jscaip/Direction';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { ReversiTutorial } from './ReversiTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { MCTS } from 'src/app/jscaip/MCTS';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiHeuristic } from './ReversiHeuristic';
import { ReversiOrderedMoveGenerator } from './ReversiOrderedMoveGenerator';

@Component({
    selector: 'app-reversi',
    templateUrl: './reversi.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ReversiComponent extends RectangularGameComponent<ReversiRules,
                                                               ReversiMove,
                                                               ReversiState,
                                                               PlayerOrNone,
                                                               ReversiLegalityInformation>
{
    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public lastMove: Coord = new Coord(-2, -2);

    private capturedCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([2, 2]);
        this.rules = ReversiRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax('Minimax', this.rules, new ReversiHeuristic(), new ReversiOrderedMoveGenerator()),
            new MCTS('MCTS', new ReversiMoveGenerator(), this.rules),
        ];
        this.encoder = ReversiMove.encoder;
        this.tutorial = new ReversiTutorial().tutorial;
        this.canPass = false;
        this.updateBoard();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: ReversiMove = new ReversiMove(x, y);
        return await this.chooseMove(chosenMove);
    }
    public updateBoard(): void {
        const state: ReversiState = this.getState();

        this.board = state.getCopiedBoard();
        this.capturedCoords = [];

        // Will be set to the real value in showLastMove if there is a last move
        this.lastMove = new Coord(-2, -2);

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = ReversiRules.playerCanOnlyPass(state);
    }
    public override showLastMove(move: ReversiMove): void {
        this.lastMove = move.coord;
        const player: Player = this.getState().getCurrentPlayer();
        const opponent: Player = this.getState().getCurrentOpponent();
        for (const dir of Direction.DIRECTIONS) {
            let captured: Coord = this.lastMove.getNext(dir, 1);
            while (ReversiState.isOnBoard(captured) &&
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
