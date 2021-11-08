import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ApagosCoord } from './ApagosCoord';
import { ApagosDummyMinimax } from './ApagosDummyMinimax';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosRules } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';
import { ApagosTutorial } from './ApagosTutorial';

@Component({
    selector: 'app-apagos',
    templateUrl: './apagos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ApagosComponent extends GameComponent<ApagosRules,
                                                   ApagosMove,
                                                   ApagosState>
{
    public Player: typeof Player = Player;

    public board: readonly ApagosSquare[];

    public remainingZero: number;
    public remainingOne: number;

    public ARROW_COORD: string = ApagosComponent.getArrowCoord();

    public PIECES_PER_PLAYER: number = ApagosState.PIECES_PER_PLAYER;

    public PIECE_RADIUS: number;

    public movedSquare: number[];

    public selectedSquare: { square: number, piece: number } = { square: null, piece: null };

    public leftPiece: { square: number, piece: number } = { square: null, piece: null };

    public droppedPiece: { square: number, piece: number } = { square: null, piece: null };

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new ApagosRules(ApagosState);
        this.availableMinimaxes = [
            new ApagosDummyMinimax(this.rules, 'ApagosDummyMinimax'),
        ];
        this.encoder = ApagosMove.encoder;
        this.tutorial = new ApagosTutorial().tutorial;
        this.PIECE_RADIUS = 200 / (this.PIECES_PER_PLAYER + 1);
        this.updateBoard();
    }
    public cancelMoveAttempt(): void {
        this.selectedSquare = {
            square: null,
            piece: null,
        };
    }
    public updateBoard(): void {
        const state: ApagosState = this.rules.node.gameState;
        this.board = state.board;
        this.remainingZero = state.remaining.get(Player.ZERO).get();
        this.remainingOne = state.remaining.get(Player.ONE).get();

        this.hideLastMove();
        if (this.rules.node.move != null) {
            this.showLastMove();
        }
    }
    public hideLastMove(): void {
        this.movedSquare = [];
        this.droppedPiece = { square: null, piece: null };
        this.leftPiece = { square: null, piece: null };
    }
    public showLastMove(): void {
        const lastMove: ApagosMove = this.rules.node.move;
        if (lastMove.isDrop()) {
            this.showLastDrop(lastMove);
        } else {
            this.showLastTransfer(lastMove);
        }
    }
    public showLastDrop(lastMove: ApagosMove): void {
        const piece: Player = lastMove.piece.get();
        let higherIndex: number = lastMove.landing.x;
        this.movedSquare = [higherIndex];
        if (lastMove.landing.x !== 3) {
            higherIndex += 1;
            this.movedSquare.push(higherIndex);
        }
        const climbingSquare: ApagosSquare = this.board[higherIndex];
        const landingIndex: number = this.getLowestPlayerPiece(climbingSquare, piece);
        this.droppedPiece = {
            square: higherIndex,
            piece: landingIndex,
        };
    }
    private getLowestPlayerPiece(square: ApagosSquare, player: Player): number {
        const nbPiecePlayer: number = square.count(player);
        if (player === Player.ZERO) {
            return nbPiecePlayer - 1;
        } else {
            const totalPieces: number = square.count(Player.NONE);
            return totalPieces - nbPiecePlayer;
        }
    }
    public showLastTransfer(lastMove: ApagosMove): void {
        const previousState: ApagosState = this.rules.node.mother.gameState;
        const previousPlayer: Player = previousState.getCurrentPlayer();
        const leftSquare: number = lastMove.starting.get().x;
        const previousSquare: ApagosSquare = previousState.board[leftSquare];
        const leftPieceIndex: number = this.getLowestPlayerPiece(previousSquare, previousPlayer);
        this.leftPiece = {
            square: leftSquare,
            piece: leftPieceIndex,
        };

        const landingCoord: number = lastMove.landing.x;
        const landedSquare: ApagosSquare = this.board[landingCoord];
        const landedPieceIndex: number = this.getLowestPlayerPiece(landedSquare, previousPlayer);
        this.droppedPiece = {
            square: landingCoord,
            piece: landedPieceIndex,
        };
    }
    public getCircleCenter(x: number, i: number, square: ApagosSquare): Coord {
        const bx: number = (x * this.SQUARE_SIZE) + (0.5 * this.SQUARE_SIZE);
        const by: number = ((5 - x) * this.SQUARE_SIZE * 0.25) + (0.5 * this.SQUARE_SIZE);
        if (square.count(Player.NONE) === 1) {
            return new Coord(bx, by);
        }
        const nbCircle: number = square.count(Player.NONE);
        const angle: number = (i * 2 * Math.PI / nbCircle) - (Math.PI / 2);
        const radius: number = this.SQUARE_SIZE * 0.30;
        const deltaX: number = radius * Math.cos(angle);
        const deltaY: number = radius * Math.sin(angle);
        return new Coord(bx + deltaX, by + deltaY);
    }
    public canDisplayArrow(x: number, player: Player): boolean {
        const clicked: ApagosCoord = ApagosCoord.from(x);
        let move: ApagosMove;
        if (this.selectedSquare.square == null) {
            move = ApagosMove.drop(clicked, player);
        } else {
            const fallibleMove: MGPFallible<ApagosMove> =
                ApagosMove.transfer(ApagosCoord.from(this.selectedSquare.square), clicked);
            if (fallibleMove.isFailure()) {
                return false;
            }
            if (player === this.rules.node.gameState.getCurrentOpponent()) {
                return false;
            }
            move = fallibleMove.get();
        }
        const state: ApagosState = this.rules.node.gameState;
        const isLegal: LegalityStatus = this.rules.isLegal(move, state);
        return isLegal.legal.isSuccess();
    }
    private static getArrowCoord(): string {
        // Coordinates calculated to match with a SQUARE_SIZE = 100
        const upLeft: string = 12.5 + ',' + 0;
        const upRight: string = 37.5 + ',' + 0;
        const middleMiddleRight: string = 37.5 + ',' + 25;
        const middleExtremeRight: string = 50 + ',' + 25;
        const lowCenter: string = 25 + ',' + 50;
        const middleExtremeLeft: string = 0 + ',' + 25;
        const middleMiddleLeft: string = 12.5 + ',' + 25;
        return upLeft + ' ' + upRight + ' ' + middleMiddleRight + ' ' + middleExtremeRight + ' ' +
               lowCenter + ' ' + middleExtremeLeft + ' ' + middleMiddleLeft;
    }
    public getArrowClasses(x: number, player: Player): string[] {
        const classes: string[] = [this.getPlayerClass(player)];
        return classes;
    }
    public getArrowTransform(x: number, player: Player): string {
        const yOffset: number = (3 - x) * this.SQUARE_SIZE * 0.25;
        let xOffset: number = player === Player.ZERO ? 0 : (this.SQUARE_SIZE * 0.5);
        xOffset += (x * this.SQUARE_SIZE);
        return 'translate(' + xOffset + ', ' + yOffset + ')';
    }
    public range(n: number): number[] {
        const range: number[] = [];
        for (let i: number = 0; i < n; i++) {
            range.push(i);
        }
        return range;
    }
    public getSquareClasses(x: number): string[] {
        const classes: string[] = ['base'];
        if (this.selectedSquare.square === x) {
            classes.push('selected');
        } else
        if (this.movedSquare.includes(x)) {
            classes.push('last-move');
        }
        return classes;
    }
    public async onArrowClick(x: number, player: Player): Promise<MGPValidation> {
        const playerString: string = (player === Player.ZERO) ? 'zero' : 'one';
        const clickValidity: MGPValidation = this.canUserPlay('#dropArrow_' + playerString + '_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clicked: ApagosCoord = ApagosCoord.from(x);
        let move: ApagosMove;
        if (this.selectedSquare.square == null) {
            move = ApagosMove.drop(clicked, player);
        } else {
            move = ApagosMove.transfer(ApagosCoord.from(this.selectedSquare.square), clicked).get();
        }
        const state: ApagosState = this.rules.node.gameState;
        return this.chooseMove(move, state, null, null);
    }
    public getPieceClasses(x: number, i: number, square: ApagosSquare): string[] {
        const classes: string[] = [];
        let zero: number = square.count(Player.ZERO);
        let one: number = square.count(Player.ONE);
        if (this.selectedSquare.square === x && this.selectedSquare.piece === i) {
            classes.push('selected');
        } else if (this.droppedPiece.square === x && this.droppedPiece.piece === i) {
            classes.push('last-move');
        } else if (this.leftPiece.square === x) {
            if (this.leftPiece.piece === i) {
                classes.push('captured-stroke');
                return classes;
            } else {
                const opponent: Player = this.rules.node.gameState.getCurrentOpponent();
                if (opponent === Player.ZERO) zero++;
                else one++;
            }
        }
        const neutral: number = square.count(Player.NONE) - (one + zero);
        const pieceColor: string | null = this.getPieceColor(i, zero, neutral);
        if (pieceColor != null) {
            classes.push(pieceColor);
        }
        return classes;
    }
    private getPieceColor(i: number, zero: number, neutral: number): string {
        if (i < zero) {
            return 'player0';
        } else if (i >= (zero + neutral)) {
            return 'player1';
        }

    }
    public async onSquareClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#square_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.selectedSquare.square == null) {
            const currentPlayer: Player = this.rules.node.gameState.getCurrentPlayer();
            const square: ApagosSquare = this.board[x];
            const nbPiecePresent: number = square.count(currentPlayer);
            if (nbPiecePresent > 0) {
                this.selectedSquare = {
                    square: x,
                    piece: this.getLowestPlayerPiece(square, currentPlayer),
                };
                return MGPValidation.SUCCESS;
            } else {
                return this.cancelMove(ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
            }
        }
        return this.cancelMove(ApagosFailure.MUST_END_MOVE_BY_DROP());
    }
}
