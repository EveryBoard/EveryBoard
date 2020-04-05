import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaRules } from 'src/app/games/sahara/SaharaRules';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html'
})
export class SaharaComponent extends AbstractGameComponent<SaharaMove, SaharaPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = true;

    public rules: SaharaRules = new SaharaRules();

    public lastCoord: Coord = new Coord(-2, -2);

    public lastMoved: Coord = new Coord(-2, -2);

    public chosenCoord: Coord = new Coord(-2, -2);

    public imagesNames: string[][] = [[ "upward_black_pyramid",   "upward_white_pyramid",   "upward_black"],
                                     ["downward_black_pyramid", "downward_white_pyramid", "downward_white"]];

    public highlightNames: string[] = ["upward_highlight.svg", "downward_highlight.svg"];

    public getCoordinate(x: number, y: number) : string {
        if ((x+y)%2 === 1) return this.getDownwardCoordinate(x, y);
        else return this.getUpwardCoordinate(x, y);
    }
    public getDownwardCoordinate(x: number, y: number): string {
        return (x*25)        + ',' + (50*y)     + ',' +
               (25 + (25*x)) + ',' + (50*(y+1)) + ',' +
               (25*(x+2))    + ',' + (50*y)     + ',' +
               (x*25)        + ',' + (50*y);
    }
    public getUpwardCoordinate(x: number, y: number): string {
        return (x*25)        + ',' + (50*(y+1)) + ',' +
               (25 + (25*x)) + ',' + (50*y)     + ',' +
               (25*(x+2))    + ',' + (50*(y+1)) + ',' +
               (x*25)        + ',' + (50*(y+1));
    }
    public getPyramidCoordinate(x: number, y: number) : string {
        if ((x+y)%2 === 1) return this.getDownwardPyramidCoordinate(x, y);
        else return this.getUpwardPyramidCoordinate(x, y);
    }
    public getDownwardPyramidCoordinate(x: number, y: number): string {
        const zx: number = 25*x;
        const zy: number = 50*y;
        const UP_LEFT: string     = zx      + ', ' + zy;
        const UP_RIGHT: string    = (zx+50) + ', ' + zy;
        const DOWN_CENTER: string = (zx+25) + ', ' + (zy+50);
        const CENTER: string      = (zx+25) + ', ' + (zy+25);
        return UP_LEFT     + ',' +
               DOWN_CENTER + ',' +
               CENTER      + ',' +
               UP_LEFT     + ',' +
               CENTER      + ',' +
               UP_RIGHT    + ',' +
               UP_LEFT     + ',' +
               UP_RIGHT    + ',' +
               DOWN_CENTER + ',' +
               CENTER      + ',' +
               UP_RIGHT;
    }
    public getUpwardPyramidCoordinate(x: number, y: number): string {
        const zx: number = 25*x;
        const zy: number = (50*y) + 50;
        const DOWN_LEFT: string  = zx      + ', ' + zy;
        const DOWN_RIGHT: string = (zx+50) + ', ' + zy;
        const UP_CENTER: string  = (zx+25) + ', ' + (zy-50);
        const CENTER: string     = (zx+25) + ', ' + (zy-25);
        return DOWN_LEFT  + ',' +
               UP_CENTER  + ',' +
               CENTER     + ',' +
               DOWN_LEFT  + ',' +
               CENTER     + ',' +
               DOWN_RIGHT + ',' +
               DOWN_LEFT  + ',' +
               DOWN_RIGHT + ',' +
               UP_CENTER  + ',' +
               CENTER     + ',' +
               DOWN_RIGHT;
    }
    public onClick(x: number, y: number) {
        const clickedCoord: Coord = new Coord(x, y);
        if (SaharaComponent.VERBOSE) console.log("Clicked on "+clickedCoord.toString());
        if (-1 < this.chosenCoord.x) {
            try {
                const newMove: SaharaMove = new SaharaMove(this.chosenCoord, clickedCoord);
                if (this.chooseMove(newMove, this.rules.node.gamePartSlice, null, null)) {
                    if (SaharaComponent.VERBOSE) console.log("Move is legal");
                } else {
                    if (SaharaComponent.VERBOSE) console.log("Move is illegal");
                }
            } catch (error) {
                if (SaharaComponent.VERBOSE) console.log(error.message);
            }
            this.chosenCoord = new Coord(-2, -2);
        }
        else this.chosenCoord = clickedCoord;
    }
    public updateBoard(): void {
        this.chosenCoord = new Coord(-2, -2);
        if (this.rules.node.gamePartSlice.turn > 0) {
            this.lastCoord = this.rules.node.move.coord;
            this.lastMoved = this.rules.node.move.end;
        }
        this.board = this.rules.node.gamePartSlice.board;
        if (SaharaComponent.VERBOSE) console.table(this.board);
    }
    public decodeMove(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
    public encodeMove(move: SaharaMove): number {
        return move.encode();
    }
}