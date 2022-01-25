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
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SiamFailure } from './SiamFailure';

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
    public static VERBOSE: boolean = false;

    public lastMove: MGPOptional<SiamMove> = MGPOptional.empty();
    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public landingCoord: MGPOptional<Coord> = MGPOptional.empty();
    public chosenDirection: MGPOptional<Orthogonal> = MGPOptional.empty();
    public chosenOrientation: MGPOptional<Orthogonal> = MGPOptional.empty();
    public movedPieces: Coord[] = [];

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
        const state: SiamState = this.rules.node.gameState;
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
    }
    public clickPiece(x: number, y: number): MGPValidation {
        const clickValidity: MGPValidation = this.canUserPlay('#clickPiece_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const piece: SiamPiece = this.board[y][x];
        const opponent: Player = this.rules.node.gameState.getCurrentOpponent();
        if (piece.getOwner() === opponent) {
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
    public async insertAt(x: number, y: number): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.insertAt(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#insertAt_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosenCoord.isPresent()) {
            return this.cancelMove(SiamFailure.CANNOT_INSERT_WHEN_SELECTED());
        } else {
            this.chosenCoord = MGPOptional.of(new Coord(x, y));
            const dir: Orthogonal = SiamRules.getCoordDirection(x, y, this.rules.node.gameState);
            this.chosenDirection = MGPOptional.of(dir);
            this.landingCoord = MGPOptional.of(this.chosenCoord.get().getNext(dir));
            return MGPValidation.SUCCESS;
        }
    }
    public async tryMove(): Promise<MGPValidation> {
        const chosenCoord: Coord = this.chosenCoord.get();
        const move: SiamMove = new SiamMove(chosenCoord.x,
                                            chosenCoord.y,
                                            this.chosenDirection,
                                            this.chosenOrientation.get());
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gameState);
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
    public getInsertionArrowTransform(x: number, y: number, direction: string): string {
        const orientation: number = Orthogonal.factory.fromString(direction).get().toInt() - 2;
        const rotation: string = `rotate(${orientation*90} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        const translation: string = 'translate(' + x * this.SPACE_SIZE + ', ' + y * this.SPACE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getPieceTransform(x: number, y: number): string {
        const piece: SiamPiece = this.board[y][x];
        const orientation: number = piece.getDirection().toInt()-2;
        const rotation: string = `rotate(${orientation*90} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        const translation: string = 'translate(' + (x+1) * this.SPACE_SIZE + ', ' + (y+1) * this.SPACE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getArrowTransform(x: number, y: number, orientation: string): string {
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
}
