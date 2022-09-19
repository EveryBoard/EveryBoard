import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { SiamState } from 'src/app/games/siam/SiamState';
import { SiamLegalityInformation, SiamRules } from 'src/app/games/siam/SiamRules';
import { SiamMinimax } from 'src/app/games/siam/SiamMinimax';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { SiamTutorial } from './SiamTutorial';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';
import { assert } from 'src/app/utils/assert';

type IndicatorArrow = {
    source: MGPOptional<{ coord: Coord, piece: SiamPiece }>,
    target: Coord,
    direction: Orthogonal,
}

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class SiamComponent extends RectangularGameComponent<SiamRules,
                                                            SiamMove,
                                                            SiamState,
                                                            SiamPiece,
                                                            SiamLegalityInformation>
{
    public static VERBOSE: boolean = true;

    public lastMove: MGPOptional<SiamMove> = MGPOptional.empty();
    public movedPieces: Coord[] = [];

    private insertingPiece: boolean = false;
    public selectedPiece: MGPOptional<Coord> = MGPOptional.empty();
    public selectedLanding: MGPOptional<Coord> = MGPOptional.empty();
    public orientationArrows: Orthogonal[] = [];
    public clickableCoords: MGPSet<Coord> = new MGPSet();
    public indicatorArrows: IndicatorArrow[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = SiamRules.get();
        this.availableMinimaxes = [
            new SiamMinimax(this.rules, 'SiamMinimax'),
        ];
        this.encoder = SiamMove.encoder;
        this.tutorial = new SiamTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        display(SiamComponent.VERBOSE, 'updateBoard');
        const state: SiamState = this.getState();
        this.board = state.board;
        this.lastMove = this.rules.node.move;
        if (this.lastMove.isPresent()) {
            const previousGameState: SiamState = this.rules.node.mother.get().gameState;
            this.movedPieces = this.rules.isLegal(this.lastMove.get(), previousGameState).get().moved;
        } else {
            this.movedPieces = [];
        }
    }
    public cancelMoveAttempt(): void {
        this.insertingPiece = false;
        this.selectedPiece = MGPOptional.empty();
        this.selectedLanding = MGPOptional.empty();
        this.orientationArrows = [];
        this.clickableCoords = new MGPSet();
        this.indicatorArrows = [];
    }
    public async selectPieceForInsertion(player: Player, pieceIndex: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#piece_' + player.value + '_' + pieceIndex);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (player !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.cancelMoveAttempt();
        for (const move of SiamRules.get().getInsertions(this.getState())) {
            const target: Coord = move.coord.getNext(move.direction.get());
            // For every pushing insertion, we draw an arrow in case it will push a piece
            if (this.board[target.y][target.x] !== SiamPiece.EMPTY) {
                const arrow: IndicatorArrow = {
                    source: MGPOptional.empty(),
                    target,
                    direction: move.direction.get(),
                };
                this.indicatorArrows.push(arrow);
            }
            this.clickableCoords.add(target);
        }
        this.insertingPiece = true;
        return MGPValidation.SUCCESS;
    }
    public async selectOrientation(orientation: Orthogonal): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#orientation_' + orientation.toString());
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        // The player has clicked on an orientation arrow
        // A landing coordinate is already selected in selectedLanding
        // We can simply perform the move, but first we need to construct the correct move.
        // To do so, we pick the a valid move that matches our selected landing and orientation.
        let moves: SiamMove[];
        if (this.insertingPiece) {
            const landing: Coord = this.selectedLanding.get();
            moves = SiamRules.get().getInsertionsAt(this.getState(), landing.x, landing.y);
        } else {
            const piece: SiamPiece = this.getState().getPieceAt(this.selectedPiece.get());
            moves = SiamRules.get().getMovesBetween(this.getState(),
                                                    piece,
                                                    this.selectedPiece.get(),
                                                    this.selectedLanding.get());
        }
        for (const move of moves) {
            if (move.landingOrientation === orientation) {
                this.cancelMoveAttempt();
                return this.chooseMove(move, this.getState());
            }
        }
        return this.cancelMove('Impossible?!');
    }
    public async clickSquare(x: number, y: number): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.clickSquare(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#square_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.insertingPiece) {
            return this.insertPiece(clickedCoord);
        } else {
            // Clicking a square to select a piece or end a non-insertion move
            if (this.selectedLanding.isPresent()) {
                // Player clicked somewhere on the board instead of an orientation arrow, cancel the move
                this.cancelMoveAttempt();
                return MGPValidation.SUCCESS;
            } else if (this.selectedPiece.isPresent()) {
                // Select the landing
                this.selectedLanding = MGPOptional.of(clickedCoord);
                const moves: SiamMove[] =
                    SiamRules.get().getMovesBetween(this.getState(),
                                                    this.getState().getPieceAt(this.selectedPiece.get()),
                                                    this.selectedPiece.get(),
                                                    clickedCoord);
                if (moves.length === 0) {
                    return this.changeMoveClick(clickedCoord);
                }
                return this.performMoveOrShowOrientationArrows(moves);
            } else if (this.getState().isOnBoard(clickedCoord)) {
                const clickedPiece: SiamPiece = this.board[y][x];
                if (clickedPiece.getOwner() !== this.getCurrentPlayer()) {
                    return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
                } else {
                    // Select the piece
                    return this.selectPiece(clickedCoord, clickedPiece);
                }
            } else {
                // Click outside of board, but not for removing a piece, so we do nothing
                // This should never happen in practice
                return MGPValidation.SUCCESS;
            }
        }
    }
    private async insertPiece(clickedCoord: Coord): Promise<MGPValidation> {
        if (this.selectedLanding.isPresent()) {
            // The landing is already selected, we cancel the move to avoid any confusion
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        // Inserting a new piece, the player just clicked on the landing
        this.selectedLanding = MGPOptional.of(clickedCoord);
        const insertions: SiamMove[] =
            SiamRules.get().getInsertionsAt(this.getState(), clickedCoord.x, clickedCoord.y);
        if (insertions.length === 0) {
            return this.changeMoveClick(clickedCoord);
        }
        return this.performMoveOrShowOrientationArrows(insertions);
    }
    private async changeMoveClick(clickedCoord: Coord): Promise<MGPValidation> {
        // The player clicked somewhere where there are no possible move, cancel the move
        this.cancelMoveAttempt();
        if (this.getState().getPieceAt(clickedCoord) === SiamPiece.EMPTY) {
            // The click was made on an empty square, likely to just cancel the move
            return MGPValidation.SUCCESS;
        } else {
            // The click was made on another piece, likely to select it
            return this.clickSquare(clickedCoord.x, clickedCoord.y);
        }
    }
    private async performMoveOrShowOrientationArrows(availableMoves: SiamMove[]): Promise<MGPValidation> {
        assert(availableMoves.length > 0, 'SiamComponent.performMoveOrShowOrientationArrows expects at least one move');
        if (availableMoves.length === 1) {
            // There's only one possible move, so perform it
            this.cancelMove();
            return this.chooseMove(availableMoves[0], this.getState());
        } else {
            // Since there's more than a single move, the player will have to select the orientation
            this.clickableCoords = new MGPSet();
            this.indicatorArrows = [];
            this.orientationArrows = availableMoves.map((move: SiamMove) => move.landingOrientation);
            return MGPValidation.SUCCESS;
        }
    }
    private selectPiece(clickedCoord: Coord, clickedPiece: SiamPiece): MGPValidation {
        this.cancelMoveAttempt();
        const state: SiamState = this.getState();
        this.selectedPiece = MGPOptional.of(clickedCoord);
        const moves: SiamMove[] =
            SiamRules.get().getMovesFrom(state, clickedPiece, clickedCoord.x, clickedCoord.y);
        for (const move of moves) {
            if (move.direction.isPresent()) {
                const target: Coord = move.coord.getNext(move.direction.get());
                this.clickableCoords.add(target);
                if (state.isOnBoard(target) && state.getPieceAt(target) !== SiamPiece.EMPTY) {
                    const arrow: IndicatorArrow = {
                        source: MGPOptional.of({
                            coord: clickedCoord,
                            piece: clickedPiece,
                        }),
                        target,
                        direction: move.direction.get(),
                    };
                    this.indicatorArrows.push(arrow);
                }
            } else {
                this.clickableCoords.add(move.coord);
            }
        }
        return MGPValidation.SUCCESS;
    }
    public isMountain(piece: SiamPiece): boolean {
        return piece === SiamPiece.MOUNTAIN;
    }
    public getArrowTransform(x: number, y: number, direction: Orthogonal): string {
        const orientation: number = direction.toInt() - 2;
        const rotation: string = `rotate(${orientation*90} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        const translation: string = 'translate(' + x * this.SPACE_SIZE + ', ' + y * this.SPACE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getPieceTransform(x: number, y: number): string {
        const piece: SiamPiece = this.board[y][x];
        return this.getArrowTransform(x+1, y+1, piece.getDirection());
    }
    public getIndicatorTransform(arrow: IndicatorArrow): string {
        const startingAt: Coord = arrow.target.getPrevious(arrow.direction, 0.5);
        return this.getArrowTransform(startingAt.x+1, startingAt.y+1, arrow.direction);
    }
    public getRemainingPieceTransform(piece: number, player: Player): string {
        const x: number = (player === Player.ZERO ? (3.5-piece)/3 : (piece-0.5)/3) + 2.5;
        const y: number = player === Player.ZERO ? -0.5 : 6.5;
        const orientation: Orthogonal = player === Player.ZERO ? Orthogonal.RIGHT : Orthogonal.LEFT;
        return this.getArrowTransform(x, y, orientation);
    }
    public getOrientationTransform(orientation: Orthogonal): string {
        // This shift will be done before the rotation to have nice visuals
        const shift: string = `translate(0, ${this.SPACE_SIZE / 1.6})`;
        // Then, the arrow is rotated
        const orientationDegrees: number = (orientation.toInt() - 2) * 90;
        const rotation: string = `rotate(${orientationDegrees} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        // We want the arrows bigger so we scale them
        const scale: string = `scale(2.43)`;
        // The final translation is to center the arrows
        const translation: string = `translate(${2.27 * this.SPACE_SIZE}, ${2.27 * this.SPACE_SIZE})`;
        return [translation, scale, rotation, shift].join(' ');
    }
    public getPieceClasses(x: number, y: number, c: SiamPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(c.getOwner())];
        if (this.selectedPiece.equalsValue(coord)) {
            classes.push('selected');
        }
        return classes;
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);

        if (this.movedPieces.some((c: Coord) => c.equals(coord))) {
            return ['moved'];
        }
        return [];
    }
    public getRemainingPieceClasses(player: Player, pieceIndex: number): string[] {
        const classes: string[] = [this.getPlayerClass(player)];
        if (this.insertingPiece && this.getCurrentPlayer() === player && pieceIndex === this.playerPieces(player)-1) {
            classes.push('selected');
        }
        return classes;
    }
    public getCurrentPlayerClass(): string {
        return this.getPlayerClass(this.getCurrentPlayer());
    }
    public playerPieces(player: Player): number {
        return 5 - this.getState().countPlayersPawn()[player.value];
    }
}
