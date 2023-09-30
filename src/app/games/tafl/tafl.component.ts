import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TaflMove } from './TaflMove';
import { TaflPawn } from './TaflPawn';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMinimax } from './TaflMinimax';
import { TaflPieceAndInfluenceMinimax } from './TaflPieceAndInfluenceMinimax';
import { TaflPieceAndControlMinimax } from './TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlMinimax } from './TaflEscapeThenPieceThenControlMinimax';

export abstract class TaflComponent<R extends TaflRules<M, S>, M extends TaflMove, S extends TaflState>
    extends RectangularGameComponent<R, M, S, TaflPawn>
{

    public viewInfo: { pieceClasses: string[][][] } = { pieceClasses: [] };

    public EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;

    protected capturedCoords: Coord[] = [];

    protected passedByCoords: Coord[] = [];

    public chosen: MGPOptional<Coord> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer,
                       public generateMove: (start: Coord, end: Coord) => MGPFallible<M>)
    {
        super(messageDisplayer);
    }
    public override getViewBox(): string {
        const begin: number = - this.STROKE_WIDTH;
        const width: number = (this.rules.config.WIDTH * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
        return begin + ' ' + begin + ' ' + width + ' ' + width;
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.board = this.getState().getCopiedBoard();
        this.capturedCoords = [];
        this.updateViewInfo();
    }
    public override async showLastMove(move: M): Promise<void> {
        const previousState: S = this.getPreviousState();
        const opponent: Player = this.getState().getCurrentOpponent();
        for (const orthogonal of Orthogonal.ORTHOGONALS) {
            const captured: Coord = move.getEnd().getNext(orthogonal, 1);
            if (captured.isInRange(this.rules.config.WIDTH, this.rules.config.WIDTH)) {
                const previousOwner: RelativePlayer = previousState.getRelativeOwner(opponent, captured);
                const wasOpponent: boolean = previousOwner === RelativePlayer.OPPONENT;
                const currentPiece: TaflPawn = this.getState().getPieceAt(captured);
                const isEmpty: boolean = currentPiece === TaflPawn.UNOCCUPIED;
                if (wasOpponent && isEmpty) {
                    this.capturedCoords.push(captured);
                }
            }
        }
        this.passedByCoords = this.node.move.get().getMovedCoords();
    }
    private updateViewInfo(): void {
        const pieceClasses: string[][][] = [];
        this.board = this.getState().getCopiedBoard();
        for (let y: number = 0; y < this.board.length; y++) {
            const newLine: string[][] = [];
            for (let x: number = 0; x < this.board[0].length; x++) {
                let newSpace: string[] = [];
                if (this.board[y][x].getOwner() === PlayerOrNone.NONE) {
                    newSpace = [''];
                } else {
                    newSpace = this.getPieceClasses(x, y);
                }
                newLine.push(newSpace);
            }
            pieceClasses.push(newLine);
        }
        this.viewInfo = { pieceClasses };
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clicked: Coord = new Coord(x, y);
        if (this.chosen.equalsValue(clicked)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        if (this.chosen.isAbsent() ||
            this.pieceBelongToCurrentPlayer(clicked))
        {
            return this.choosePiece(clicked);
        } else {
            return this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen.get();
        const chosenDestination: Coord = new Coord(x, y);
        const move: MGPFallible<M> = this.generateMove(chosenPiece, chosenDestination);
        if (move.isSuccess()) {
            return await this.chooseMove(move.get());
        } else {
            return this.cancelMove(move.getReason());
        }
    }
    private async choosePiece(coord: Coord): Promise<MGPValidation> {
        if (this.board[coord.y][coord.x] === TaflPawn.UNOCCUPIED) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (this.pieceBelongToCurrentPlayer(coord) === false) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }

        this.chosen = MGPOptional.of(coord);
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }
    private pieceBelongToCurrentPlayer(coord: Coord): boolean {
        const state: S = this.getState();
        const player: Player = state.getCurrentPlayer();
        return state.getRelativeOwner(player, coord) === RelativePlayer.PLAYER;
    }
    public override cancelMoveAttempt(): void {
        this.chosen = MGPOptional.empty();
        this.updateViewInfo();
    }
    public isThrone(x: number, y: number): boolean {
        const state: S = this.getState();
        return this.rules.isThrone(state, new Coord(x, y));
    }
    public isCentralThrone(x: number, y: number): boolean {
        return this.getState().isCentralThrone(new Coord(x, y));
    }
    public getPieceClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        const coord: Coord = new Coord(x, y);

        const owner: PlayerOrNone = this.getState().getAbsoluteOwner(coord);
        classes.push(this.getPlayerClass(owner));

        if (this.chosen.equalsValue(coord)) {
            classes.push('selected-stroke');
        }

        return classes;
    }
    public getRectClasses(x: number, y: number): string[] {
        const classes: string[] = [];

        const coord: Coord = new Coord(x, y);
        if (this.capturedCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('captured-fill');
        } else if (this.node.move.isPresent()) {
            if (this.passedByCoords.some((c: Coord) => c.equals(coord))) {
                classes.push('moved-fill');
            }
        }
        return classes;
    }
    public getClickables(): Coord[] {
        const coords: Coord[] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isClickable(coord)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }
    private isClickable(coord: Coord): boolean {
        // Show if the piece can be clicked
        return this.pieceBelongToCurrentPlayer(coord);
    }
    public isInvader(x: number, y: number): boolean {
        return this.board[y][x] === TaflPawn.INVADERS;
    }
    public isKing(x: number, y: number): boolean {
        return this.board[y][x].isKing();
    }
    protected createMinimaxes(): TaflMinimax[] {
        return [
            new TaflMinimax(this.rules, 'DummyBot'),
            new TaflPieceAndInfluenceMinimax(this.rules, 'Piece > Influence'),
            new TaflPieceAndControlMinimax(this.rules, 'Piece > Control'),
            new TaflEscapeThenPieceThenControlMinimax(this.rules, 'Escape > Piece > Control'),
        ];
    }
}
