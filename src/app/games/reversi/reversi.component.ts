import { Component } from '@angular/core';

import { ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiMinimax } from './ReversiMinimax';
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
import { assert } from 'src/app/utils/assert';

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

    private captureds: Coord[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([2, 2]);
        this.rules = new ReversiRules(ReversiState);
        this.availableMinimaxes = [
            new ReversiMinimax(this.rules, 'ReversiMinimax'),
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
        return await this.chooseMove(chosenMove, this.rules.node.gameState, this.scores.get());
    }
    public updateBoard(): void {
        const state: ReversiState = this.rules.node.gameState;

        this.board = state.getCopiedBoard();
        this.captureds = [];

        if (this.rules.node.move.isPresent()) {
            this.showPreviousMove();
        } else {
            this.lastMove = new Coord(-2, -2);
        }

        this.scores = MGPOptional.of(state.countScore());
        this.canPass = ReversiRules.playerCanOnlyPass(state);
    }
    private showPreviousMove() {
        this.lastMove = this.rules.node.move.get().coord;
        const player: Player = this.rules.node.gameState.getCurrentPlayer();
        const opponent: Player = this.rules.node.gameState.getCurrentOpponent();
        for (const dir of Direction.DIRECTIONS) {
            let captured: Coord = this.lastMove.getNext(dir, 1);
            while (captured.isInRange(ReversiState.BOARD_WIDTH, ReversiState.BOARD_HEIGHT) &&
                   this.rules.node.gameState.getPieceAt(captured) === opponent &&
                   this.rules.node.mother.get().gameState.getPieceAt(captured) === player)
            {
                this.captureds.push(captured);
                captured = captured.getNext(dir, 1);
            }
        }
    }
    public getRectClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
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
    public async pass(): Promise<MGPValidation> {
        assert(this.canPass, 'ReversiComponent: pass() can only be called if canPass is true');
        return this.onClick(ReversiMove.PASS.coord.x, ReversiMove.PASS.coord.y);
    }
}
