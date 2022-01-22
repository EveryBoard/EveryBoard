import { Component, OnInit } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert } from 'src/app/utils/utils';
import { DiamDummyMinimax } from './DiamDummyMinimax';
import { DiamFailure } from './DiamFailure';
import { DiamMove, DiamMoveDrop, DiamMoveEncoder, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamRules } from './DiamRules';
import { DiamState } from './DiamState';
import { DiamTutorial } from './DiamTutorial';

interface ViewInfo {
    boardInfo: SpaceInfo[],
    remainingPieces: PieceInfo[],
}

interface SpaceInfo {
    x: number,
    spaceClasses: string[],
    pieces: PieceInfo[],
}

interface PieceInfo {
    backgroundClasses: string[],
    foregroundClasses: string[],
    y: number,
    drawPosition: Coord,
    actualPiece: DiamPiece,
}

type Selected = { type: 'pieceFromReserve', piece: DiamPiece }
    | { type: 'pieceFromBoard', position: Coord }

interface LastMoved {
    startDrawPosition: Coord,
    endDrawPosition: Coord,
    start: MGPOptional<Coord>,
    end: Coord
}

@Component({
    selector: 'app-diam',
    templateUrl: './diam.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class DiamComponent extends GameComponent<DiamRules, DiamMove, DiamState> implements OnInit {
    private static CENTER: Coord[] = [
        new Coord(40, 160),
        new Coord(100, 50),
        new Coord(255, 2),
        new Coord(400, 50),
        new Coord(460, 160),
        new Coord(400, 270),
        new Coord(255, 320),
        new Coord(100, 270),
    ];
    public static PIECE_HEIGHT: number = 36;
    public BOARD_PATHS: string[] = [
        'M 2.8324855,277.57643 164.46619,228.81694 170.57257,148.42756 32.571357,104.19835 Z',
        'M 170.57257,148.42237 246.4213,96.276913 195.13813,2.0233391 32.571357,104.19315 Z',
        'm 195.14159,2.0268021 205.0898,0.010821 -52.1686,94.2453509 -101.64149,-0.0057 z',
        'M 348.06279,96.281239 400.23529,2.0330788 564.39307,104.19207 424.66384,148.41891 Z',
        'm 424.66384,148.42237 7.27882,80.37683 164.9712,48.72701 -32.52079,-173.33068 z',
        'm 431.94266,228.80481 -75.73854,62.15055 79.06197,135.86929 161.64688,-149.29953 z',
        'm 356.20412,290.9506 79.06197,135.86929 -268.2864,0.0433 74.14082,-135.90175 z',
        'M 241.12051,290.96379 166.97969,426.86556 2.8324855,277.57708 164.46619,228.81759 Z',
    ];
    public DECORATION_PATHS: string[] = [
        'm 170.57257,148.42302 v 40.08918 l -6.11049,80.38634 v -40.09025 z',
        'm 170.57646,188.51696 v -40.08918 l 75.8509,-52.140047 v 40.086147 z',
        'm 246.42323,96.285785 v 40.086155 l 101.63847,-0.003 0.001,-40.082256 z',
        'm 424.66037,148.42345 v 40.08377 l -76.60213,-52.14178 10e-4,-40.082033 z',
        'm 424.66037,148.42193 v 40.08377 l 7.27884,80.37445 v -40.08377 z',
        'm 435.26609,466.90582 v -40.08615 l 161.64688,-149.2995 8.9e-4,40.08701 z',
        'm 166.97969,426.86815 v 40.08638 l 268.28379,-0.0433 v -40.08031 z',
        'm 2.8324855,277.57297 v 40.08636 L 166.97969,466.94782 v -40.08636 z',
    ];
    public selected: MGPOptional<Selected> = MGPOptional.empty();

    public viewInfo: ViewInfo = {
        boardInfo: [],
        remainingPieces: [],
    };
    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = DiamRules.get();
        this.availableMinimaxes = [
            new DiamDummyMinimax(this.rules, 'DiamDummyMinimax'),
        ];
        this.encoder = DiamMoveEncoder;
        this.tutorial = new DiamTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
    public async onSpaceClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        return this.onSpaceClickAfterCheck(x);
    }
    private async onSpaceClickAfterCheck(x: number): Promise<MGPValidation> {
        if (this.selected.isPresent()) {
            const selected: Selected = this.selected.get();
            let move: DiamMove;
            if (selected.type === 'pieceFromReserve') {
                move = new DiamMoveDrop(x, selected.piece);
            } else {
                if ((selected.position.x + 1) % DiamState.WIDTH === x) {
                    move = new DiamMoveShift(selected.position, 'clockwise');
                } else if ((selected.position.x + (DiamState.WIDTH-1)) % DiamState.WIDTH === x) {
                    move = new DiamMoveShift(selected.position, 'counterclockwise');
                } else {
                    return this.cancelMove(DiamFailure.MUST_SHIFT_TO_NEIGHBOR());
                }
            }
            return this.chooseMove(move, this.getState());
        } else {
            return this.cancelMove(DiamFailure.MUST_SELECT_PIECE_FIRST());
        }
    }
    public async onPieceInGameClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedPiece: DiamPiece = this.getState().getPieceAtXY(x, y);
        if (clickedPiece.owner === this.getCurrentPlayer()) {
            this.selected = MGPOptional.of({ type: 'pieceFromBoard', position: new Coord(x, y) });
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else if (this.selected.isPresent()) {
            // This becomes a click on the space
            return this.onSpaceClickAfterCheck(x);
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    public async onRemainingPieceClick(piece: DiamPiece): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(this.getPieceId(piece));
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        if (piece.owner === this.getCurrentPlayer()) {
            this.selected = MGPOptional.of({ type: 'pieceFromReserve', piece });
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    private getPieceId(piece: DiamPiece): string {
        return '#piece_' + piece.owner.value + '_' + (piece.otherPieceType ? 1 : 0);
    }
    public updateBoard(): void {
        this.updateViewInfo();
        const lastMove: MGPOptional<DiamMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove();
        }
    }
    private getLastMovedFromDrop(drop: DiamMoveDrop, stateBefore: DiamState): LastMoved[] {
        const startDrawPosition: Coord =
            this.getDrawPositionRemainingPiece(drop.piece, stateBefore.getRemainingPiecesOf(drop.piece)-1);
        const x: number = drop.getTarget();
        const y: number = stateBefore.getStackHeight(drop.getTarget());
        const endDrawPosition: Coord = this.getDrawPositionOnBoard(x, y);
        const end: Coord = new Coord(x, y);
        return [{
            start: MGPOptional.empty(),
            end,
            startDrawPosition,
            endDrawPosition,
        }];
    }
    private getLastMovedFromShift(shift: DiamMoveShift, stateBefore: DiamState): LastMoved[] {
        const sourceX: number = shift.start.x;
        const destinationX: number = shift.getTarget();
        let destinationY: number = stateBefore.getStackHeight(destinationX);
        const lastMoved: LastMoved[] = [];
        for (let sourceY: number = shift.start.y;
            sourceY < DiamState.HEIGHT && stateBefore.getPieceAtXY(sourceX, sourceY) !== DiamPiece.EMPTY;
            sourceY++, destinationY++) {
            lastMoved.push({
                start: MGPOptional.of(new Coord(sourceX, sourceY)),
                end: new Coord(destinationX, destinationY),
                startDrawPosition: this.getDrawPositionOnBoard(sourceX, sourceY),
                endDrawPosition: this.getDrawPositionOnBoard(destinationX, destinationY),
            });
        }
        return lastMoved;
    }
    private updateViewInfo(): void {
        this.updateBoardInfo();
        this.updateRemainingPiecesInfo();
    }
    private updateBoardInfo(): void {
        for (let x: number = 0; x < DiamState.WIDTH; x++) {
            this.viewInfo.boardInfo[x] = {
                x,
                spaceClasses: [], // will be filled in showLastMove
                pieces: this.getPieces(x),
            };
        }
    }
    private showLastMove(): void {
        this.showLastMoveOnSpaces();
        this.showLastMoveOnPieces();
    }
    private showLastMoveOnSpaces(): void {
        const lastMoveOpt: MGPOptional<DiamMove> = this.rules.node.move;
        assert(lastMoveOpt.isPresent(), 'showLastMoveOnSpaces called without a last move');
        const lastMove: DiamMove = lastMoveOpt.get();
        for (let x: number = 0; x < DiamState.WIDTH; x++) {
            const classes: string[] = [];
            if (lastMove.isDrop()) {
                if (lastMove.getTarget() === x) {
                    classes.push('moved');
                }
            } else {
                if (lastMove.getTarget() === x || lastMove.start.x === x) {
                    classes.push('moved');
                }
            }
            this.viewInfo.boardInfo[x].spaceClasses = classes;
        }
    }
    private showLastMoveOnPieces(): void {
        const lastMoveOpt: MGPOptional<DiamMove> = this.rules.node.move;
        assert(lastMoveOpt.isPresent(), 'showLastMoveOnPieces called without a last move');
        const lastMove: DiamMove = lastMoveOpt.get();
        const previousState: DiamState = this.getPreviousState();
        let lastMoved: LastMoved[] = [];
        if (lastMove.isDrop()) {
            lastMoved = this.getLastMovedFromDrop(lastMove, previousState);
        } else {
            lastMoved = this.getLastMovedFromShift(lastMove, previousState);
        }
        for (const movedPiece of lastMoved) {
            const x: number = movedPiece.end.x;
            const y: number = movedPiece.end.y;
            this.viewInfo.boardInfo[x].pieces[y].foregroundClasses.push('last-move');
        }
    }
    private updateRemainingPiecesInfo(): void {
        const currentPlayer: Player = this.getCurrentPlayer();
        this.viewInfo.remainingPieces = [];
        const isPlayerTurn: boolean = this.isPlayerTurn();
        for (const piece of DiamPiece.PLAYER_PIECES) {
            const remaining: number = this.getState().getRemainingPiecesOf(piece);
            for (let y: number = 0; y < remaining; y++) {
                const foregroundClasses: string[] = [];
                if (this.isTopPieceOfReserveAndSelected(y, remaining, piece)) {
                    foregroundClasses.push('selected');
                }
                if (isPlayerTurn && y === remaining-1 && piece.owner === currentPlayer) {
                    // Only let the top piece be clickable
                    foregroundClasses.push('clickable-hover');
                }
                this.viewInfo.remainingPieces.push({
                    backgroundClasses: ['player' + piece.owner.value + (piece.otherPieceType ? '-alternate' : '')],
                    foregroundClasses,
                    y,
                    drawPosition: this.getDrawPositionRemainingPiece(piece, y),
                    actualPiece: piece,
                });
            }
        }
    }
    private isTopPieceOfReserveAndSelected(y: number, remainingPiecesOfThatType: number, piece: DiamPiece): boolean {
        if (this.selected.isPresent()) {
            const selected: Selected = this.selected.get();
            return selected.type === 'pieceFromReserve' &&
                selected.piece === piece &&
                y === remainingPiecesOfThatType-1;
        } else {
            return false;
        }
    }
    private getDrawPositionRemainingPiece(piece: DiamPiece, y: number): Coord {
        let x: number;
        if (piece.owner === Player.ZERO) {
            x = -100;
        } else {
            x = 600;
        }
        let initialY: number;
        if (piece.otherPieceType) {
            initialY = 100;
        } else {
            initialY = 450;
        }
        return new Coord(x, initialY).getNext(new Vector(0, -y*DiamComponent.PIECE_HEIGHT));
    }
    private getPieces(x: number): PieceInfo[] {
        const highestAlignment: MGPOptional<Coord> = this.rules.findHighestAlignment(this.getState());
        const isPlayerTurn: boolean = this.isPlayerTurn();
        const infos: PieceInfo[] = [];
        for (let y: number = 0; y < DiamState.HEIGHT; y++) {
            const piece: DiamPiece = this.getState().getPieceAtXY(x, y);
            const coord: Coord = new Coord(x, y);
            if (piece !== DiamPiece.EMPTY) {
                const foregroundClasses: string[] = [];
                if (this.pieceFromBoardIsSelected(x, y)) {
                    foregroundClasses.push('selected');
                }
                if (this.isVictory(x, y, highestAlignment)) {
                    foregroundClasses.push('victory-stroke');
                }
                if (isPlayerTurn && this.rules.pieceCanMove(this.getState(), coord)) {
                    foregroundClasses.push('clickable-hover');
                }
                infos.push({
                    backgroundClasses: ['player' + piece.owner.value + (piece.otherPieceType ? '-alternate' : '')],
                    foregroundClasses,
                    y,
                    drawPosition: this.getDrawPositionOnBoard(x, y),
                    actualPiece: piece,
                });
            }
        }
        return infos;
    }
    private pieceFromBoardIsSelected(x: number, y: number): boolean {
        if (this.selected.isPresent()) {
            const selected: Selected = this.selected.get();
            return selected.type === 'pieceFromBoard' &&
                selected.position.x === x &&
                selected.position.y === y;
        } else {
            return false;
        }
    }
    private isVictory(x: number, y: number, highestAlignment: MGPOptional<Coord>): boolean {
        if (highestAlignment.isPresent()) {
            const alignmentCoord: Coord = highestAlignment.get();
            return alignmentCoord.x % 4 === x % 4 && alignmentCoord.y === y;
        }
        return false;
    }
    private getDrawPositionOnBoard(x: number, y: number): Coord {
        return DiamComponent.CENTER[x].getNext(new Vector(0, -y*DiamComponent.PIECE_HEIGHT));
    }
    public cancelMoveAttempt(): void {
        this.selected = MGPOptional.empty();
        this.updateBoard();
    }
}
