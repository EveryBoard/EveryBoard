import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MinimaxTestingComponent } from './minimax-testing.component';

describe('MinimaxTestingComponent', () => {

    let component: MinimaxTestingComponent;

    let fixture: ComponentFixture<MinimaxTestingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MinimaxTestingComponent ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(MinimaxTestingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});