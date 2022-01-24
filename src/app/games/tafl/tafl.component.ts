import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { TaflMove } from './TaflMove';
import { TaflPawn } from './TaflPawn';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export abstract class TaflComponent<R extends TaflRules<M, S>, M extends TaflMove, S extends TaflState>
    extends RectangularGameComponent<R, M, S, TaflPawn>
{

    public NONE: TaflPawn = TaflPawn.UNOCCUPIED;

    protected captureds: Coord[] = [];

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: MGPOptional<M> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer,
                       public VERBOSE: boolean,
                       public generateMove: (start: Coord, end: Coord) => MGPFallible<M>)
    {
        super(messageDisplayer);
    }
    public getViewBox(): string {
        const begin: number = - this.STROKE_WIDTH;
        const width: number = (this.rules.config.WIDTH * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        return begin + ' ' + begin + ' ' + width + ' ' + width;
    }
    public updateBoard(): void {
        display(this.VERBOSE, 'taflComponent.updateBoard');
        this.lastMove = this.rules.node.move;
        this.board = this.rules.node.gameState.getCopiedBoard();
        this.captureds = [];
        if (this.lastMove.isPresent()) {
            this.showPreviousMove();
        }
    }
    private showPreviousMove(): void {
        const previousState: S = this.rules.node.mother.get().gameState;
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        for (const orthogonal of Orthogonal.ORTHOGONALS) {
            const captured: Coord = this.lastMove.get().end.getNext(orthogonal, 1);
            if (captured.isInRange(this.rules.config.WIDTH, this.rules.config.WIDTH)) {
                const previousOwner: RelativePlayer = previousState.getRelativeOwner(OPPONENT, captured);
                const wasOpponent: boolean = previousOwner === RelativePlayer.OPPONENT;
                const currentPiece: TaflPawn = this.rules.node.gameState.getPieceAt(captured);
                const isEmpty: boolean = currentPiece === TaflPawn.UNOCCUPIED;
                if (wasOpponent && isEmpty) {
                    this.captureds.push(captured);
                }
            }
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        display(this.VERBOSE, 'TaflComponent.onClick(' + x + ', ' + y + ')');
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        display(this.VERBOSE, 'TaflComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        const move: MGPFallible<M> = this.generateMove(chosenPiece, chosenDestination);
        if (move.isSuccess()) {
            this.cancelMove();
            return await this.chooseMove(move.get(), this.rules.node.gameState);
        } else {
            return this.cancelMove(move.getReason());
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        display(this.VERBOSE, 'TaflComponent.choosePiece');

        if (this.board[y][x] === TaflPawn.UNOCCUPIED) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }

        this.chosen = new Coord(x, y);
        display(this.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
        return MGPValidation.SUCCESS;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        const state: S = this.rules.node.gameState;
        const player: Player = state.getCurrentPlayer();
        const coord: Coord = new Coord(x, y);
        return state.getRelativeOwner(player, coord) === RelativePlayer.PLAYER;
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
    }
    public isThrone(x: number, y: number): boolean {
        const state: S = this.rules.node.gameState;
        return this.rules.isThrone(state, new Coord(x, y));
    }
    public isCentralThrone(x: number, y: number): boolean {
        return this.rules.node.gameState.isCentralThrone(new Coord(x, y)) === false;
    }
    public getPieceClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        const owner: Player = this.rules.node.gameState.getAbsoluteOwner(coord);
        classes.push(this.getPlayerClass(owner));

        if (this.chosen.equals(coord)) {
            classes.push('selected');
        }

        return classes;
    }
    public getRectClasses(x: number, y: number): string[] {
        const classes: string[] = [];

        const coord: Coord = new Coord(x, y);
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
            classes.push('captured');
        } else if (this.lastMove.isPresent()) {
            const lastStart: Coord = this.lastMove.get().coord;
            const lastEnd: Coord = this.lastMove.get().end;
            if (coord.equals(lastStart) || coord.equals(lastEnd)) {
                classes.push('moved');
            }
        }

        return classes;
    }
    public getClickables(): Coord[] {
        const coords: Coord[] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                if (this.isClickable(x, y)) {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }
    private isClickable(x: number, y: number): boolean {
        // Show if the piece can be clicked
        return this.pieceBelongToCurrentPlayer(x, y);
    }
    public isInvader(x: number, y: number): boolean {
        return this.board[y][x] === TaflPawn.INVADERS;
    }
    public isKing(x: number, y: number): boolean {
        return this.board[y][x].isKing();
    }
    public getKingPolyline(x: number, y: number): string {
        const ax: number = 85 + 100*x; const ay: number = 85 + 100*y;
        const bx: number = 30 + 100*x; const by: number = 30 + 100*y;
        const cx: number = 50 + 100*x; const cy: number = 10 + 100*y;
        const dx: number = 70 + 100*x; const dy: number = 30 + 100*y;
        const ex: number = 15 + 100*x; const ey: number = 85 + 100*y;
        return ax + ' ' + ay + ' ' +
               bx + ' ' + by + ' ' +
               cx + ' ' + cy + ' ' +
               dx + ' ' + dy + ' ' +
               ex + ' ' + ey;
    }
}
