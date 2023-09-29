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
import { ActivatedRoute } from '@angular/router';
import { TaflConfig } from './TaflConfig';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { AI, AIOptions } from 'src/app/jscaip/AI';
import { MCTS } from 'src/app/jscaip/MCTS';
import { TaflPieceAndInfluenceMinimax } from './TaflPieceAndInfluenceMinimax';
import { TaflPieceMinimax } from './TaflPieceMinimax';
import { TaflPieceAndControlMinimax } from './TaflPieceAndControlMinimax';
import { TaflEscapeThenPieceThenControlMinimax } from './TaflEscapeThenPieceThenControlMinimax';

export abstract class TaflComponent<R extends TaflRules<M, S>, M extends TaflMove, S extends TaflState>
    extends RectangularGameComponent<R, M, S, TaflPawn, TaflConfig>
{

    public viewInfo: { pieceClasses: string[][][] } = { pieceClasses: [] };

    public EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;

    protected capturedCoords: Coord[] = [];

    public chosen: MGPOptional<Coord> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer,
                       actRoute: ActivatedRoute,
                       public generateMove: (start: Coord, end: Coord) => MGPFallible<M>)
    {
        super(messageDisplayer, actRoute);
    }
    public override getViewBox(): string {
        const begin: number = - this.STROKE_WIDTH;
        const abstractWidth: number = this.getState().board.length; // Asserting all tafl are square board
        const width: number = (abstractWidth * this.SPACE_SIZE) + (2 * this.STROKE_WIDTH);
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
            if (previousState.isOnBoard(captured)) {
                const previousOwner: RelativePlayer = previousState.getRelativeOwner(opponent, captured);
                const wasOpponent: boolean = previousOwner === RelativePlayer.OPPONENT;
                const currentPiece: TaflPawn = this.getState().getPieceAt(captured);
                const isEmpty: boolean = currentPiece === TaflPawn.UNOCCUPIED;
                if (wasOpponent && isEmpty) {
                    this.capturedCoords.push(captured);
                }
            }
        }
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
        } else if (this.node.previousMove.isPresent()) {
            const lastStart: Coord = this.node.previousMove.get().getStart();
            const lastEnd: Coord = this.node.previousMove.get().getEnd();
            if (coord.equals(lastStart) || coord.equals(lastEnd)) {
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
        return this.board[y][x] === TaflPawn.PLAYER_ZERO_PAWN;
    }
    public isKing(x: number, y: number): boolean {
        return this.board[y][x].isKing();
    }
    protected createAIs(): AI<TaflMove, S, AIOptions>[] {
        const moveGenerator: TaflMoveGenerator<M, S> = new TaflMoveGenerator(this.rules);
        return [
            new TaflPieceMinimax(this.rules),
            new TaflPieceAndInfluenceMinimax(this.rules),
            new TaflPieceAndControlMinimax(this.rules),
            new TaflEscapeThenPieceThenControlMinimax(this.rules),
            new MCTS($localize`MCTS`, moveGenerator, this.rules),
        ];
    }
}
