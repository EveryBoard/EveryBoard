import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { AbaloneComponent } from 'src/app/games/abalone/abalone.component';
import { ApagosComponent } from 'src/app/games/apagos/apagos.component';
import { AwaleComponent } from 'src/app/games/awale/awale.component';
import { BrandhubComponent } from 'src/app/games/tafl/brandhub/brandhub.component';
import { CoerceoComponent } from 'src/app/games/coerceo/coerceo.component';
import { DiamComponent } from 'src/app/games/diam/diam.component';
import { DvonnComponent } from 'src/app/games/dvonn/dvonn.component';
import { EncapsuleComponent } from 'src/app/games/encapsule/encapsule.component';
import { EpaminondasComponent } from 'src/app/games/epaminondas/epaminondas.component';
import { GipfComponent } from 'src/app/games/gipf/gipf.component';
import { GoComponent } from 'src/app/games/go/go.component';
import { KamisadoComponent } from 'src/app/games/kamisado/kamisado.component';
import { LinesOfActionComponent } from 'src/app/games/lines-of-action/lines-of-action.component';
import { P4Component } from 'src/app/games/p4/p4.component';
import { PentagoComponent } from 'src/app/games/pentago/pentago.component';
import { PylosComponent } from 'src/app/games/pylos/pylos.component';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { QuixoComponent } from 'src/app/games/quixo/quixo.component';
import { ReversiComponent } from 'src/app/games/reversi/reversi.component';
import { SaharaComponent } from 'src/app/games/sahara/sahara.component';
import { SiamComponent } from 'src/app/games/siam/siam.component';
import { SixComponent } from 'src/app/games/six/six.component';
import { TablutComponent } from 'src/app/games/tafl/tablut/tablut.component';
import { YinshComponent } from 'src/app/games/yinsh/yinsh.component';

describe('TutorialGameWrapperComponent (games)', () => {

    let wrapper: TutorialGameWrapperComponent;

    it('Abalone', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<AbaloneComponent> =
            await ComponentTestUtils.forGame<AbaloneComponent>('Abalone', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Apagos', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<ApagosComponent> =
            await ComponentTestUtils.forGame<ApagosComponent>('Apagos', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Awale', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<AwaleComponent> =
            await ComponentTestUtils.forGame<AwaleComponent>('Awale', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Brandhub', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<BrandhubComponent> =
            await ComponentTestUtils.forGame<BrandhubComponent>('Brandhub', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Coerceo', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<CoerceoComponent> =
            await ComponentTestUtils.forGame<CoerceoComponent>('Coerceo', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Diam', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<DiamComponent> =
            await ComponentTestUtils.forGame<DiamComponent>('Diam', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Dvonn', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<DvonnComponent> =
            await ComponentTestUtils.forGame<DvonnComponent>('Dvonn', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Encapsule', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<EncapsuleComponent> =
            await ComponentTestUtils.forGame<EncapsuleComponent>('Encapsule', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Epaminondas', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<EpaminondasComponent> =
            await ComponentTestUtils.forGame<EpaminondasComponent>('Epaminondas', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Gipf', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<GipfComponent> =
            await ComponentTestUtils.forGame<GipfComponent>('Gipf', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Go', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<GoComponent> =
            await ComponentTestUtils.forGame<GoComponent>('Go', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Kamisado', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<KamisadoComponent> =
            await ComponentTestUtils.forGame<KamisadoComponent>('Kamisado', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('LinesOfAction', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<LinesOfActionComponent> =
            await ComponentTestUtils.forGame<LinesOfActionComponent>('LinesOfAction', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('P4', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<P4Component> =
            await ComponentTestUtils.forGame<P4Component>('P4', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Pentago', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<PentagoComponent> =
            await ComponentTestUtils.forGame<PentagoComponent>('Pentago', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Pylos', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<PylosComponent> =
            await ComponentTestUtils.forGame<PylosComponent>('Pylos', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Quarto', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<QuartoComponent> =
            await ComponentTestUtils.forGame<QuartoComponent>('Quarto', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Quixo', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<QuixoComponent> =
            await ComponentTestUtils.forGame<QuixoComponent>('Quixo', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Reversi', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<ReversiComponent> =
            await ComponentTestUtils.forGame<ReversiComponent>('Reversi', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Sahara', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<SaharaComponent> =
            await ComponentTestUtils.forGame<SaharaComponent>('Sahara', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Siam', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<SiamComponent> =
            await ComponentTestUtils.forGame<SiamComponent>('Siam', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Six', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<SixComponent> =
            await ComponentTestUtils.forGame<SixComponent>('Six', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Tablut', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<TablutComponent> =
            await ComponentTestUtils.forGame<TablutComponent>('Tablut', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
    it('Yinsh', fakeAsync(async() => {
        const componentTestUtils: ComponentTestUtils<YinshComponent> =
            await ComponentTestUtils.forGame<YinshComponent>('Yinsh', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
        expect(wrapper).toBeTruthy();
    }));
});
