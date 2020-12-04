import { AbstractGameComponent } from '../AbstractGameComponent';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';
import { DvonnMove } from 'src/app/games/dvonn/dvonnmove/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { DvonnRules } from 'src/app/games/dvonn/dvonnrules/DvonnRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonnpiecestack/DvonnPieceStack';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-dvonn',
    templateUrl: './dvonn.component.html'
})

export class DvonnComponent extends AbstractGameComponent<DvonnMove, DvonnPartSlice, LegalityStatus> {
    public rules: DvonnRules = new DvonnRules(DvonnPartSlice);

    public CASE_SIZE: number = 70;
    public lastMove: DvonnMove = null;
    public chosen: Coord = null;
    public canPass: boolean = false;

    public updateBoard() {
        const slice: DvonnPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.lastMove = this.rules.node.move;
        this.canPass = this.rules.canOnlyPass(slice);
        this.chosen = null;
    }

    public async pass(): Promise<MGPValidation> {
        if (this.canPass) {
            this.chooseMove(DvonnMove.PASS, this.rules.node.gamePartSlice, null, null).then((v) => v.onFailure(this.message));
        } else {
            return MGPValidation.failure("Cannot pass").onFailure(this.message);
        }
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const onError: (err: string) => void = (err: string) => {
            this.message(err);
            this.chosen = null;
        };
        if (this.chosen === null) {
            this.choosePiece(x, y).onFailure(onError);
        } else {
            return this.chooseDestination(x, y).then((v) => v.onFailure(onError));
        }
    }

    public choosePiece(x: number, y: number): MGPValidation {
        if (this.rules.node.isEndGame()) {
            return MGPValidation.failure("Cannot choose a piece at the end of the game");
        }
        const coord: Coord = new Coord(x, y);
        return this.rules.isMovablePiece(this.rules.node.gamePartSlice, coord).onSuccess(() => {
            this.chosen = coord;
        });
    }

    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        try {
            const move: DvonnMove = DvonnMove.of(chosenPiece, chosenDestination);
            return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        } catch (e) {
            return MGPValidation.failure("Cannot choose this move: " + e)
        }
    }

    public decodeMove(encodedMove: number): DvonnMove {
        return DvonnMove.decode(encodedMove);
    }

    public encodeMove(move: DvonnMove): number {
        return DvonnMove.encode(move);
    }

    public isOnBoard(x: number, y: number): boolean {
        return DvonnBoard.isOnBoard(new Coord(x, y));
    }
    public center(x: number, y: number): Coord {
        let xshift = 0;
        switch (y) {
            case 0:
                xshift = 0;
                break;
            case 1:
                xshift = this.CASE_SIZE/2;
                break;
            case 2:
                xshift = this.CASE_SIZE;
                break;
            case 3:
                xshift = 3 * this.CASE_SIZE/2;
                break;
            case 4:
                xshift = 2 * this.CASE_SIZE;
                break;
        }
        return new Coord(xshift + this.CASE_SIZE / 2 + (x * this.CASE_SIZE),
                         this.CASE_SIZE / 2 + (y * (this.CASE_SIZE * 0.75)));
    }
    public source(stackValue: number): boolean {
        return DvonnPieceStack.of(stackValue).containsSource();
    }
    public size(stackValue: number): number {
        return DvonnPieceStack.of(stackValue).size();
    }
    public stylePiece(stackValue: number, hasSource: boolean): any {
        const stack = DvonnPieceStack.of(stackValue);
        return {
            fill: (hasSource && stack.size() === 1) ? 'red' : (stack.belongsTo(Player.ZERO) ? 'gray' : 'black'),
            stroke: hasSource ? 'red' : (stack.belongsTo(Player.ZERO) ? 'gray' : 'black'),
        }
    }

    public pieceText(stackValue: number): string {
        return '' + DvonnPieceStack.of(stackValue).size()
    }

    public getHexaCoordinates(center: Coord): string {
        const x = center.x;
        const y = center.y;
        const size = this.CASE_SIZE/2;
        const halfsize = size / 2;
        const a: Coord = new Coord(x,        y + size);
        const b: Coord = new Coord(x + size, y + halfsize);
        const c: Coord = new Coord(x + size, y - halfsize);
        const d: Coord = new Coord(x,        y - size);
        const e: Coord = new Coord(x - size, y - halfsize);
        const f: Coord = new Coord(x - size, y + halfsize);
        return a.x + ' ' + a.y + ' ' + b.x + ' ' + b.y + ' ' + c.x + ' ' + c.y + ' ' +
            d.x + ' ' + d.y + ' ' + e.x + ' ' + e.y + ' ' + f.x + ' ' + f.y + ' ' + a.x + ' ' + a.y;
    }
}
