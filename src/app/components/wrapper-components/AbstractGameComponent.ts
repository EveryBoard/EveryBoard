import { Move } from '../../jscaip/Move';
import { Rules } from '../../jscaip/Rules';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Player } from 'src/app/jscaip/player/Player';

/* All method are to be implemented by the Concretes Game Component
 * Except chooseMove which must be set by the GameWrapper
 * (since OnlineGameWrapper and LocalGameWrapper will not give the same action to do when a move is done)
 */
@Component({ template: '' })
export abstract class AbstractGameComponent<M extends Move, S extends GamePartSlice, L extends LegalityStatus> {
    public readonly PLAYER_ZERO_FILL: string = '#994d00';
    public readonly PLAYER_ONE_FILL: string = '#ffc34d';
    public readonly EMPTY_CASE_FILL: string = 'lightbrey';
    public readonly CAPTURED_FILL: string = 'red';
    public readonly MOVED_FILL: string = 'gray';
    public readonly NORMAL_FILL: string = 'lightgrey';
    public readonly CLICKABLE_STYLE: any = {
        stroke: 'yellow',
    };

    public rules: Rules<M, S, L>;

    public board: NumberTable;

    public canPass: boolean;

    public showScore: boolean;

    public imagesLocation: string = 'assets/images/';

    public chooseMove: (move: Move, slice: GamePartSlice, scorePlayerZero: number, scorePlayerOne: number) => Promise<MGPValidation>;

    public observerRole: number;
    /* all game rules should be able to call the game-wrapper
     * the aim is that the game-wrapper will take care of manage what follow
     * ie:  - if it's online, he'll tell the game-component when the remote opponent has played
     *      - if it's offline, he'll tell the game-component what the bot have done
     */

    constructor(public snackBar: MatSnackBar) {
    }
    public message: (msg: string) => void = (msg: string) => {
        this.snackBar.open(msg, 'Ok!', { duration: 3000 });
    };

    public abstract cancelMove(reason?: string): void;

    public abstract decodeMove(encodedMove: number): Move;

    public abstract encodeMove(move: Move): number;

    public abstract updateBoard(): void;

    public getPlayerColor(player: Player): string {
        switch (player) {
            case Player.ZERO: return this.PLAYER_ZERO_FILL;
            case Player.ONE: return this.PLAYER_ONE_FILL;
            case Player.NONE: return this.EMPTY_CASE_FILL;
        }
    }
    public getTurn(): number {
        return this.rules.node.gamePartSlice.turn;
    }
    public async pass(): Promise<MGPValidation> {
        throw new Error('AbstractGameComponent.pass should be overriden before being used.');
    }
}
