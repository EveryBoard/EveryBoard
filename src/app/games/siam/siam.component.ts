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
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';
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
        this.rules = new SiamRules(SiamState);
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
    public async selectPieceForInsertion(player: Player): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#selectPiece_' + player);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (player !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.cancelMoveAttempt();
        for (const move of SiamRules.getDerapingInsertions(this.getState())) {
            this.clickableCoords.add(move.coord.getNext(move.moveDirection.get()));
        }
        for (const move of SiamRules.getPushingInsertions(this.getState())) {
            const target: Coord = move.coord.getNext(move.moveDirection.get());
            // For every pushing insertion, we draw an arrow in case it will push a piece
            if (this.board[target.y][target.x] !== SiamPiece.EMPTY) {
                const arrow: IndicatorArrow = {
                    source: MGPOptional.empty(),
                    target,
                    direction: move.moveDirection.get(),
                };
                this.indicatorArrows.push(arrow);
            }
            this.clickableCoords.add(target);
        }
        this.insertingPiece = true;
        return MGPValidation.SUCCESS;
    }
    public async selectOrientation(orientation: Orthogonal): Promise<MGPValidation> {
        // The player has clicked on an orientation arrow
        // A landing coordinate is already selected in selectedLanding
        // We can simply perform the move, but first we need to construct the correct move.
        // To do so, we pick the a valid move that matches our selected landing and orientation.
        let moves: SiamMove[];
        if (this.insertingPiece) {
            moves = this.getInsertionsAt(this.selectedLanding.get());
        } else {
            const piece: SiamPiece = this.getState().getPieceAt(this.selectedPiece.get());
            moves = SiamRules.getMovesBetween(this.getState(),
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
            // Inserting a new piece
            this.selectedLanding = MGPOptional.of(clickedCoord);
            const insertions: SiamMove[] = this.getInsertionsAt(clickedCoord);
            if (insertions.length === 0) {
                this.cancelMoveAttempt();
                return this.clickSquare(x, y);
            }
            return this.performMoveOrShowOrientationArrows(insertions);
        } else {
            // Clicking a square to select a piece or end a non-insertion move
            const clickedPiece: SiamPiece = this.board[y][x];
            if (this.selectedPiece.isPresent()) {
                // Select the landing
                this.selectedLanding = MGPOptional.of(clickedCoord);
                const moves: SiamMove[] =
                    SiamRules.getMovesBetween(this.getState(),
                                              this.getState().getPieceAt(this.selectedPiece.get()),
                                              this.selectedPiece.get(),
                                              clickedCoord);
                if (moves.length === 0) {
                    this.cancelMoveAttempt();
                    return this.clickSquare(x, y);
                }
                return this.performMoveOrShowOrientationArrows(moves);
            } else if (clickedPiece.getOwner() !== this.getCurrentPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            } else {
                // Select the piece
                return this.selectPiece(clickedCoord, clickedPiece);
            }
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
        this.selectedPiece = MGPOptional.of(clickedCoord);
        const moves: SiamMove[] =
            SiamRules.getMovesFrom(this.getState(), clickedPiece, clickedCoord.x, clickedCoord.y);
        for (const move of moves) {
            if (move.moveDirection.isPresent()) {
                const target: Coord = move.coord.getNext(move.moveDirection.get());
                this.clickableCoords.add(target);
                if (this.getState().isOnBoard(target) === false ||
                    this.getState().getPieceAt(target) !== SiamPiece.EMPTY) {
                    const arrow: IndicatorArrow = {
                        source: MGPOptional.of({
                            coord: clickedCoord,
                            piece: clickedPiece,
                        }),
                        target,
                        direction: move.moveDirection.get(),
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
        const x: number = (piece/3) + 2.5; // TODO FOR REVIEW: do we want vertically centered piece (looks better visually on a screenshot) or a stack that decreases from right to left (feels better in game, it really feels like a stack of pieces)
        const y: number = player === Player.ZERO ? -0.5 : 6.5;
        const orientation: Orthogonal = player === Player.ZERO ? Orthogonal.UP : Orthogonal.DOWN;
        return this.getArrowTransform(x, y, orientation);
    }
    public getOrientationTransform(orientation: Orthogonal): string {
        const orientationDegrees: number = (orientation.toInt() - 2) * 90;
        const rotation: string = `rotate(${orientationDegrees} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        // This shift will be done before the rotation to have nice visuals
        const shift: string = `translate(0, ${this.SPACE_SIZE/1.5})`;
        // This translation will be done after, to center the arrows
        const translation: string = `translate(${2.5 * this.SPACE_SIZE}, ${2.5 * this.SPACE_SIZE})`;

        const scale: string = 'scale(2)';
        return [translation, scale, rotation, shift].join(' ');
    }
    public getPieceClasses(c: SiamPiece): string[] {
        return [this.getPlayerClass(c.getOwner())];
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);

        if (this.movedPieces.some((c: Coord) => c.equals(coord))) {
            return ['moved'];
        }
        return [];
    }
    public playerPieces(player: Player): number {
        return 5 - this.getState().countPlayersPawn()[player.value];
    }
    // TODO: these methods should be done better in SiamRules after refactoring the getXXInsertions
    /**
     * Gets the pushing insertion that land at the given coord.
     * There can be more than one in the case of corner squares.
     */
    private getPushingInsertionsAt(coord: Coord): SiamMove[] {
        const moves: SiamMove[] = [];
        for (const move of SiamRules.getPushingInsertions(this.getState())) {
            if (move.coord.getNext(move.moveDirection.get()).equals(coord)) {
                moves.push(move);
            }
        }
        return moves;
    }
    private getDerapingInsertionsAt(coord: Coord): SiamMove[] {
        const moves: SiamMove[] = [];
        for (const move of SiamRules.getDerapingInsertions(this.getState())) {
            if (move.coord.getNext(move.moveDirection.get()).equals(coord)) {
                moves.push(move);
            }
        }
        return moves;
    }
    private getInsertionsAt(coord: Coord): SiamMove[] {
        return this.getDerapingInsertionsAt(coord).concat(this.getPushingInsertionsAt(coord));
    }
}
