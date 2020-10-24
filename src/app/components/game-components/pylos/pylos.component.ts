import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';
import { PylosRules } from 'src/app/games/pylos/pylos-rules/PylosRules';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';

@Component({
    selector: 'app-pylos',
    templateUrl: './pylos.component.html'
})
export class PylosComponent extends AbstractGameComponent<PylosMove, PylosPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules: PylosRules = new PylosRules();

    public slice: PylosPartSlice = this.rules.node.gamePartSlice;

    public lastLandingCoord: PylosCoord = null;
    public lastStartingCoord: PylosCoord = null;
    public chosenStartingCoord: PylosCoord = null;
    public chosenLandingCoord: PylosCoord = null;
    public chosenFirstCapture: PylosCoord = null;
    public lastFirstCapture: PylosCoord = null;
    public lastSecondCapture: PylosCoord = null;

    public getLevelRange(z: number): number[] {
        switch (z) {
            case 0: return [0, 1, 2, 3];
            case 1: return [0, 1, 2];
            case 2: return [0, 1];
        }
    }
    public isDrawable(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (this.slice.getBoardAt(coord) === Player.NONE.value) {
            return this.slice.isLandable(coord);
        }
        return true;
    }
    public async onClick(x: number, y: number, z: number): Promise<boolean> {
        const clickedCoord: PylosCoord = new PylosCoord(x, y, z);
        const clickedPiece: number = this.slice.getBoardAt(clickedCoord);
        if (clickedPiece === this.slice.getCurrentPlayer().value ||
            clickedCoord.equals(this.chosenLandingCoord))
        {
            return this.onPieceClick(clickedCoord);
        } else if (clickedPiece === Player.NONE.value) {
            return this.onEmptyCaseClick(clickedCoord);
        } else {
            return this.cancelMove("Can't click on ennemy pieces.");
        }
    }
    private async onPieceClick(clickedCoord: PylosCoord): Promise<boolean> {
        if (this.chosenLandingCoord == null) {
            // Starting do describe a climbing move
            this.chosenStartingCoord = clickedCoord;
            return true;
        } else {
            // Starting to select capture
            if (this.chosenFirstCapture == null) { // First capture
                this.chosenFirstCapture = clickedCoord;
                return true;
            } else if (clickedCoord.equals(this.chosenFirstCapture)) {
                return this.concludeMoveWithCapture([this.chosenFirstCapture]);
            } else { // Last capture
                return this.concludeMoveWithCapture([this.chosenFirstCapture, clickedCoord]);
            }
        }
    }
    public async concludeMoveWithCapture(captures: PylosCoord[]): Promise<boolean> {
        let move: PylosMove;
        if (this.chosenStartingCoord == null) {
            move = PylosMove.fromDrop(this.chosenLandingCoord, captures);
        } else {
            move = PylosMove.fromClimb(this.chosenStartingCoord, this.chosenLandingCoord, captures);
        }
        return this.tryMove(move, this.slice);
    }
    public async tryMove(move: PylosMove, slice: PylosPartSlice): Promise<boolean> {
        this.cancelMove("Hiding the move.");
        return this.chooseMove(move, slice, null, null);
    }
    public cancelMove(reason: string): boolean {
        Rules.display(PylosComponent.VERBOSE, reason);
        this.chosenStartingCoord = null;
        this.chosenLandingCoord = null;
        this.chosenFirstCapture = null;
        return false;
    }
    private async onEmptyCaseClick(clickedCoord: PylosCoord): Promise<boolean> {
        if (PylosRules.canCapture(this.slice, clickedCoord)) {
            this.chosenLandingCoord = clickedCoord;
            return true; // now player can click on his captures
        } else {
            if (this.chosenStartingCoord == null || // Doing a drop without possible capture
                clickedCoord.isUpperThan(this.chosenStartingCoord)) // Ending a climbing without possible capture
            {
                this.chosenLandingCoord = clickedCoord;
                return this.concludeMoveWithCapture([]);
            } else {
                return this.cancelMove("Must move pieces upward.");
            }
        }
    }
    public getPieceStyle(x: number, y: number, z: number): any {
        const c: PylosCoord = new PylosCoord(x, y, z);
        let fill: string = this.getPieceFill(c);
        let stroke: string  = "black";

        if (c.equals(this.lastLandingCoord) ||
            c.equals(this.lastStartingCoord)) stroke = 'yellow';
        else if (c.equals(this.chosenStartingCoord) ||
                 c.equals(this.chosenLandingCoord)) stroke = 'grey'
        else if (c.equals(this.lastFirstCapture) ||
                 c.equals(this.lastSecondCapture)) stroke = 'orange';
        return { fill, stroke, 'stroke-width': '10px' };
    }
    public getPieceFill(c: PylosCoord): string {
        let owner: number = this.slice.getBoardAt(c);
        if (c.equals(this.chosenLandingCoord)) {
            owner = this.slice.getCurrentPlayer().value;
        }
        switch (owner) {
            case Player.NONE.value: return 'lightgrey';
            case Player.ZERO.value: return 'blue';
            case Player.ONE.value:  return 'red';
        }
    }
    public getPieceRay(z: number): number {
        return 80 + (z * 10);
    }
    public getPieceCx(x: number, y: number, z: number): number {
        return 100 + (z * 100) + (x * 200);
    }
    public getPieceCy(x: number, y: number, z: number): number {
        return 100 + (z * 100) + (y * 200);
    }
    public updateBoard(): void {
        this.slice = this.rules.node.gamePartSlice;
        const lastMove: PylosMove = this.rules.node.move;
        this.lastLandingCoord = lastMove.landingCoord;
        this.lastStartingCoord = lastMove.startingCoord.getOrNull();
        this.lastFirstCapture = lastMove.firstCapture.getOrNull();
        this.lastSecondCapture = lastMove.secondCapture.getOrNull();
    }
    public decodeMove(encodedMove: number): PylosMove {
        return PylosMove.decode(encodedMove);
    }
    public encodeMove(move: PylosMove): number {
        return PylosMove.encode(move);
    }
}