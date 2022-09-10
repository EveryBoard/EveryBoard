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
import { SiamFailure } from './SiamFailure';
import { Player } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';

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
    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public landingCoord: MGPOptional<Coord> = MGPOptional.empty();
    public chosenDirection: MGPOptional<Orthogonal> = MGPOptional.empty();
    public chosenOrientation: MGPOptional<Orthogonal> = MGPOptional.empty();
    public movedPieces: Coord[] = [];

    public selectedLanding: MGPOptional<Coord> = MGPOptional.empty();
    public displayedArrows: Orthogonal[] = [];
    public clickableCoords: MGPSet<Coord> = new MGPSet();

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
        this.chosenCoord = MGPOptional.empty();
        this.chosenDirection = MGPOptional.empty();
        this.landingCoord = MGPOptional.empty();
        this.chosenOrientation = MGPOptional.empty();

        this.clickableCoords = new MGPSet();
        this.selectedLanding = MGPOptional.empty();
        this.displayedArrows = [];
    }
    public clickPiece(x: number, y: number): MGPValidation {
        const clickValidity: MGPValidation = this.canUserPlay('#clickPiece_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const piece: SiamPiece = this.board[y][x];
        if (piece.getOwner() !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.chosenCoord = MGPOptional.of(new Coord(x, y));
        return MGPValidation.SUCCESS;
    }
    public async chooseDirection(direction: string): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.chooseDirection(' + direction + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#chooseDirection_' + direction);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (direction === '') {
            this.chosenDirection = MGPOptional.empty();
            this.landingCoord = this.chosenCoord;
        } else {
            const dir: Orthogonal = Orthogonal.factory.fromString(direction).get();
            this.chosenDirection = MGPOptional.of(dir);
            this.landingCoord = MGPOptional.of(this.chosenCoord.get().getNext(dir));
            if (this.landingCoord.get().isNotInRange(5, 5)) {
                display(SiamComponent.VERBOSE, 'orientation and direction should be the same: ' + dir);
                this.chosenOrientation = MGPOptional.of(dir);
                return await this.tryMove();
            }
        }
        return MGPValidation.SUCCESS;
    }
    public async chooseOrientation(orientation: string): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.chooseOrientation(' + orientation + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#chooseOrientation_' + orientation);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.chosenOrientation = MGPOptional.of(Orthogonal.factory.fromString(orientation).get());
        return await this.tryMove();
    }
    public async clickSquare(x: number, y: number): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.clickSquare(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#square_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.clickableCoords.isEmpty()) {
            // Clicking a square to select a piece
            return MGPValidation.failure('TODO');
        } else {
            // Inserting a new piece
            const clickedCoord: Coord = new Coord(x, y);
            const insertions: SiamMove[] = this.getInsertionsAt(clickedCoord);
            if (insertions.length === 1) {
                // There's only one possible insertion here, so perform the move
                this.cancelMove();
                return this.chooseMove(insertions[0], this.getState());
            } else {
                // Since there's more than a single insertion, the player will have to select the orientation
                this.selectedLanding = MGPOptional.of(clickedCoord);
                this.displayedArrows = insertions.map((move: SiamMove) => move.landingOrientation);
                return MGPValidation.SUCCESS;
            }
        }
    }
    public async tryMove(): Promise<MGPValidation> {
        const chosenCoord: Coord = this.chosenCoord.get();
        const move: SiamMove = new SiamMove(chosenCoord.x,
                                            chosenCoord.y,
                                            this.chosenDirection,
                                            this.chosenOrientation.get());
        this.cancelMove();
        return this.chooseMove(move, this.getState());
    }
    public isMountain(piece: SiamPiece): boolean {
        return piece === SiamPiece.MOUNTAIN;
    }
    public choosingOrientation(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (this.chosenCoord.isPresent() &&
            this.landingCoord.equalsValue(coord) &&
            this.chosenOrientation.isAbsent())
        {
            display(SiamComponent.VERBOSE, 'choosing orientation now');
            return true;
        }
        return false;
    }
    public choosingDirection(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (this.chosenCoord.equalsValue(coord) &&
            this.chosenDirection.isAbsent() &&
            this.landingCoord.isAbsent() &&
            this.chosenOrientation.isAbsent())
        {
            display(SiamComponent.VERBOSE, 'choosing direction now');
            return true;
        }
        return false;
    }
    public getArrowTransform(x: number, y: number, direction: string): string {
        const orientation: number = Orthogonal.factory.fromString(direction).get().toInt() - 2;
        const rotation: string = `rotate(${orientation*90} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        const translation: string = 'translate(' + x * this.SPACE_SIZE + ', ' + y * this.SPACE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getPieceTransform(x: number, y: number): string {
        // TODO: should become:
        // return this.getArrowTransform(x+1, y+1, piece.getDirection())
        const piece: SiamPiece = this.board[y][x];
        const orientation: number = piece.getDirection().toInt()-2;
        const rotation: string = `rotate(${orientation*90} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        const translation: string = 'translate(' + (x+1) * this.SPACE_SIZE + ', ' + (y+1) * this.SPACE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getTriangleTransform(x: number, y: number, orientation: string): string {
        return GameComponentUtils.getArrowTransform(this.SPACE_SIZE,
                                                    new Coord(x, y),
                                                    Orthogonal.factory.fromString(orientation).get());
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
    public getRemainingPieceTransform(piece: number, player: Player): string {
        const x: number = (piece/3) + (5 - this.playerPieces(player) / 2);
        const y: number = player === Player.ZERO ? -0.5 : 6.5;
        const orientation: string = player === Player.ZERO ? 'UP' : 'DOWN';
        return this.getArrowTransform(x, y, orientation);
    }
    public getOrientationTransform(orientation: Orthogonal): string {
        const orientationDegrees: number = (orientation.toInt() - 2) * 90;
        const rotation: string = `rotate(${orientationDegrees} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        // This shift will be done before the rotation to have nice visuals
        const shift: string = `translate(0, ${this.SPACE_SIZE/1.5})`;
        // This translation will be done after, to center the arrows
        const translation: string = `translate(${2.5 * this.SPACE_SIZE}, ${2.5 * this.SPACE_SIZE})`

        const scale: string = 'scale(2)';
        return [translation, scale, rotation, shift].join(' ');
    }
    public async selectPieceForInsertion(player: Player): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#selectPiece_' + player);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        console.log({player, currentPlayer: this.getCurrentPlayer()})
        if (player !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        for (const move of SiamRules.getPushingInsertions(this.getState())) {
            // For every pushing insertion, we highlight the target coord and draw an arrow
            this.clickableCoords.add(move.coord.getNext(move.moveDirection.get()));
            // TODO: arrow
        }
        for (const move of SiamRules.getDerapingInsertions(this.getState())) {
            this.clickableCoords.add(move.coord.getNext(move.moveDirection.get()));
        }
        return MGPValidation.SUCCESS;
    }
    public async selectOrientation(orientation: Orthogonal): Promise<MGPValidation> {
        // The player has clicked on an orientation arrow
        // A landing coordinate is already selected in selectedLanding
        // We can simply perform the move, but first we need to construct the correct move.
        // To do so, we pick the a valid move that matches our selected landing and orientation.
        for (const move of this.getInsertionsAt(this.selectedLanding.get())) {
            if (move.landingOrientation === orientation) {
                this.cancelMove();
                return this.chooseMove(move, this.getState());
            }
        }
        return this.cancelMove('impossible?')
    }

    // TODO: these methods should be done better in SiamRules after refactoring the getXXInsertions
    /**
     * Gets the pushing insertion that land at the given coord.
     * There can be more than one in the case of corner squares.
     */
    public getPushingInsertionsAt(coord: Coord): SiamMove[] {
        const moves: SiamMove[] = [];
        for (const move of SiamRules.getPushingInsertions(this.getState())) {
            if (move.coord.getNext(move.moveDirection.get()).equals(coord)) {
                moves.push(move);
            }
        }
        return moves;
    }
    public getDerapingInsertionsAt(coord: Coord): SiamMove[] {
        const moves: SiamMove[] = [];
        for (const move of SiamRules.getDerapingInsertions(this.getState())) {
            if (move.coord.getNext(move.moveDirection.get()).equals(coord)) {
                moves.push(move);
            }
        }
        return moves;
    }
    public getInsertionsAt(coord: Coord): SiamMove[] {
        return this.getDerapingInsertionsAt(coord).concat(this.getPushingInsertionsAt(coord));
    }
}
