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
import { GameComponentUtils } from '../../components/game-components/GameComponentUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class SiamComponent extends AbstractGameComponent<SiamMove, SiamPartSlice, SiamLegalityStatus> {
    public static VERBOSE: boolean = false;

    public availableMinimaxes: Minimax<SiamMove, SiamPartSlice, SiamLegalityStatus>[] = [
        // TODO:does minimax use legality status ????
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
    public getArrowCoordinate(x: number, y: number, o: string): string {
        const x0: number = 100*x; const y0: number = 100*y;
        const x1: number = x0 + 30; const y1: number = y0 + 0;
        const x2: number = x0 + 30; const y2: number = y0 + 50;
        const x3: number = x0 + 0; const y3: number = y0 + 50;
        const x4: number = x0 + 50; const y4: number = y0 + 100;
        const x5: number = x0 + 100; const y5: number = y0 + 50;
        const x6: number = x0 + 70; const y6: number = y0 + 50;
        const x7: number = x0 + 70; const y7: number = y0 + 0;
        const x8: number = x0 + 27.5; const y8: number = y0 + 0;
        return x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' ' +
               x3 + ' ' + y3 + ' ' + x4 + ' ' + y4 + ' ' +
               x5 + ' ' + y5 + ' ' + x6 + ' ' + y6 + ' ' +
               x7 + ' ' + y7 + ' ' + x8 + ' ' + y8;
    }
    public rotate(x: number, y: number, o: string): string {
        const orientation: number = Orthogonal.factory.fromString(o).toInt() - 2;
        return 'rotate(' + (90*orientation) + ' ' + ((100*x) + 50) + ' ' + ((100*y) + 50) + ')';
    }
    public isPiece(c: number): boolean {
        return ![SiamPiece.EMPTY.value, SiamPiece.MOUNTAIN.value].includes(c);
    }
    public rotateOf(x: number, y: number): string {
        const piece: SiamPiece = SiamPiece.decode(this.board[y][x]);
        const orientation: string = piece.getDirection().toString();
        return this.rotate(x + 1, y + 1, orientation);
    }
    public isMountain(pieceValue: number): boolean {
        return pieceValue === SiamPiece.MOUNTAIN.value;
    }
    public getMountainCoordinate(x: number, y: number): string {
        const x0: number = 100*x; const y0: number = 100*y;
        const x1: number = x0; const y1: number = y0 + 100;
        const x2: number = x0 + 16; const y2: number = y0 + 68;
        const x3: number = x0 + 24; const y3: number = y0 + 76;
        const x4: number = x0 + 48; const y4: number = y0 + 28;
        const x5: number = x0 + 64; const y5: number = y0 + 60;
        const x6: number = x0 + 72; const y6: number = y0 + 44;
        const x7: number = x0 + 100; const y7: number = y0 + 100;
        const x8: number = x0 + 0; const y8: number = y0 + 100;
        return x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' ' +
               x3 + ' ' + y3 + ' ' + x4 + ' ' + y4 + ' ' +
               x5 + ' ' + y5 + ' ' + x6 + ' ' + y6 + ' ' +
               x7 + ' ' + y7 + ' ' + x8 + ' ' + y8;
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
    public getTriangleCoordinate(x: number, y: number, lx: number, ly: number): string {
        return GameComponentUtils.getTriangleCoordinate(x, y, lx, ly);
    }
}
