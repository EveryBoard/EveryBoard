import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { DidacticialGameCreationComponent } from './didacticial-game-creation.component';

describe('DidacticialGameCreationComponent', () => {
    let component: DidacticialGameCreationComponent;
    let fixture: ComponentFixture<DidacticialGameCreationComponent>;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = fixture.debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        }
    };
    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                DidacticialGameCreationComponent,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(DidacticialGameCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create and redirect to chosen game', fakeAsync(async() => {
        component.pickGame('whateverGame');
        spyOn(component.router, 'navigate');
        expect(await clickElement('#launchDidacticial')).toBeTrue();
        expect(component.router.navigate).toHaveBeenCalledOnceWith(['didacticial/whateverGame']);
    }));
});
