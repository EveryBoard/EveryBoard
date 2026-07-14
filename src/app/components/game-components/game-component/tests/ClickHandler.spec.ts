import { CLICK_HANDLERS, ClickHandler, ClickNamer } from '../ClickHandler';

describe('getOrCreateOwnClickHandlers with inheritance', () => {
    it('should copy handlers from parent prototype when child is decorated', () => {
        class Parent {
            @ClickHandler((): string => 'parent-click')
            public onParentClick(): void {
                // no-op
            }
        }

        class Child extends Parent {
            @ClickHandler((): string => 'child-click')
            public onChildClick(): void {
                // no-op
            }
        }

        const handlers: unknown = Reflect.get(Child.prototype, CLICK_HANDLERS);

        expect(handlers).toBeInstanceOf(Map);

        const typedHandlers: Map<string, ClickNamer> = handlers as Map<string, ClickNamer>;

        expect(typedHandlers.has('onParentClick')).toBe(true);
        expect(typedHandlers.has('onChildClick')).toBe(true);

        // Vérifie que la Map est bien "propre" à Child (pas partagée avec Parent)
        const parentHandlers: unknown = Reflect.get(Parent.prototype, CLICK_HANDLERS);
        const typedParentHandlers: Map<string, ClickNamer> = parentHandlers as Map<string, ClickNamer>;

        expect(typedParentHandlers.has('onParentClick')).toBe(true);
        expect(typedParentHandlers.has('onChildClick')).toBe(false);

        // Vérifie que les deux Maps sont des instances distinctes
        expect(typedHandlers).not.toBe(typedParentHandlers);
    });
});
