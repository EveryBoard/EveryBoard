
import { AIConfig } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Orthogonal } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { RelativePlayer } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { TaflConfig } from '@everyboard/games';
import { TaflEscapeThenPieceThenControlHeuristic } from '@everyboard/games';
import { TaflMove } from '@everyboard/games';
import { TaflMoveGenerator } from '@everyboard/games';
import { TaflPawn } from '@everyboard/games';
import { TaflPieceAndControlHeuristic } from '@everyboard/games';
import { TaflPieceAndInfluenceHeuristic } from '@everyboard/games';
import { TaflPieceHeuristic } from '@everyboard/games';
import { TaflRules } from '@everyboard/games';
import { TaflState } from '@everyboard/games';
import { ScoreName } from '@everyboard/games';
import { MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';

export abstract class TaflComponent<R extends TaflRules<M>, M extends TaflMove>
    extends RectangularGameComponent<R, M, TaflState, TaflPawn, TaflConfig>
{

    public viewInfo: { pieceClasses: string[][][] } = { pieceClasses: [] };

    public EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;

    protected capturedCoords: Coord[] = [];

    protected passedByCoords: Coord[] = [];

    public chosen: MGPOptional<Coord> = MGPOptional.empty();

    public constructor(urlName: string, public generateMove: (start: Coord, end: Coord) => MGPFallible<M>) {
        super(urlName);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.board = this.getState().getCopiedBoard();
        this.updateViewInfo();
        this.updateScores();
    }

    private updateScores(): void {
        const state: TaflState = this.getState();
        const scoreZero: number = this.rules.getPlayerListPawns(Player.ZERO, state).length;
        const scoreOne: number = this.rules.getPlayerListPawns(Player.ONE, state).length;
        this.scores = MGPOptional.of(PlayerNumberMap.of(scoreZero, scoreOne));
    }

    protected override getScoreName(): ScoreName {
        return ScoreName.REMAINING_PIECES;
    }

    protected override async showLastMove(move: M): Promise<void> {
        const previousState: TaflState = this.getPreviousState();
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
        this.passedByCoords = move.getMovedOverCoords();
    }

    public override hideLastMove(): void {
        this.capturedCoords = [];
        this.passedByCoords = [];
    }

    private updateViewInfo(): void {
        const pieceClasses: string[][][] = [];
        this.board = this.getState().getCopiedBoard();
        for (let y: number = 0; y < this.getHeight(); y++) {
            const newLine: string[][] = [];
            for (let x: number = 0; x < this.getWidth(); x++) {
                let newSpace: string[] = [];
                if (this.board[y][x].getOwner().isNone()) {
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

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clicked: Coord = new Coord(x, y);
        if (this.chosen.equalsValue(clicked)) {
            return this.cancelMove();
        }
        if (this.chosen.isAbsent() ||
            this.pieceBelongsToCurrentPlayer(clicked))
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
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (this.pieceBelongsToCurrentPlayer(coord) === false) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }

        this.chosen = MGPOptional.of(coord);
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }

    private pieceBelongsToCurrentPlayer(coord: Coord): boolean {
        const state: TaflState = this.getState();
        const player: Player = state.getCurrentPlayer();
        return state.getRelativeOwner(player, coord) === RelativePlayer.PLAYER;
    }

    public override cancelMoveAttempt(): void {
        this.chosen = MGPOptional.empty();
        this.updateViewInfo();
    }

    public isThrone(x: number, y: number): boolean {
        const state: TaflState = this.getState();
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
        } else if (this.passedByCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('moved-fill');
        }
        return classes;
    }

    public getClickables(): Coord[] {
        if (this.chosen.isPresent()) {
            const coord: Coord = this.chosen.get();
            const state: TaflState = this.getState();
            return this.rules.getPossibleDestinations(coord, state, this.config);
        } else {
            return this.getInteractivePlayerPieces();
        }
    }

    private getInteractivePlayerPieces(): Coord[] {
        if (this.interactive === false) {
            return [];
        }
        const coords: Coord[] = [];
        for (let y: number = 0; y < this.getHeight(); y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.pieceBelongsToCurrentPlayer(coord)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

    public isInvader(x: number, y: number): boolean {
        return this.board[y][x] === TaflPawn.PLAYER_ZERO_PAWN;
    }

    public isKing(x: number, y: number): boolean {
        return this.board[y][x].isKing();
    }

    protected createAIConfig(): AIConfig<TaflMove, TaflState, TaflConfig> {
        return {
            minimax: [
                {
                    id: 'Pieces',
                    name: $localize`Pieces`,
                    heuristic: () => new TaflPieceHeuristic(this.rules),
                    moveGenerator: () => new TaflMoveGenerator(this.rules),
                },
                {
                    id: 'Pieces > Influence',
                    name: $localize`Pieces > Influence`,
                    heuristic: () => new TaflPieceAndInfluenceHeuristic(this.rules),
                    moveGenerator: () => new TaflMoveGenerator(this.rules),
                },
                {
                    id: 'Pieces > Control',
                    name: $localize`Pieces > Control`,
                    heuristic: () => new TaflPieceAndControlHeuristic(this.rules),
                    moveGenerator: () => new TaflMoveGenerator(this.rules),
                },
                {
                    id: 'Escape > Pieces > Control',
                    name: $localize`Escape > Pieces > Control`,
                    heuristic: () => new TaflEscapeThenPieceThenControlHeuristic(this.rules),
                    moveGenerator: (): TaflMoveGenerator<M> => new TaflMoveGenerator(this.rules),
                },
            ],
            mcts: [
                {
                    id: 'default',
                    name: $localize`MCTS`,
                    moveGenerator: (): TaflMoveGenerator<M> => new TaflMoveGenerator(this.rules),
                },
                {
                    id: 'Pieces',
                    name: $localize`Pieces`,
                    heuristic: () => new TaflPieceHeuristic(this.rules),
                    moveGenerator: () => new TaflMoveGenerator(this.rules),
                },
            ],
        };
    }

}
