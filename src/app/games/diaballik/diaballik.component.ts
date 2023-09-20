import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { DefeatCoords, DiaballikRules, VictoryCoord, VictoryOrDefeatCoords } from './DiaballikRules';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { DiaballikTutorial } from './DiaballikTutorial';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';

@Component({
    selector: 'app-diaballik',
    templateUrl: './diaballik.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class DiaballikComponent extends GameComponent<DiaballikRules, DiaballikMove, DiaballikState, DiaballikState> {

    public board: Table<DiaballikPiece>;

    private currentSelection: MGPOptional<Coord> = MGPOptional.empty();
    private moveTranslations: [MGPOptional<Coord>, MGPOptional<Coord>] = [MGPOptional.empty(), MGPOptional.empty()];
    private movePass: MGPOptional<Coord> = MGPOptional.empty();

    private lastMoveCoords: Coord[] = [];
    private victoryCoord: MGPOptional<Coord> = MGPOptional.empty();
    private defeatCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.rules = DiaballikRules.get();
        this.node = this.rules.getInitialNode();
        this.encoder = DiaballikMove.encoder;
        this.tutorial = new DiaballikTutorial().tutorial;
        this.availableMinimaxes = [
            //new DiaballikMinimax(this.rules, 'Minimax'),
        ];
    }
    public updateBoard(): void {
        const state: DiaballikState = this.node.gameState;
        this.board = state.board;
        const victoryOrDefeatCoords: MGPOptional<VictoryOrDefeatCoords> = this.rules.getVictoryOrDefeatCoords(state);
        if (victoryOrDefeatCoords.isPresent()) {
            if (victoryOrDefeatCoords instanceof VictoryCoord) {
                this.victoryCoord = MGPOptional.of(victoryOrDefeatCoords.coord);
            } else if (victoryOrDefeatCoords instanceof DefeatCoords) {
                this.defeatCoords = victoryOrDefeatCoords.coords;
            }
        }
    }
    public override showLastMove(move: DiaballikMove): void {
        this.lastMoveCoords = [];
        for (const subMove of move.getSubMoves()) {
            this.lastMoveCoords.push(subMove.getStart(), subMove.getEnd());
        }
    }
    public override cancelMoveAttempt(): void {
        this.currentSelection = MGPOptional.empty();
        this.moveTranslations = [MGPOptional.empty(), MGPOptional.empty()];
        this.movePass = MGPOptional.empty();
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        if (this.lastMoveCoords.includes(coord)) {
            classes.push('last-move');
        }
        if (this.victoryCoord.equalsValue(coord)) {
            classes.push('victory-stroke');
        }
        if (this.defeatCoords.includes(coord)) {
            classes.push('captured-stroke');
        }
        return classes;
    }
    public getPieceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.lastMoveCoords.includes(coord)) {
            return ['last-move-stroke'];
        }
        return [];
    }
}
