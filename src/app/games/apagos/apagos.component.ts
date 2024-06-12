import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosMoveGenerator } from './ApagosMoveGenerator';
import { ApagosRules } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';
import { ApagosFullBoardMinimax } from './ApagosFullBoardMinimax';
import { ApagosRightmostMinimax } from './ApagosRightmostMinimax';

interface PieceLocation {

    square: number,

    piece: number,
}

interface DropArrow {

    x: number,

    player: Player,
}

@Component({
    selector: 'app-apagos',
    templateUrl: './apagos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ApagosComponent extends GameComponent<ApagosRules, ApagosMove, ApagosState> {
    public PlayerOrNone: typeof PlayerOrNone = PlayerOrNone;

    public readonly BOARD_WIDTH: number = 4 * this.SPACE_SIZE;
    public readonly BOARD_HEIGHT: number = 4.5 * this.SPACE_SIZE;
    public board: readonly ApagosSquare[];

    public remainingZero: number;
    public remainingOne: number;

    public ARROW_COORD: string = ApagosComponent.getArrowCoord();

    public PIECES_PER_PLAYER: number = ApagosRules.PIECES_PER_PLAYER;

    public PIECE_RADIUS: number;

    public lastMoveSquares: number[];

    public lastMoveDrop: MGPOptional<PieceLocation> = MGPOptional.empty();

    public selectedPiece: MGPOptional<PieceLocation> = MGPOptional.empty();

    public leftPiece: MGPOptional<PieceLocation> = MGPOptional.empty();

    public displayableArrow: DropArrow[] = [];

    private static getArrowCoord(): string {
        // Coordinates calculated to match with a SPACE_SIZE = 100
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

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Apagos');
        this.availableAIs = [
            new ApagosRightmostMinimax(),
            new ApagosFullBoardMinimax(),
            new MCTS($localize`MCTS`, new ApagosMoveGenerator(), this.rules),
        ];
        this.encoder = ApagosMove.encoder;
        this.hasAsymmetricBoard = true;

        this.PIECE_RADIUS = (2 * this.SPACE_SIZE) / (this.PIECES_PER_PLAYER + 0.5);
    }

    public override cancelMoveAttempt(): void {
        this.selectedPiece = MGPOptional.empty();
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ApagosState = this.getState();
        this.board = state.board;
        this.remainingZero = state.remaining.get(Player.ZERO);
        this.remainingOne = state.remaining.get(Player.ONE);
        this.showPossibleDrops();
    }

    public override hideLastMove(): void {
        this.lastMoveSquares = [];
        this.lastMoveDrop = MGPOptional.empty();
        this.leftPiece = MGPOptional.empty();
    }

    public override async showLastMove(move: ApagosMove): Promise<void> {
        if (move.isDrop()) {
            this.showLastDrop(move);
        } else {
            this.showLastTransfer(move);
        }
    }

    public showLastDrop(lastMove: ApagosMove): void {
        const piece: Player = lastMove.piece.get();
        let higherIndex: number = lastMove.landing.x;
        this.lastMoveSquares = [higherIndex];
        if (lastMove.landing.x !== 3) {
            higherIndex += 1;
            this.lastMoveSquares.push(higherIndex);
        }
        const climbingSquare: ApagosSquare = this.board[higherIndex];
        const landingIndex: number = this.getLowestPlayerPiece(climbingSquare, piece);
        this.lastMoveDrop = MGPOptional.of({
            square: higherIndex,
            piece: landingIndex,
        });
    }

    private getLowestPlayerPiece(square: ApagosSquare, player: Player): number {
        const nbPiecePlayer: number = square.count(player);
        if (player === Player.ZERO) {
            return nbPiecePlayer - 1;
        } else {
            const totalPieces: number = square.count(PlayerOrNone.NONE);
            return totalPieces - nbPiecePlayer;
        }
    }

    public showLastTransfer(lastMove: ApagosMove): void {
        const previousState: ApagosState = this.getPreviousState();
        const previousPlayer: Player = previousState.getCurrentPlayer();
        const leftSquare: number = lastMove.starting.get().x;
        const previousSquare: ApagosSquare = previousState.board[leftSquare];
        const leftPieceIndex: number = this.getLowestPlayerPiece(previousSquare, previousPlayer);
        this.leftPiece = MGPOptional.of({
            square: leftSquare,
            piece: leftPieceIndex,
        });

        const landingCoord: number = lastMove.landing.x;
        const landedSquare: ApagosSquare = this.board[landingCoord];
        const landedPieceIndex: number = this.getLowestPlayerPiece(landedSquare, previousPlayer);
        this.lastMoveDrop = MGPOptional.of({
            square: landingCoord,
            piece: landedPieceIndex,
        });
    }

    private showPossibleDrops(): void {
        this.displayableArrow = [];
        const state: ApagosState = this.getState();
        for (let x: number = 0; x < 4; x++) {
            if (state.board[x].isFull() === false) {
                if (state.remaining.get(Player.ZERO) > 0) {
                    this.displayableArrow.push({ x, player: Player.ZERO });
                }
                if (state.remaining.get(Player.ONE) > 0) {
                    this.displayableArrow.push({ x, player: Player.ONE });
                }
            }
        }
    }

    public getCircleCenter(x: number, i: number, square: ApagosSquare): Coord {
        const bx: number = this.SPACE_SIZE / 2;
        const by: number = this.SPACE_SIZE / 2;
        if (square.count(PlayerOrNone.NONE) === 1) {
            return new Coord(bx, by);
        }
        const nbCircle: number = square.count(PlayerOrNone.NONE);
        const angle: number = (i * 2 * Math.PI / nbCircle) - (Math.PI / 2);
        const radius: number = this.SPACE_SIZE * 0.30;
        const deltaX: number = radius * Math.cos(angle);
        const deltaY: number = radius * Math.sin(angle);
        return new Coord(bx + deltaX, by + deltaY);
    }

    public canDisplayArrow(x: number, player: Player): boolean {
        return this.displayableArrow.some((a: DropArrow) => a.x === x && a.player.equals(player));
    }

    public getArrowClasses(x: number, player: Player): string[] {
        const classes: string[] = [this.getPlayerClass(player)];
        return classes;
    }

    public getBlockTransform(x: number): string {
        const yOffset: number = ((3 - x) * this.SPACE_SIZE) + (0.5 * this.SPACE_SIZE);
        const xOffset: number = x * this.SPACE_SIZE;
        return 'translate(' + xOffset + ', ' + yOffset + ')';
    }

    public getSquareClasses(x: number): string[] {
        const classes: string[] = ['base'];
        if (this.selectedPiece.isPresent() && this.selectedPiece.get().square === x) {
            classes.push('selected-stroke');
        } else if (this.lastMoveSquares.includes(x)) {
            classes.push('last-move-stroke');
        }
        return classes;
    }

    public async onArrowClick(x: number, player: Player): Promise<MGPValidation> {
        const playerString: string = (player === Player.ZERO) ? 'zero' : 'one';
        const clickValidity: MGPValidation = await this.canUserPlay('#dropArrow_' + playerString + '_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clicked: ApagosCoord = ApagosCoord.of(x);
        if (this.selectedPiece.isPresent()) {
            const square: number = this.selectedPiece.get().square;
            const move: ApagosMove = ApagosMove.transfer(ApagosCoord.of(square), clicked).get();
            return this.chooseMove(move);
        } else {
            const move: ApagosMove = ApagosMove.drop(clicked, player);
            return this.chooseMove(move);
        }
    }

    public getPieceClasses(x: number, i: number, square: ApagosSquare): string[] {
        const pieceLocation: PieceLocation = { square: x, piece: i };
        const classes: string[] = [];
        let zero: number = square.count(Player.ZERO);
        let one: number = square.count(Player.ONE);
        if (this.selectedPiece.equalsValue(pieceLocation)) {
            classes.push('selected-stroke');
        } else if (this.lastMoveDrop.equalsValue(pieceLocation)) {
            classes.push('last-move-stroke');
        } else if (this.leftPiece.isPresent() && this.leftPiece.get().square === x) {
            if (this.leftPiece.get().piece === i) {
                classes.push('captured-stroke');
                return classes;
            } else {
                const opponent: Player = this.getState().getCurrentOpponent();
                if (opponent === Player.ZERO) zero++;
                else one++;
            }
        }
        const neutral: number = square.count(PlayerOrNone.NONE) - (one + zero);
        const pieceColor: string = this.getPieceColor(i, zero, neutral);
        if (pieceColor !== '') {
            classes.push(pieceColor);
        }
        return classes;
    }

    private getPieceColor(i: number, zero: number, neutral: number): string {
        if (i < zero) {
            return 'player0-fill';
        } else if (i < (zero + neutral)) {
            return '';
        } else {
            return 'player1-fill';
        }

    }

    public async onSquareClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#square_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.selectedPiece.isPresent() && this.selectedPiece.get().square === x) {
            return this.cancelMove();
        }
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        const square: ApagosSquare = this.board[x];
        const nbPiecePresent: number = square.count(currentPlayer);
        if (nbPiecePresent <= 0) {
            return this.cancelMove(ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
        }
        this.selectedPiece = MGPOptional.of({
            square: x,
            piece: this.getLowestPlayerPiece(square, currentPlayer),
        });
        if (this.showAndGetPossibleTranfers().length === 0) {
            return this.cancelMove(ApagosFailure.NO_POSSIBLE_TRANSFER_REMAINS());
        }
        return MGPValidation.SUCCESS;
    }

    private showAndGetPossibleTranfers(): DropArrow[] {
        this.displayableArrow = [];
        let landingX: number = this.selectedPiece.get().square - 1;
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        while (0 <= landingX) {
            if (this.board[landingX].isFull() === false) {
                this.displayableArrow.push({
                    x: landingX,
                    player: currentPlayer,
                });
            }
            landingX--;
        }
        return this.displayableArrow;
    }

    public getRemainingPieceCx(x: number): number {
        return (x + 0.5) * this.PIECE_RADIUS * 1.5;
    }

}
