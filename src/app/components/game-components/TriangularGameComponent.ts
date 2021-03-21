import { Component } from '@angular/core';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/player/Player';
import { AbstractGameComponent } from '../wrapper-components/AbstractGameComponent';

@Component({ template: '' })
export abstract class TriangularGameComponent<M extends Move,
                                              S extends GamePartSlice,
                                              L extends LegalityStatus>
    extends AbstractGameComponent<M, S, L>
{
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
    public getPlayerFill(x: number, y: number): string {
        return this.getPlayerColor(Player.of(this.board[y][x]));
    }
}
