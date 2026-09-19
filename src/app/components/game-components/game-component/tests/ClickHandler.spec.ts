import { CLICK_HANDLERS, ClickHandler, ClickNamer } from '../ClickHandler';

describe('getOrCreateOwnClickHandlers with inheritance', () => {
    it('should copy handlers from parent prototype when child is decorated', () => {
        // Given a pair of class, the parent and its child
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

        // When putting a click handler on the children
        const childHandlers: unknown = Reflect.get(Child.prototype, CLICK_HANDLERS);

        // Then it should ONLY belong to the children
        expect(childHandlers).toBeInstanceOf(Map);

        const typedChildHandlers: Map<string, ClickNamer> = childHandlers as Map<string, ClickNamer>;

        expect(typedChildHandlers.has('onParentClick')).toBe(true);
        expect(typedChildHandlers.has('onChildClick')).toBe(true);

        // Verifies that the map strictly belongs to the child and not its parent
        const parentHandlers: unknown = Reflect.get(Parent.prototype, CLICK_HANDLERS);
        const typedParentHandlers: Map<string, ClickNamer> = parentHandlers as Map<string, ClickNamer>;
        expect(typedParentHandlers.has('onParentClick')).toBe(true);
        expect(typedParentHandlers.has('onChildClick')).toBe(false);
        // Verifies that the two maps are distinct instances
        expect(typedChildHandlers).not.toBe(typedParentHandlers);
    });
});
