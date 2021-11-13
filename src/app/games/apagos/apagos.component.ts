import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ApagosCoord } from './ApagosCoord';
import { ApagosDummyMinimax } from './ApagosDummyMinimax';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosRules } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';
import { ApagosTutorial } from './ApagosTutorial';

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

    public selectedPiece: MGPOptional<PieceLocation> = MGPOptional.empty();

    public leftPiece: MGPOptional<PieceLocation> = MGPOptional.empty();

    public droppedPiece: MGPOptional<PieceLocation> = MGPOptional.empty();

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
        this.selectedPiece = MGPOptional.empty();
        this.showPossibleDrops();
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
        this.showPossibleDrops();
    }
    public hideLastMove(): void {
        this.movedSquare = [];
        this.droppedPiece = MGPOptional.empty();
        this.leftPiece = MGPOptional.empty();
        this.selectedPiece = MGPOptional.empty();
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
        this.droppedPiece = MGPOptional.of({
            square: higherIndex,
            piece: landingIndex,
        });
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
        this.leftPiece = MGPOptional.of({
            square: leftSquare,
            piece: leftPieceIndex,
        });

        const landingCoord: number = lastMove.landing.x;
        const landedSquare: ApagosSquare = this.board[landingCoord];
        const landedPieceIndex: number = this.getLowestPlayerPiece(landedSquare, previousPlayer);
        this.droppedPiece = MGPOptional.of({
            square: landingCoord,
            piece: landedPieceIndex,
        });
    }
    private showPossibleDrops(): void {
        this.displayableArrow = [];
        const state: ApagosState = this.rules.node.gameState;
        for (let x: number = 0; x < 4; x++) {
            if (state.board[x].isFull() === false) {
                if (state.remaining.get(Player.ZERO).get() > 0) {
                    this.displayableArrow.push({ x, player: Player.ZERO });
                }
                if (state.remaining.get(Player.ONE).get() > 0) {
                    this.displayableArrow.push({ x, player: Player.ONE });
                }
            }
        }
    }
    public getCircleCenter(x: number, i: number, square: ApagosSquare): Coord {
        const bx: number = (x * this.SPACE_SIZE) + (0.5 * this.SPACE_SIZE);
        const by: number = ((5 - x) * this.SPACE_SIZE * 0.25) + (0.5 * this.SPACE_SIZE);
        if (square.count(Player.NONE) === 1) {
            return new Coord(bx, by);
        }
        const nbCircle: number = square.count(Player.NONE);
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
    public getArrowTransform(x: number, player: Player): string {
        const yOffset: number = (3 - x) * this.SPACE_SIZE * 0.25;
        let xOffset: number = player === Player.ZERO ? 0 : (this.SPACE_SIZE * 0.5);
        xOffset += (x * this.SPACE_SIZE);
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
        if (this.selectedPiece.isPresent() && this.selectedPiece.get().square === x) {
            classes.push('selected');
        } else if (this.movedSquare.includes(x)) {
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
        if (this.selectedPiece.isPresent()) {
            const square: number = this.selectedPiece.get().square;
            move = ApagosMove.transfer(ApagosCoord.from(square), clicked).get();
        } else {
            move = ApagosMove.drop(clicked, player);
        }
        const state: ApagosState = this.rules.node.gameState;
        return this.chooseMove(move, state, null, null);
    }
    public getPieceClasses(x: number, i: number, square: ApagosSquare): string[] {
        const pieceLocation: PieceLocation = { square: x, piece: i };
        const classes: string[] = [];
        let zero: number = square.count(Player.ZERO);
        let one: number = square.count(Player.ONE);
        if (this.selectedPiece.equalsValue(pieceLocation)) {
            classes.push('selected');
        } else if (this.droppedPiece.equalsValue(pieceLocation)) {
            classes.push('last-move');
        } else if (this.leftPiece.isPresent() && this.leftPiece.get().square === x) {
            if (this.leftPiece.get().piece === i) {
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
        if (this.selectedPiece.isPresent() && this.selectedPiece.get().square === x) {
            // TODO FOR REVIEW: for "reset move without toasting error" what should we do in tests ?
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const currentPlayer: Player = this.rules.node.gameState.getCurrentPlayer();
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
            console.log('no fucking transfer possible');
            return this.cancelMove(ApagosFailure.NO_POSSIBLE_TRANSFER_REMAINS());
        }
        return MGPValidation.SUCCESS;
    }
    private showAndGetPossibleTranfers(): DropArrow[] {
        this.displayableArrow = [];
        let landingX: number = this.selectedPiece.get().square - 1;
        const currentPlayer: Player = this.rules.node.gameState.getCurrentPlayer();
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
}
