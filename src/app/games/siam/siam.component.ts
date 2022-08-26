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

type ArrowInfo = {
    x: number,
    y: number,
    orientation: string,
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
    public static VERBOSE: boolean = false;

    public lastMove: MGPOptional<SiamMove> = MGPOptional.empty();
    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public insertionDirection: MGPOptional<Orthogonal> = MGPOptional.empty();
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
        this.insertionDirection = MGPOptional.empty();
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
    public async chooseLanding(x: number, y: number, orientation: string): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#chooseLanding_' + x + '_' + y + '_' + orientation);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return await this.tryMove(x, y, orientation);
    }
    public async insertAt(x: number, y: number): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.insertAt(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#insertAt_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        this.chosenCoord = MGPOptional.of(clickedCoord);
        const dir: Orthogonal = SiamRules.getCoordDirection(this.getState(), x, y);
        this.insertionDirection = MGPOptional.of(dir);
        return MGPValidation.SUCCESS;
    }
    public async squareClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#square_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        console.log('square click')
        const clickedPiece: SiamPiece = this.getState().getPieceAtXY(x, y);
        if (clickedPiece === SiamPiece.EMPTY && this.isOnEdge(x, y)) {
            // Click on an empty square on the edge, this starts a piece insertion
            const clickedCoord: Coord = new Coord(x, y);
            const dir: Orthogonal = SiamRules.getCoordDirection(this.getState(), x, y);
            this.insertionDirection = MGPOptional.of(dir);
            this.chosenCoord = MGPOptional.of(clickedCoord.getPrevious(dir));
            return MGPValidation.SUCCESS;
        } else if (clickedPiece.isEmptyOrMountain() === false) {
            // Click on a piece square: start a move, delegate to clickPiece
            return this.clickPiece(x, y);
        } else {
            return MGPValidation.failure('TODO')
        }
    }
    private isOnEdge(x: number, y: number): boolean {
        return x === 0 || x === 4 || y === 0 || y === 4;
    }
    private async tryMove(landingX: number, landingY: number, orientation: string): Promise<MGPValidation> {
        const chosenCoord: Coord = this.chosenCoord.get();
        const direction: Orthogonal = SiamRules.getCoordDirection(this.getState(), landingX, landingY);
        const move: SiamMove = new SiamMove(chosenCoord.x,
                                            chosenCoord.y,
                                            MGPOptional.of(direction),
                                            Orthogonal.factory.fromString(orientation).get());
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gameState);
    }
    public isMountain(piece: SiamPiece): boolean {
        return piece === SiamPiece.MOUNTAIN;
    }
    public choosingOrientation(): boolean {
        return this.chosenCoord.isPresent();
    }
    public isInsertionSquareOccupied(x: number, y: number): boolean {
        const dir: Orthogonal = SiamRules.getCoordDirection(this.rules.node.gameState, x, y);
        const insertionCoord: Coord = new Coord(x, y);
        const landingCoord: Coord = insertionCoord.getNext(dir);
        console.log('already occupied?')
        return this.getState().getPieceAt(landingCoord) !== SiamPiece.EMPTY;
    }
    public availableDestinations(): ArrowInfo[] {
        const arrows: ArrowInfo[] = [];
        if (this.chosenCoord.isPresent()) {
            const state: SiamState = this.rules.node.gameState;
            const chosenCoord: Coord = this.chosenCoord.get();
            if (this.insertionDirection.isPresent()) {
                console.log('insertion direction is present')
                // This is an insertion
                const direction: Orthogonal = this.insertionDirection.get();
                console.log(direction)
                const targetSquare: Coord = chosenCoord.getNext(direction);
                console.log('target square is ' + targetSquare.toString());
                if (state.getPieceAt(targetSquare) === SiamPiece.EMPTY) {
                    // If the target is free, any orientation can be chosen
                    for (const orientation of Orthogonal.ORTHOGONALS) {
                        arrows.push({
                            x: targetSquare.x,
                            y: targetSquare.y,
                            orientation: orientation.toString(),
                        });
                    }

                } else {
                    // Otherwise it is a push and it can only be done in one direction
                    arrows.push({
                        x: targetSquare.x,
                        y: targetSquare.y,
                        orientation: direction.toString(),
                    });
                }
            } else {
                // This is a move from a piece already on board
                console.log('piece is already on board')
                const piece: SiamPiece = state.getPieceAt(chosenCoord);
                const moves: SiamMove[] =
                    SiamRules.getMovesFrom(this.rules.node.gameState, piece, chosenCoord.x, chosenCoord.y);
                for (const move of moves) {
                    console.log(move.toString())
                    let landingSquare: Coord;
                    if (move.moveDirection.isPresent()) {
                        landingSquare = move.coord.getNext(move.moveDirection.get());
                    } else {
                        landingSquare = move.coord;
                    }
                    arrows.push({
                        x: landingSquare.x,
                        y: landingSquare.y,
                        orientation: move.landingOrientation.toString(),
                    });
                }
            }
        }
        return arrows;
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
