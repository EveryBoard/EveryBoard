import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { SaharaMove, SaharaPartSlice, SaharaRules, SaharaNode } from 'src/app/games/Sahara/SaharaRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';

@Component({
  selector: 'app-sahara',
  templateUrl: './sahara.component.html'
})
export class SaharaComponent extends AbstractGameComponent<SaharaMove, SaharaPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules: SaharaRules = new SaharaRules();

    public lastCoord: Coord = new Coord(-1, -1);

    public chosenCoord: Coord = new Coord(-1, -1);

    public TMP_VALUZ: number[][] = [];

    public imagesNames: string[][] = [[ "upward_black_pyramid",   "upward_white_pyramid",   "upward_black"], 
                                     ["downward_black_pyramid", "downward_white_pyramid", "downward_white"]];

    public onClick(x: number, y: number) {
        const clickedCoord: Coord = new Coord(x, y);
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
            this.chosenCoord = new Coord(-1, -1);
        }
        else this.chosenCoord = clickedCoord;
    }                                   
    public updateBoard(): void {
        this.chosenCoord = new Coord(-1, -1);
        if (this.rules.node.gamePartSlice.turn > 0) {
            this.lastCoord = this.rules.node.move.coord;
        }
        this.board = this.rules.node.gamePartSlice.board;
        this.TMP_VALUZ = [
            this.rules.getBoardValuesFor(GamePartSlice.copyBiArray(this.board), Player.ZERO),
            this.rules.getBoardValuesFor(GamePartSlice.copyBiArray(this.board), Player.ONE),
            [this.rules.getBoardValue(this.rules.node)]
        ];
        if (SaharaComponent.VERBOSE) console.table(this.board);
    }
    public decodeMove(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
    public encodeMove(move: SaharaMove): number {
        return move.encode();
    }
}