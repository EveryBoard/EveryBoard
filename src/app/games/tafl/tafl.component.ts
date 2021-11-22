import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { TaflLegalityStatus } from './TaflLegalityStatus';
import { TaflMove } from './TaflMove';
import { TaflPawn } from './TaflPawn';
import { TaflRules, TaflState } from './TaflRules';

export abstract class TaflComponent<R extends TaflRules<M, S>, M extends TaflMove, S extends TaflState>
    extends RectangularGameComponent<R, M, S, TaflPawn, TaflLegalityStatus>
{

    public NONE: TaflPawn = TaflPawn.UNOCCUPIED;

    protected captureds: Coord[] = [];

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: M;

    public constructor(messageDisplayer: MessageDisplayer,
                       public throneCoords: Coord[],
                       public VERBOSE: boolean,
                       public moveGenerator: (start: Coord, end: Coord) => M)
    {
        super(messageDisplayer);
    }
    public updateBoard(): void {
        display(this.VERBOSE, 'taflComponent.updateBoard');
        this.lastMove = this.rules.node.move;
        this.board = this.rules.node.gameState.getCopiedBoard();

        this.captureds = [];
        if (this.lastMove) {
            this.showPreviousMove();
        }
    }
    private showPreviousMove(): void {
        const previousBoard: Table<TaflPawn> = this.rules.node.mother.gameState.board;
        const OPPONENT: Player = this.rules.node.gameState.getCurrentOpponent();
        for (const orthogonal of Orthogonal.ORTHOGONALS) {
            const captured: Coord = this.lastMove.end.getNext(orthogonal, 1);
            if (captured.isInRange(this.rules.config.WIDTH, this.rules.config.WIDTH)) {
                const previously: RelativePlayer = this.rules.getRelativeOwner(OPPONENT, captured, previousBoard);
                const wasOpponent: boolean = previously === RelativePlayer.OPPONENT;
                const currently: TaflPawn = this.rules.node.gameState.getPieceAt(captured);
                const isEmpty: boolean = currently === TaflPawn.UNOCCUPIED;
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
        let move: M;
        try {
            move = this.moveGenerator(chosenPiece, chosenDestination);
        } catch (error) {
            return this.cancelMove(error.message);
        }
        this.cancelMove();
        return await this.chooseMove(move, this.rules.node.gameState, null, null);
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
        // TODO: see that verification is done and refactor this shit
        const player: Player = this.rules.node.gameState.getCurrentPlayer();
        const coord: Coord = new Coord(x, y);
        return this.rules.getRelativeOwner(player, coord, this.board) === RelativePlayer.PLAYER;
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
    }
    public isThrone(x: number, y: number): boolean {
        const state: S = this.rules.node.gameState;
        return this.rules.isThrone(state, new Coord(x, y));
    }
    public getPieceClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        const owner: Player = this.rules.getAbsoluteOwner(coord, this.board);
        classes.push(this.getPlayerClass(owner));

        if (this.chosen.equals(coord)) {
            classes.push('selected');
        }

        return classes;
    }
    public getRectClasses(x: number, y: number): string[] {
        const classes: string[] = [];

        const coord: Coord = new Coord(x, y);
        const lastStart: Coord = this.lastMove ? this.lastMove.coord : null;
        const lastEnd: Coord = this.lastMove ? this.lastMove.end : null;
        if (this.captureds.some((c: Coord) => c.equals(coord))) {
            classes.push('captured');
        } else if (coord.equals(lastStart) || coord.equals(lastEnd)) {
            classes.push('moved');
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
