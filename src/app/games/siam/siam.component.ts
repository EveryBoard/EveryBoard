import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { SiamLegalityStatus } from 'src/app/games/siam/SiamLegalityStatus';
import { SiamMinimax, SiamRules } from 'src/app/games/siam/SiamRules';
import { Coord } from 'src/app/jscaip/Coord';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { GameComponentUtils } from 'src/app/components/game-components/GameComponentUtils';

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class SiamComponent extends AbstractGameComponent<SiamMove, SiamPartSlice, SiamLegalityStatus> {
    public static VERBOSE: boolean = false;

    public availableMinimaxes: Minimax<SiamMove, SiamPartSlice, SiamLegalityStatus>[] = [
        new SiamMinimax('SiamMinimax'),
    ];
    public readonly CASE_SIZE: number = 100;
    public rules: SiamRules = new SiamRules(SiamPartSlice);

    public lastMove: SiamMove;
    public chosenCoord: Coord;
    public landingCoord: Coord;
    public chosenDirection: MGPOptional<Orthogonal>;
    public chosenOrientation: Orthogonal;

    public updateBoard(): void {
        display(SiamComponent.VERBOSE, 'updateBoard');
        const slice: SiamPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.board;
        this.lastMove = this.rules.node.move;
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = null;
        this.chosenDirection = null;
        this.landingCoord = null;
        this.chosenOrientation = null;
    }
    public decodeMove(encodedMove: number): SiamMove {
        return SiamMove.decode(encodedMove);
    }
    public encodeMove(move: SiamMove): number {
        return move.encode();
    }
    public clickPiece(x: number, y: number): MGPValidation {
        const clickValidity: MGPValidation = this.canUserPlay('#clickPiece_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        const piece: number = this.board[y][x];
        const ennemy: Player = this.rules.node.gamePartSlice.getCurrentEnnemy();
        if (SiamPiece.getOwner(piece) === ennemy) {
            return this.cancelMove('Can\'t choose ennemy\'s pieces');
        }
        this.chosenCoord = new Coord(x, y);
        return MGPValidation.SUCCESS;
    }
    public async chooseDirection(direction: string): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.chooseDirection(' + direction + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#chooseDirection_' + direction);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        if (direction === '') {
            this.chosenDirection = MGPOptional.empty();
            this.landingCoord = this.chosenCoord;
        } else {
            const dir: Orthogonal = Orthogonal.factory.fromString(direction);
            this.chosenDirection = MGPOptional.of(dir);
            this.landingCoord = this.chosenCoord.getNext(dir);
            if (this.landingCoord.isNotInRange(5, 5)) {
                display(SiamComponent.VERBOSE, 'orientation and direction should be the same: ' + dir);
                this.chosenOrientation = dir;
                return await this.tryMove();
            }
        }
        return MGPValidation.SUCCESS;
    }
    public async chooseOrientation(orientation: string): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.chooseOrientation(' + orientation + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#chooseOrientation_' + orientation);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        this.chosenOrientation = Orthogonal.factory.fromString(orientation);
        return await this.tryMove();
    }
    public async insertAt(x: number, y: number): Promise<MGPValidation> {
        display(SiamComponent.VERBOSE, 'SiamComponent.insertAt(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#insertAt_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        if (this.chosenCoord) {
            return this.cancelMove('Can\'t insert when there is already a selected piece');
        } else {
            this.chosenCoord = new Coord(x, y);
            const dir: Orthogonal = SiamRules.getCoordDirection(x, y, this.rules.node.gamePartSlice);
            this.chosenDirection = MGPOptional.of(dir);
            this.landingCoord = this.chosenCoord.getNext(dir);
            return MGPValidation.SUCCESS;
        }
    }
    public async tryMove(): Promise<MGPValidation> {
        const move: SiamMove = new SiamMove(this.chosenCoord.x,
                                            this.chosenCoord.y,
                                            this.chosenDirection,
                                            this.chosenOrientation);
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public isPiece(c: number): boolean {
        return ![SiamPiece.EMPTY.value, SiamPiece.MOUNTAIN.value].includes(c);
    }
    public isMountain(pieceValue: number): boolean {
        return pieceValue === SiamPiece.MOUNTAIN.value;
    }
    public getPieceClasses(x: number, y: number, c: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        let last: Coord = this.lastMove ? this.lastMove.coord : null;
        const direction: Orthogonal = this.lastMove ? this.lastMove.moveDirection.getOrNull() : null;
        last = last && direction ? last.getNext(direction) : last;
        if (coord.equals(last)) {
            classes.push('highlighted');
        }

        classes.push(this.getPlayerClass(SiamPiece.getOwner(c)));
        return classes;
    }
    public choosingOrientation(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (this.chosenCoord &&
            this.chosenDirection &&
            coord.equals(this.landingCoord) &&
            this.chosenOrientation == null) {
            display(SiamComponent.VERBOSE, 'choosing orientation now');
            return true;
        }
        return false;
    }
    public choosingDirection(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        if (coord.equals(this.chosenCoord) &&
            this.chosenDirection == null &&
            this.landingCoord == null &&
            this.chosenOrientation == null) {
            display(SiamComponent.VERBOSE, 'choosing direction now');
            return true;
        }
        return false;
    }
    public getInsertionArrowTransform(x: number, y: number, direction: string): string {
        const orientation: number = Orthogonal.factory.fromString(direction).toInt() - 2;
        const rotation: string = `rotate(${orientation*90} ${this.CASE_SIZE/2} ${this.CASE_SIZE/2})`;
        const translation: string = 'translate(' + x * this.CASE_SIZE + ', ' + y * this.CASE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getPieceTransform(x: number, y: number): string {
        const piece: SiamPiece = SiamPiece.decode(this.board[y][x]);
        const orientation: number = piece.getDirection().toInt()-2;
        const rotation: string = `rotate(${orientation*90} ${this.CASE_SIZE/2} ${this.CASE_SIZE/2})`;
        const translation: string = 'translate(' + (x+1) * this.CASE_SIZE + ', ' + (y+1) * this.CASE_SIZE + ')';
        return [translation, rotation].join(' ');
    }
    public getArrowTransform(x: number, y: number, orientation: string): string {
        return GameComponentUtils.getArrowTransform(this.CASE_SIZE,
                                                    new Coord(x, y),
                                                    Orthogonal.factory.fromString(orientation));
    }
}
