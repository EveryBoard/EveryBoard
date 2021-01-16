import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { EpaminondasMove } from 'src/app/games/epaminondas/epaminondasmove/EpaminondasMove';
import { EpaminondasPartSlice } from 'src/app/games/epaminondas/epaminondaspartslice/EpaminondasPartSlice';
import { EpaminondasNode } from 'src/app/games/epaminondas/epaminondasrules/EpaminondasRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Player } from 'src/app/jscaip/player/Player';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { EpaminondasComponent } from './epaminondas.component';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Epaminondas';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('EpaminondasComponent:', () => {
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: EpaminondasComponent;

    const clickElement: (elementName: string) => Promise<boolean> = async (elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true; // TODO: would be nice to return wether or not cancelMove has been called for illegal/invalid move reason
        }
    };
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as EpaminondasComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('EpaminondasComponent should be created');
    });
    it('1. Should cancelMove when clicking on empty case at first', fakeAsync(async () => {
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_5_5')).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Cette case est vide, vous devez sélectionner une de vos pièces.');
    }));
    it('2. Should not accept ennemy click as a move first click', fakeAsync(async () => {
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_0_0')).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Cette pièce appartient à l\'ennemi, vous devez sélectionner une de vos pièces.');
    }));
    it('3. Should show possible next click (after first click)', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();

        expect(gameComponent.getRectStyle(0, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 11)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('4. Should cancel move when clicking on non aligned pice', fakeAsync(async () => {
        expect(await clickElement('#click_0_11')).toBeTrue();
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_2_10')).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Cette case n\'est pas alignée avec la pièce sélectionnée.');
    }));
    it('5. Should move firstPiece one step when clicking next to it without lastPiece selected', fakeAsync(async () => {
        expect(await clickElement('#click_0_10')).toBeTrue();
        spyOn(gameComponent, 'chooseMove');
        const oldSlice: EpaminondasPartSlice = gameComponent.rules.node.gamePartSlice;
        expect(await clickElement('#click_0_9')).toBeTrue();
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        expect(gameComponent.chooseMove).toHaveBeenCalledWith(move, oldSlice, null, null);
    }));
    it('6. Should not move single piece two step', fakeAsync(async () => {
        expect(await clickElement('#click_0_10')).toBeTrue();
        spyOn(gameComponent, 'cancelMove');
        expect(await clickElement('#click_0_8')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Une pièce seule ne peut se déplacer que d\'une case.');
    }));
    it('7. Should not allow single piece to capture', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_9')).toBeTrue();
        spyOn(gameComponent, 'cancelMove');
        expect(await clickElement('#click_0_8')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Une pièce seule ne peut pas capturer.');
    }));
    it('8. Should deselect first piece when clicked (and no last piece exist)', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        expect(await clickElement('#click_0_11')).toBeTrue();

        expect(gameComponent.getRectStyle(0, 11)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('9. Should cancel move when selecting non-contiguous soldier line', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_0_9')).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Une phalange ne peut pas contenir cases vides.');
    }));
    it('10. Should select all soldier between first selected and new click, and show valid extension and capture both way', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_0_7')).toBeTrue();

        expect(await clickElement('#click_0_5')).toBeTrue();

        expect(gameComponent.getRectStyle(0, 2)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 3)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 4)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 5)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 6)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 7)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 8)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).not.toEqual(gameComponent.CLICKABLE_STYLE);

        expect(gameComponent.message).not.toHaveBeenCalled();
    }));
    it('11. Should change first piece coord when clicked and last piece is neighboors', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue(); // select first piece
        expect(await clickElement('#click_0_10')).toBeTrue(); // select last piece neighboor

        expect(await clickElement('#click_0_11')).toBeTrue(); // deselect first piece
        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(-15, -1));
        expect(gameComponent.getRectStyle(0, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).toEqual(gameComponent.CLICKABLE_STYLE);

        expect(gameComponent.getRectStyle(1, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 11)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('12. Should change first piece coord when clicked and last piece exist but is not neighboors', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue(); // select first piece
        expect(await clickElement('#click_0_9')).toBeTrue(); // select last piece neighboor

        expect(await clickElement('#click_0_11')).toBeTrue(); // deselect first piece

        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(0, 9));
        expect(gameComponent.getRectStyle(0, 8)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 9)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).not.toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('13. Should change last piece coord when clicked and first piece is neighboors', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue(); // select first piece
        expect(await clickElement('#click_0_10')).toBeTrue(); // select last piece neighboor

        expect(await clickElement('#click_0_10')).toBeTrue(); // deselect last piece
        expect(gameComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(gameComponent.lastPiece).toEqual(new Coord(-15, -1));
        expect(gameComponent.getRectStyle(0, 9)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(0, 11)).not.toEqual(gameComponent.CLICKABLE_STYLE);

        expect(gameComponent.getRectStyle(1, 10)).toEqual(gameComponent.CLICKABLE_STYLE);
        expect(gameComponent.getRectStyle(1, 11)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('14. Should change last piece coord when clicked but first piece is not neighboors', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue(); // select first piece
        expect(await clickElement('#click_0_8')).toBeTrue(); // select last piece neighboor

        expect(await clickElement('#click_0_8')).toBeTrue(); // deselect last piece
        expect(gameComponent.firstPiece).toEqual(new Coord(0, 11));
        expect(gameComponent.lastPiece).toEqual(new Coord(0, 9));
        expect(gameComponent.getPieceStroke(0, 7)).toBeNull();
        expect(gameComponent.getPieceStroke(0, 8)).toBeNull();
        expect(gameComponent.getPieceStroke(0, 9)).toBe('yellow');
        expect(gameComponent.getPieceStroke(0, 10)).toBe('yellow');
        expect(gameComponent.getPieceStroke(0, 11)).toBe('yellow');
    }));
    it('15.a. Should cancelMove when third click is not aligned with last click', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        expect(await clickElement('#click_0_9')).toBeTrue();

        spyOn(gameComponent, 'cancelMove');
        expect(await clickElement('#click_1_7')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Cette case n\'est pas alignée avec la direction de la phalange.');
    }));
    it('15.b Should cancelMove when third click is not aligned with phalange direction', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        expect(await clickElement('#click_0_9')).toBeTrue();

        spyOn(gameComponent, 'cancelMove');
        expect(await clickElement('#click_2_9')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Cette case n\'est pas alignée avec la direction de la phalange.');
    }));
    it('16. Should cancelMove when third click is an invalid extension', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        expect(await clickElement('#click_0_9')).toBeTrue();

        spyOn(gameComponent, 'cancelMove');
        expect(await clickElement('#click_0_7')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Une phalange ne peut pas contenir de pièces ennemies.');
    }));
    it('17.a. Should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async () => {
        expect(await clickElement('#click_1_10')).toBeTrue();
        expect(await clickElement('#click_2_10')).toBeTrue();
        expect(gameComponent.firstPiece).toEqual(new Coord(1, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(2, 10));

        expect(await clickElement('#click_0_10')).toBeTrue();

        expect(gameComponent.firstPiece).toEqual(new Coord(2, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(0, 10));
    }));
    it('17.b. Should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async () => {
        expect(await clickElement('#click_0_10')).toBeTrue();
        expect(await clickElement('#click_1_10')).toBeTrue();
        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(1, 10));

        expect(await clickElement('#click_2_10')).toBeTrue();

        expect(gameComponent.firstPiece).toEqual(new Coord(0, 10));
        expect(gameComponent.lastPiece).toEqual(new Coord(2, 10));
    }));
    it('End: Should show last move when no move is ongoing (captures, left case, moved phallange)', fakeAsync(async () => {
        const initialBoard: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: EpaminondasPartSlice = new EpaminondasPartSlice(initialBoard, 0);
        gameComponent.rules.node = new EpaminondasNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        expect(await clickElement('#click_0_11')).toBeTrue();
        expect(await clickElement('#click_0_9')).toBeTrue();

        spyOn(gameComponent, 'chooseMove').and.callThrough();

        const oldSlice: EpaminondasPartSlice = gameComponent.rules.node.gamePartSlice;
        expect(await clickElement('#click_0_8')).toBeTrue();
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        expect(gameComponent.chooseMove).toHaveBeenCalledOnceWith(move, oldSlice, null, null);

        expect(gameComponent.getRectFill(0, 7)).toEqual(gameComponent.CAPTURED_FILL);
        expect(gameComponent.getRectFill(0, 8)).toEqual(gameComponent.CAPTURED_FILL);
        expect(gameComponent.getRectFill(0, 9)).toEqual(gameComponent.MOVED_FILL);
        expect(gameComponent.getRectFill(0, 10)).toEqual(gameComponent.MOVED_FILL);
        expect(gameComponent.getRectFill(0, 11)).toEqual(gameComponent.MOVED_FILL);
    }));
    it('should delegate decoding to move', () => {
        spyOn(EpaminondasMove, 'decode').and.callThrough();
        gameComponent.decodeMove(new EpaminondasMove(11, 0, 2, 1, Direction.UP).encode());
        expect(EpaminondasMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(EpaminondasMove, 'encode').and.callThrough();
        gameComponent.encodeMove(new EpaminondasMove(11, 0, 2, 1, Direction.UP));
        expect(EpaminondasMove.encode).toHaveBeenCalledTimes(1);
    });
});
