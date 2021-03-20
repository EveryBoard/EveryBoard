import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { DidacticialGameCreationComponent } from './didacticial-game-creation.component';

class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return true;
    }
}
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
            declarations: [
                DidacticialGameCreationComponent,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: Router, useClass: RouterMock },
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
