import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../jscaip/Coord';
import { TablutMove } from 'src/app/games/tablut/TablutMove';
import { TablutState } from './TablutState';
import { TablutRules } from './TablutRules';
import { TablutMinimax } from './TablutMinimax';
import { TablutCase } from 'src/app/games/tablut/TablutCase';
import { display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { TablutRulesConfig } from 'src/app/games/tablut/TablutRulesConfig';
import { Table } from 'src/app/utils/ArrayUtils';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { TablutPieceAndInfluenceMinimax } from './TablutPieceAndInfluenceMinimax';
import { TablutLegalityStatus } from './TablutLegalityStatus';
import { TablutPieceAndControlMinimax } from './TablutPieceAndControlMinimax';
import { TablutEscapeThenPieceAndControlMinimax } from './TablutEscapeThenPieceThenControl';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TablutTutorial } from './TablutTutorial';

@Component({
    selector: 'app-tablut',
    templateUrl: './tablut.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TablutComponent extends RectangularGameComponent<TablutRules,
                                                              TablutMove,
                                                              TablutState,
                                                              TablutCase,
                                                              TablutLegalityStatus>
{
    public static VERBOSE: boolean = false;

    public NONE: TablutCase = TablutCase.UNOCCUPIED;

    public throneCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 8),
        new Coord(4, 4),
        new Coord(8, 0),
        new Coord(8, 8),
    ];
    private captureds: Coord[] = [];

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: TablutMove;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new TablutRules(TablutState);
        this.availableMinimaxes = [
            new TablutMinimax(this.rules, 'DummyBot'),
            new TablutPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TablutPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TablutEscapeThenPieceAndControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
        this.encoder = TablutMove.encoder;
        this.tutorial = new TablutTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        display(TablutComponent.VERBOSE, 'tablutComponent.updateBoard');
        this.lastMove = this.rules.node.move;
        this.board = this.rules.node.gameState.getCopiedBoard();

        this.captureds = [];
        if (this.lastMove) {
            this.showPreviousMove();
        }
    }
    private showPreviousMove(): void {
        const previousBoard: Table<TablutCase> = this.rules.node.mother.gameState.board;
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        for (const orthogonal of Orthogonal.ORTHOGONALS) {
            const captured: Coord = this.lastMove.end.getNext(orthogonal, 1);
            if (captured.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
                const previously: RelativePlayer = TablutRules.getRelativeOwner(OPPONENT, captured, previousBoard);
                const wasOpponent: boolean = previously === RelativePlayer.OPPONENT;
                const currently: TablutCase = this.rules.node.gameState.getPieceAt(captured);
                const isEmpty: boolean = currently === TablutCase.UNOCCUPIED;
                if (wasOpponent && isEmpty) {
                    this.captureds.push(captured);
                }
            }
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.onClick(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        let move: TablutMove;
        try {
            move = new TablutMove(chosenPiece, chosenDestination);
        } catch (error) {
            return this.cancelMove(error.message);
        }
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gameState, null, null);
    }
    public choosePiece(x: number, y: number): MGPValidation {
        display(TablutComponent.VERBOSE, 'TablutComponent.choosePiece');

        if (this.board[y][x] === TablutCase.UNOCCUPIED) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }

        this.chosen = new Coord(x, y);
        display(TablutComponent.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
        return MGPValidation.SUCCESS;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        // TODO: see that verification is done and refactor this shit
        const player: Player = this.rules.node.gameState.getCurrentPlayer();
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, coord, this.board) === RelativePlayer.PLAYER;
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
    }
    public isThrone(x: number, y: number): boolean {
        return TablutRules.isThrone(new Coord(x, y));
    }
    public getPieceClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        const owner: Player = TablutRules.getAbsoluteOwner(coord, this.board);
        classes.push(this.getPlayerClass(owner));

        if (this.chosen.equals(coord)) {
            classes.push('selected');
        }

        return classes;
    }
    public getRectClasses(x: number, y: number): string[] {
        const classes: string[] = [];

        const coord: Coord = new Coord(x, y);
        const lastStart: Coord = this.lastMove ? this.lastMove.coord : null;
        const lastEnd: Coord = this.lastMove ? this.lastMove.end : null;
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
            classes.push('captured');
        } else if (coord.equals(lastStart) || coord.equals(lastEnd)) {
            classes.push('moved');
        }

        return classes;
    }
    public getClickables(): Coord[] {
        const coords: Coord[] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                if (this.isClickable(x, y)) {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }
    private isClickable(x: number, y: number): boolean {
        // Show if the piece can be clicked
        return this.pieceBelongToCurrentPlayer(x, y);
    }
    public isInvader(x: number, y: number): boolean {
        return this.board[y][x] === TablutCase.INVADERS;
    }
    public isKing(x: number, y: number): boolean {
        return this.board[y][x].isKing();
    }
    public getKingPolyline(x: number, y: number): string {
        const ax: number = 85 + 100*x; const ay: number = 85 + 100*y;
        const bx: number = 30 + 100*x; const by: number = 30 + 100*y;
        const cx: number = 50 + 100*x; const cy: number = 10 + 100*y;
        const dx: number = 70 + 100*x; const dy: number = 30 + 100*y;
        const ex: number = 15 + 100*x; const ey: number = 85 + 100*y;
        return ax + ' ' + ay + ' ' +
               bx + ' ' + by + ' ' +
               cx + ' ' + cy + ' ' +
               dx + ' ' + dy + ' ' +
               ex + ' ' + ey;
    }
}
