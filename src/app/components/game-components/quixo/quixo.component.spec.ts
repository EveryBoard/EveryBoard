import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {AuthenticationService} from 'src/app/services/authentication/AuthenticationService';
import {ActivatedRoute} from '@angular/router';
import {AppModule} from 'src/app/app.module';
import {LocalGameWrapperComponent} from '../local-game-wrapper/local-game-wrapper.component';
import {JoueursDAO} from 'src/app/dao/joueurs/JoueursDAO';
import {JoueursDAOMock} from 'src/app/dao/joueurs/JoueursDAOMock';
import {QuixoComponent} from './quixo.component';
import {QuixoMove} from 'src/app/games/quixo/QuixoMove';
import {Orthogonal} from 'src/app/jscaip/DIRECTION';
import {Player} from 'src/app/jscaip/Player';
import {Coord} from 'src/app/jscaip/coord/Coord';
import {GameComponentUtils} from '../GameComponentUtils';
import {MGPValidation} from 'src/app/collectionlib/mgpvalidation/MGPValidation';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return 'Quixo';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({pseudo: null, verified: null}),

    getAuthenticatedUser: () => {
        return {pseudo: null, verified: null};
    },
};
describe('QuixoComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: QuixoComponent;

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    const doMove: (move: QuixoMove) => Promise<MGPValidation> = async (move: QuixoMove) => {
        return gameComponent.onBoardClick(move.coord.x, move.coord.y) &&
               await gameComponent.chooseDirection(move.direction.toString()); // TODO simulate clicks, not function call
    };
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ActivatedRoute, useValue: activatedRouteStub},
                {provide: JoueursDAO, useClass: JoueursDAOMock},
                {provide: AuthenticationService, useValue: authenticationServiceStub},
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as QuixoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('QuixoComponent should be created');
    });
    it('should style piece correctly', () => {
        expect(gameComponent.getPieceFill(Player.ZERO.value)).toBe('blue');
        expect(gameComponent.getPieceFill(Player.ONE.value)).toBe('red');

        gameComponent.chosenCoord = new Coord(0, 0);
        expect(gameComponent.getPieceStyle(0, 0)).toEqual({fill: 'lightgrey', stroke: 'grey'});

        gameComponent.lastMoveCoord = new Coord(4, 4);
        expect(gameComponent.getPieceStyle(4, 4)).toEqual({fill: 'lightgrey', stroke: 'orange'});
    });
    it('should give correct direction', () => {
        let possibleDirections: any[][];

        gameComponent.onBoardClick(0, 0);
        possibleDirections = gameComponent.getPossiblesDirections();
        expect(possibleDirections).toEqual([[2, 1, 'RIGHT'], [1, 2, 'DOWN']]);

        gameComponent.onBoardClick(4, 4);
        possibleDirections = gameComponent.getPossiblesDirections();
        expect(possibleDirections).toEqual([[0, 1, 'LEFT'], [1, 0, 'UP']]);
    });
    it('should cancel move when trying to select ennemy piece or center coord', async () => {
        const firstMove: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);

        const legal: MGPValidation = await doMove(firstMove);
        spyOn(gameComponent, 'message').and.callThrough();
        expect(legal.isSuccess()).toBeTrue();

        expect(gameComponent.onBoardClick(4, 0).isFailure()).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Cannot click on an ennemy piece (4, 0)');

        expect(gameComponent.onBoardClick(1, 1).isFailure()).toBeTrue();
        expect(gameComponent.message).toHaveBeenCalledWith('Unvalid coord (1, 1)');
    });
    it('should delegate triangleCoord calculation to GameComponentUtils', () => {
        spyOn(GameComponentUtils, 'getTriangleCoordinate').and.callThrough();
        gameComponent.onBoardClick(0, 2);
        gameComponent.getTriangleCoordinate(2, 1);
        expect(GameComponentUtils.getTriangleCoordinate).toHaveBeenCalledWith(0, 2, 2, 1);
    });
    it('should delegate decoding to move', () => {
        spyOn(QuixoMove, 'decode').and.callThrough();
        gameComponent.decodeMove(new QuixoMove(0, 0, Orthogonal.DOWN).encode());
        expect(QuixoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(QuixoMove, 'encode').and.callThrough();
        gameComponent.encodeMove(new QuixoMove(0, 0, Orthogonal.DOWN));
        expect(QuixoMove.encode).toHaveBeenCalledTimes(1);
    });
});
