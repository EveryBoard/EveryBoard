import { Move } from '../../jscaip/Move';
import { Rules } from '../../jscaip/Rules';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

/* All method are to be implemented by the Concretes Game Component
 * Except chooseMove which must be set by the GameWrapper
 * (since OnlineGameWrapper and LocalGameWrapper will not give the same action to do when a move is done)
 */
@Component({template: ''})
export abstract class AbstractGameComponent<M extends Move, S extends GamePartSlice, L extends LegalityStatus> {

    public rules: Rules<M, S, L>;

    public board: ReadonlyArray<ReadonlyArray<number>>;

    public canPass: boolean;

    public showScore: boolean;

    public imagesLocation = 'assets/images/';

    public chooseMove: (move: Move, slice: GamePartSlice, scorePlayerZero: number, scorePlayerOne: number) => Promise<MGPValidation>;

    public observerRole: number;
    /* all game rules should be able to call the game-wrapper
     * the aim is that the game-wrapper will take care of manage what follow
     * ie:  - if it's online, he'll tell the game-component when the remote opponent has played
     *      - if it's offline, he'll tell the game-component what the bot have done
     */

    constructor(public snackBar: MatSnackBar) {
    }

    public message(msg: string) {
        this.snackBar.open(msg);
    }

    public abstract updateBoard(): void;

    public abstract decodeMove(encodedMove: number): Move;

    public abstract encodeMove(move: Move): number;

    public getTurn(): number {
        return this.rules.node.gamePartSlice.turn;
    }
    public pass() {
        throw new Error("AbstractGameComponent.pass should be overriden before being used.");
    }
}
