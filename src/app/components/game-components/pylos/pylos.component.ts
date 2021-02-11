import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';
import { PylosRules } from 'src/app/games/pylos/pylos-rules/PylosRules';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

@Component({
    selector: 'app-pylos',
    templateUrl: './pylos.component.html',
})
export class PylosComponent extends AbstractGameComponent<PylosMove, PylosPartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;
    public readonly PRE_CAPTURED_FILL: string = 'pink';

    public rules: PylosRules = new PylosRules(PylosPartSlice);

    public slice: PylosPartSlice = this.rules.node.gamePartSlice;

    public lastLandingCoord: PylosCoord = null;
    public lastStartingCoord: PylosCoord = null;
    public lastFirstCapture: PylosCoord = null;
    public lastSecondCapture: PylosCoord = null;

    public chosenStartingCoord: PylosCoord = null;
    public chosenLandingCoord: PylosCoord = null;
    public chosenFirstCapture: PylosCoord = null;

    public lastMove: PylosMove = null;

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
        } else {
            return true;
        }
    }
    public async onClick(x: number, y: number, z: number): Promise<MGPValidation> {
        const clickedCoord: PylosCoord = new PylosCoord(x, y, z);
        const clickedPiece: number = this.slice.getBoardAt(clickedCoord);
        const coordIsAPiece: boolean = clickedPiece === this.slice.getCurrentPlayer().value;
        const coordIsChosenLandingCoord: boolean = clickedCoord.equals(this.chosenLandingCoord);
        if (coordIsAPiece || coordIsChosenLandingCoord) {
            return await this.onPieceClick(clickedCoord);
        } else if (clickedPiece === Player.NONE.value) {
            return await this.onEmptyCaseClick(clickedCoord);
        } else {
            return this.cancelMove('Can\'t click on ennemy pieces.');
        }
    }
    private async onPieceClick(clickedCoord: PylosCoord): Promise<MGPValidation> {
        if (this.chosenLandingCoord == null) {
            // Starting do describe a climbing move
            this.chosenStartingCoord = clickedCoord;
            return MGPValidation.SUCCESS;
        } else {
            // Starting to select capture
            if (this.chosenFirstCapture == null) { // First capture
                this.chosenFirstCapture = clickedCoord;
                return MGPValidation.SUCCESS;
            } else if (clickedCoord.equals(this.chosenFirstCapture)) {
                return this.concludeMoveWithCapture([this.chosenFirstCapture]);
            } else { // Last capture
                return this.concludeMoveWithCapture([this.chosenFirstCapture, clickedCoord]);
            }
        }
    }
    private async concludeMoveWithCapture(captures: PylosCoord[]): Promise<MGPValidation> {
        let move: PylosMove;
        if (this.chosenStartingCoord == null) {
            move = PylosMove.fromDrop(this.chosenLandingCoord, captures);
        } else {
            move = PylosMove.fromClimb(this.chosenStartingCoord, this.chosenLandingCoord, captures);
        }
        return this.tryMove(move, this.slice);
    }
    private async tryMove(move: PylosMove, slice: PylosPartSlice): Promise<MGPValidation> {
        this.cancelMove();
        return this.chooseMove(move, slice, null, null);
    }
    public cancelMove(reason?: string): MGPValidation {
        this.chosenStartingCoord = null;
        this.chosenLandingCoord = null;
        this.chosenFirstCapture = null;
        if (reason) {
            this.message(reason);
            return MGPValidation.failure(reason);
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    private async onEmptyCaseClick(clickedCoord: PylosCoord): Promise<MGPValidation> {
        if (PylosRules.canCapture(this.slice, clickedCoord)) {
            this.chosenLandingCoord = clickedCoord;
            return MGPValidation.SUCCESS; // now player can click on his captures
        } else {
            if (this.isCapturelesMoveFinished(clickedCoord)) {
                this.chosenLandingCoord = clickedCoord;
                return this.concludeMoveWithCapture([]);
            } else {
                return this.cancelMove('Must move pieces upward.');
            }
        }
    }
    private isCapturelesMoveFinished(clickedCoord: PylosCoord): boolean {
        if (this.chosenStartingCoord == null) {
            // Drop without capture
            return true;
        }
        return clickedCoord.isUpperThan(this.chosenStartingCoord); // true if legal climbing (without capture)
    }
    public getCaseFill(x: number, y: number, z: number): string {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        if (this.lastMove) {
            if (coord.equals(this.lastMove.firstCapture.getOrNull()) ||
                coord.equals(this.lastMove.secondCapture.getOrNull())) {
                return this.CAPTURED_FILL;
            } else if (coord.equals(this.lastMove.landingCoord) ||
                       coord.equals(this.lastMove.startingCoord.getOrNull())) {
                return this.MOVED_FILL;
            }
        }
        if (coord.equals(this.chosenFirstCapture)) {
            return this.PRE_CAPTURED_FILL;
        } else {
            return this.NORMAL_FILL;
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
    public isOccupied(x: number, y: number, z: number): boolean {
        const coord: PylosCoord = new PylosCoord(x, y, z);
        const reallyOccupied: boolean = this.rules.node.gamePartSlice.getBoardAt(coord) !== Player.NONE.value;
        const landingCoord: boolean = coord.equals(this.chosenLandingCoord);
        return reallyOccupied || landingCoord;
    }
    public getPieceStyle(x: number, y: number, z: number): any {
        const c: PylosCoord = new PylosCoord(x, y, z);
        const fill: string = this.getPieceFill(c);
        let stroke: string = 'black';

        if (c.equals(this.lastLandingCoord) ||
            c.equals(this.lastStartingCoord)) stroke = 'yellow';
        else if (c.equals(this.chosenStartingCoord) ||
                 c.equals(this.chosenLandingCoord)) stroke = 'grey';
        else if (c.equals(this.lastFirstCapture) ||
                 c.equals(this.lastSecondCapture)) stroke = 'orange';
        return { fill, stroke };
    }
    private getPieceFill(c: PylosCoord): string {
        let owner: number = this.slice.getBoardAt(c);
        if (c.equals(this.chosenLandingCoord)) {
            owner = this.slice.getCurrentPlayer().value;
        }
        if (c.equals(new PylosCoord(0,0,0))){ console.log(this.getPlayerColor(owner))}
        return this.getPlayerColor(owner);
    }
    public updateBoard(): void {
        this.slice = this.rules.node.gamePartSlice;
        this.lastMove = this.rules.node.move;
        if (this.lastMove) {
            this.lastLandingCoord = this.lastMove.landingCoord;
            this.lastStartingCoord = this.lastMove.startingCoord.getOrNull();
            this.lastFirstCapture = this.lastMove.firstCapture.getOrNull();
            this.lastSecondCapture = this.lastMove.secondCapture.getOrNull();
        } else {
            this.lastLandingCoord = null;
            this.lastStartingCoord = null;
            this.lastFirstCapture = null;
            this.lastSecondCapture = null;
        }
    }
    public decodeMove(encodedMove: number): PylosMove {
        return PylosMove.decode(encodedMove);
    }
    public encodeMove(move: PylosMove): number {
        return PylosMove.encode(move);
    }
}
