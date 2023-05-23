import { Component } from '@angular/core';

import { TriangularGameComponent }
    from 'src/app/components/game-components/game-component/TriangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaState } from 'src/app/games/sahara/SaharaState';
import { SaharaRules } from 'src/app/games/sahara/SaharaRules';
import { SaharaMinimax } from 'src/app/games/sahara/SaharaMinimax';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { SaharaFailure } from './SaharaFailure';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { SaharaTutorial } from './SaharaTutorial';
import { MGPFallible } from 'src/app/utils/MGPFallible';

@Component({
    selector: 'app-sahara',
    templateUrl: './sahara.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class SaharaComponent extends TriangularGameComponent<SaharaRules,
                                                             SaharaMove,
                                                             SaharaState,
                                                             FourStatePiece>
{
    public static VERBOSE: boolean = false;

    public lastCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: MGPOptional<Coord> = MGPOptional.empty();

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();

    public possibleLandings: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = SaharaRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new SaharaMinimax(this.rules, 'SaharaMinimax'),
        ];
        this.encoder = SaharaMove.encoder;
        this.tutorial = new SaharaTutorial().tutorial;
        this.updateBoard();
    }
    public override cancelMoveAttempt(): void {
        this.possibleLandings = [];
        this.chosenCoord = MGPOptional.empty();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const currentPlayer: Player = this.getState().getCurrentPlayer();
        const player: FourStatePiece = FourStatePiece.ofPlayer(currentPlayer);
        if (this.chosenCoord.equalsValue(new Coord(x, y))) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else if (this.chosenCoord.isAbsent() ||
                  this.board[y][x] === player)
        { // Must select pyramid
            return this.choosePiece(x, y);
        } else { // Must choose empty landing space
            return this.chooseLandingCoord(x, y);
        }
    }
    private choosePiece(x: number, y: number): MGPValidation {
        if (this.board[y][x] === FourStatePiece.EMPTY) { // Did not select pyramid
            return this.cancelMove(SaharaFailure.MUST_CHOOSE_PYRAMID_FIRST());
        } else if (this.board[y][x].is(Player.fromTurn(this.getTurn()))) { // selected player's pyramid
            const coord: Coord = new Coord(x, y);
            this.selectPiece(coord);
            return MGPValidation.SUCCESS;
        } else { // Selected opponent pyramid
            return this.cancelMove(SaharaFailure.MUST_CHOOSE_OWN_PYRAMID());
        }
    }
    private selectPiece(coord: Coord): void {
        this.chosenCoord = MGPOptional.of(coord);
        this.possibleLandings = this.rules.getLandingCoords(this.board, coord);
    }
    private async chooseLandingCoord(x: number, y: number): Promise<MGPValidation> {
        const clickedCoord: Coord = new Coord(x, y);
        const newMove: MGPFallible<SaharaMove> = SaharaMove.from(this.chosenCoord.get(), clickedCoord);
        if (newMove.isFailure()) {
            return this.cancelMove(newMove.getReason());
        }
        return await this.chooseMove(newMove.get(), this.getState());
    }
    public updateBoard(): void {
        const move: MGPOptional<SaharaMove> = this.node.move;
        this.lastCoord = move.map((move: SaharaMove) => move.getStart());
        this.lastMoved = move.map((move: SaharaMove) => move.getEnd());
        this.board = this.getState().board;
    }
    public getPlayerClassFor(x: number, y: number): string {
        const piece: FourStatePiece = this.board[y][x];
        return this.getPlayerClass(Player.of(piece.value));
    }
}
