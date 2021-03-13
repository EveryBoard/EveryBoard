import { Component } from '@angular/core';

import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { SaharaMove } from 'src/app/games/sahara/sahara-move/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaRules } from 'src/app/games/sahara/sahara-rules/SaharaRules';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html',
})
export class SaharaComponent extends AbstractGameComponent<SaharaMove, SaharaPartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;

    public rules: SaharaRules = new SaharaRules(SaharaPartSlice);

    public lastCoord: Coord = new Coord(-2, -2);

    public lastMoved: Coord = new Coord(-2, -2);

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
    }
    public getCoordinate(x: number, y: number) : string {
        if ((x+y)%2 === 1) return this.getDownwardCoordinate(x, y);
        else return this.getUpwardCoordinate(x, y);
    }
    public getDownwardCoordinate(x: number, y: number): string {
        return (x*25) + ',' + (50*y) + ',' +
               (25 + (25*x)) + ',' + (50*(y+1)) + ',' +
               (25*(x+2)) + ',' + (50*y) + ',' +
               (x*25) + ',' + (50*y);
    }
    public getUpwardCoordinate(x: number, y: number): string {
        return (x*25) + ',' + (50*(y+1)) + ',' +
               (25 + (25*x)) + ',' + (50*y) + ',' +
               (25*(x+2)) + ',' + (50*(y+1)) + ',' +
               (x*25) + ',' + (50*(y+1));
    }
    public getPyramidCoordinate(x: number, y: number) : string {
        if ((x+y)%2 === 1) return this.getDownwardPyramidCoordinate(x, y);
        else return this.getUpwardPyramidCoordinate(x, y);
    }
    public getDownwardPyramidCoordinate(x: number, y: number): string {
        const zx: number = 25*x;
        const zy: number = 50*y;
        const UP_LEFT: string = zx + ', ' + zy;
        const UP_RIGHT: string = (zx+50) + ', ' + zy;
        const DOWN_CENTER: string = (zx+25) + ', ' + (zy+50);
        const CENTER: string = (zx+25) + ', ' + (zy+25);
        return UP_LEFT + ',' +
               DOWN_CENTER + ',' +
               CENTER + ',' +
               UP_LEFT + ',' +
               CENTER + ',' +
               UP_RIGHT + ',' +
               UP_LEFT + ',' +
               UP_RIGHT + ',' +
               DOWN_CENTER + ',' +
               CENTER + ',' +
               UP_RIGHT;
    }
    public getUpwardPyramidCoordinate(x: number, y: number): string {
        const zx: number = 25*x;
        const zy: number = (50*y) + 50;
        const DOWN_LEFT: string = zx + ', ' + zy;
        const DOWN_RIGHT: string = (zx+50) + ', ' + zy;
        const UP_CENTER: string = (zx+25) + ', ' + (zy-50);
        const CENTER: string = (zx+25) + ', ' + (zy-25);
        return DOWN_LEFT + ',' +
               UP_CENTER + ',' +
               CENTER + ',' +
               DOWN_LEFT + ',' +
               CENTER + ',' +
               DOWN_RIGHT + ',' +
               DOWN_LEFT + ',' +
               DOWN_RIGHT + ',' +
               UP_CENTER + ',' +
               CENTER + ',' +
               DOWN_RIGHT;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.reason);
        }
        if (this.chosenCoord.isAbsent()) { // Must select pyramid
            if (this.board[y][x] === SaharaPawn.EMPTY) { // Did not select pyramid
                return this.cancelMove('Vous devez d\'abord choisir une de vos pyramides!');
            } else if (this.getTurn() % 2 === this.board[y][x]) { // selected his own pyramid
                this.chosenCoord = MGPOptional.of(clickedCoord);
                return MGPValidation.SUCCESS;
            } else { // Selected ennemy pyramid
                return this.cancelMove('Vous devez choisir une de vos pyramides!');
            }
        } else { // Must choose empty landing case
            let newMove: SaharaMove;
            try {
                newMove = new SaharaMove(this.chosenCoord.get(), clickedCoord);
            } catch (error) {
                return this.cancelMove(error.message);
            }
            return await this.chooseMove(newMove, this.rules.node.gamePartSlice, null, null);
        }
    }
    private getPlayerFill(x: number, y: number): string {
        return this.getPlayerColor(Player.of(this.board[y][x]));
    }
    public updateBoard(): void {
        this.chosenCoord = MGPOptional.empty();
        const move: SaharaMove = this.rules.node.move;
        if (move) {
            this.lastCoord = move.coord;
            this.lastMoved = move.end;
        } else {
            this.lastCoord = null;
            this.lastMoved = null;
        }
        this.board = this.rules.node.gamePartSlice.board;
    }
    public decodeMove(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
    public encodeMove(move: SaharaMove): number {
        return SaharaMove.encode(move);
    }
}
