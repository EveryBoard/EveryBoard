import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { GipfNode } from 'src/app/games/gipf/gipf-rules/GipfRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Player } from 'src/app/jscaip/player/Player';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { GipfComponent } from './gipf.component';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Gipf';
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
xdescribe('GipfComponent:', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: GipfComponent;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
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
        gameComponent = wrapper.gameComponent as GipfComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('GipfComponent should be created');
    });
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        spyOn(gameComponent, 'chooseMove');
        const oldSlice: GipfPartSlice = gameComponent.rules.node.gamePartSlice;
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(-3, 1), MGPOptional.empty(), false), [], []);
        expect(await clickElement('#click_-3_1')).toBeTrue();
        expect(gameComponent.chooseMove).toHaveBeenCalledWith(move, oldSlice, null, null);
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_0_0')).toBeTrue();
        expect(gameComponent.message)
            .toHaveBeenCalledWith('Les pièces doivent être placée sur une case du bord du plateau');
    }));
    it('should show possible directions after selecting an occupied placement coord', fakeAsync(async() => {
        expect(await clickElement('#click_3_0')).toBeTrue();
        //expect(gameComponent.getHighlightStyle(2, 0)).toEqual(gameComponent.CLICKABLE_STYLE);
        //expect(gameComponent.getHighlightStyle(2, 1)).toEqual(gameComponent.CLICKABLE_STYLE);
        //expect(gameComponent.getHighlightStyle(3, -1)).toEqual(gameComponent.CLICKABLE_STYLE);
    }));
    it('should not accept selecting something else than one of the proposed direction', fakeAsync(async() => {
        spyOn(gameComponent, 'message');
        expect(await clickElement('#click_3_0')).toBeTrue();
        expect(await clickElement('#click_0_0')).toBeTrue();
        expect(gameComponent.message)
            .toHaveBeenCalledWith('Veuillez sélectionner une destination à une distance de 1 de l\'entrée');
    }));
    it('should cancel move when clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        // TODO: setup initial board with an initial capture
        // TODO: 
    }));
    it('should capture upon selection of a capture', fakeAsync(async() => {
        // TODO
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        // TODO
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        // TODO
    }));
    it('should update the number of pieces available upon placement', fakeAsync(async() => {
        // TODO
    }));
    it('should update the number of pieces available upon capture', fakeAsync(async() => {
        // TODO
    }));

});
