import { Component, OnInit } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestonePiece } from './LodestonePiece';
import { LodestoneInfos, LodestoneRules } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

interface LodestoneInfo {
    direction: LodestoneDirection,
    pieceClass: string,
    movingClass: string,
    triangles: string[],
}
interface ViewInfo {
    boardInfo: SquareInfo[][],
    availableLodestones: LodestoneInfo[],
    currentPlayerClass: string,
    opponentClass: string,
}

interface SquareInfo {
    coord: Coord,
    squareClasses: string[],
    crumbled: boolean,
    hasPiece: boolean,
    pieceClasses: string[],
}

@Component({
    selector: 'app-lodestone',
    templateUrl: './lodestone.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LodestoneComponent
    extends GameComponent<LodestoneRules, LodestoneMove, LodestoneState, LodestoneInfos>
    implements OnInit
{
    public PIECE_RADIUS: number;
    public viewInfo: ViewInfo = {
        availableLodestones: [],
        boardInfo: [],
        currentPlayerClass: '',
        opponentClass: '',
    };

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = LodestoneRules.get();
        this.availableMinimaxes = [
            // TODO
        ];
        this.encoder = LodestoneMove.encoder;
        this.PIECE_RADIUS = (this.SPACE_SIZE - (2 * this.STROKE_WIDTH)) * 0.5;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
    public onClick(coord: Coord): void {
        // TODO
    }
    public updateBoard(): void {
        this.updateViewInfo();
        const lastMove: MGPOptional<LodestoneMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove();
        }
    }
    private updateViewInfo(): void {
        const state: LodestoneState = this.getState();
        const currentPlayer: Player = state.getCurrentPlayer();
        this.viewInfo.currentPlayerClass = this.getPlayerClass(currentPlayer);
        this.viewInfo.opponentClass = this.getPlayerClass(currentPlayer.getOpponent());
        this.showBoard(state);
        this.showAvailableLodestones(state);
    }
    private showBoard(state: LodestoneState) {
        this.viewInfo.boardInfo = [];
        for (let y: number = 0; y < LodestoneState.SIZE; y++) {
            this.viewInfo.boardInfo.push([]);
            for (let x: number = 0; x < LodestoneState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: LodestonePiece = state.getPieceAt(coord);
                const squareInfo: SquareInfo = {
                    coord,
                    squareClasses: [],
                    crumbled: piece.isUnreachable(),
                    hasPiece: piece.isEmpty() === false,
                    pieceClasses: [],
                };
                if (piece.isPlayerPiece()) {
                    squareInfo.pieceClasses = [this.getPlayerClass(piece.owner)];
                }
                this.viewInfo.boardInfo[y].push(squareInfo);
            }
        }
    }
    private showAvailableLodestones(state: LodestoneState) {
        const nextDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection();
        if (nextDirection.isPresent()) {
            this.viewInfo.availableLodestones =
                { direction: nextDirection.get(), pieceClassplayer: state.get];
        } else {
            this.viewInfo.availableLodestones = ['push', 'pull'];
        }
    }
    private showLastMove(): void {
        // TODO
    }
}
