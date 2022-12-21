import { Component } from '@angular/core';
import { TrexoSpace, TrexoState } from './TrexoState';
import { TrexoRules } from './TrexoRules';
// import { TrexoMinimax } from './TrexoMinimax';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { TrexoMove } from 'src/app/games/trexo/TrexoMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TrexoTutorial } from './TrexoTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Localized } from 'src/app/utils/LocaleUtils';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';

export class TrexoComponentFailure {

    public static readonly NO_WAY_TO_DROP_IT_HERE: Localized = () => $localize`TODOTODO`;
}

@Component({
    selector: 'app-trexo',
    templateUrl: './trexo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TrexoComponent extends RectangularGameComponent<TrexoRules, TrexoMove, TrexoState, TrexoSpace> {

    public static VERBOSE: boolean = false;

    public victoryCoords: Coord[] = [];

    public droppedPiece: MGPOptional<Coord> = MGPOptional.empty();
    public possibleNextClicks: Coord[] = [];
    public possibleMoves: TrexoMove[] = [];

    public currentOpponentClass: string = 'player1';

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = TrexoRules.get();
        this.availableMinimaxes = [
            // new TrexoMinimax(this.rules, 'TrexoMinimax'),
        ];
        this.encoder = TrexoMove.encoder;
        this.tutorial = new TrexoTutorial().tutorial;
        this.updateBoard();
    }
    public updateBoard(): void {
        const state: TrexoState = this.getState();
        this.board = state.getCopiedBoard();
        this.currentOpponentClass = this.getPlayerClass(state.getCurrentOpponent());
        this.possibleMoves = this.rules.getLegalMoves(state);
        this.victoryCoords = TrexoRules.getVictoriousCoords(state);
        console.table(this.victoryCoords)
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        console.log('click', x, y)
        const clickValidity: MGPValidation = this.canUserPlay('#space_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clicked: Coord = new Coord(x, y);
        if (this.droppedPiece.isPresent()) {
            console.log('second click')
            const dropped: Coord = this.droppedPiece.get();
            if (this.droppedPiece.equalsValue(clicked)) {
                this.cancelMoveAttempt();
                return MGPValidation.SUCCESS;
            }
            if (this.possibleNextClicks.some((c: Coord) => c.equals(clicked))) {
                const isPlayerZero: boolean = this.getState().getCurrentPlayer() === Player.ZERO;
                const first: Coord = isPlayerZero ? clicked : dropped;
                const second: Coord = isPlayerZero ? dropped : clicked;
                const move: TrexoMove = TrexoMove.from(first, second).get();
                return this.chooseMove(move, this.getState());
            }
        }
        return this.selectPiece(clicked);
    }
    private selectPiece(clicked: Coord): MGPValidation {
        console.log('selecting piece')
        this.droppedPiece = MGPOptional.of(clicked);
        this.possibleNextClicks = this.getPossibleNextClicks(clicked);
        return MGPValidation.SUCCESS;
    }
    public getPossibleNextClicks(coord: Coord): Coord[] {
        const potentiallyStartedMove: TrexoMove[] = this.possibleMoves.filter((move: TrexoMove) => {
            return move.coord.equals(coord);
        });
        return potentiallyStartedMove.map((move: TrexoMove) => move.end);
    }
    public cancelMoveAttempt(): void {
        this.droppedPiece = MGPOptional.empty();
        this.possibleNextClicks = [];
    }
    public getPieceClasses(x: number, y: number): string[] {
        const piece: Coord = new Coord(x, y);
        const pieceOwner: PlayerOrNone = this.getState().getPieceAt(piece).owner;
        const classes: string[] = [this.getPlayerClass(pieceOwner)];
        for (const victoryCoord of this.victoryCoords) {
            if (victoryCoord.equals(piece)) {
                console.log('on a trouvé une vektoreuuuuu')
                classes.push('victory-stroke');
                break;
            }
        }
        if (this.rules.node.move.isPresent()) {
            const lastMove: TrexoMove = this.rules.node.move.get();
            if (lastMove.coord.equals(piece) || lastMove.end.equals(piece)) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }
    public getDroppedPieceId(): string {
        const player: string = this.getState().getCurrentOpponent() === Player.ZERO ? 'piece_zero' : 'piece_one';
        const dropped: Coord = this.droppedPiece.get();
        return player + '_' + dropped.x + '_' + dropped.y;
    }
}
