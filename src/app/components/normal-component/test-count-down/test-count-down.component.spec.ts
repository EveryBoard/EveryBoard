import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCountDownComponent } from './test-count-down.component';

describe('TestCountDownComponent', () => {
    let component: TestCountDownComponent;
    let fixture: ComponentFixture<TestCountDownComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [
                TestCountDownComponent,
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(TestCountDownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
