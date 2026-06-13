import { MGPValidation } from '@everyboard/lib';

export type AnyFunction = (...args: unknown[]) => Promise<MGPValidation>;

export type MoveInterceptor = (fn: AnyFunction, clickNamer: ClickNamer) => AnyFunction;

export type ClickNamer = (...args: unknown[]) => string;

export const CLICK_HANDLERS: symbol = Symbol('clickHandlers');

/**
 * Method decorator used to register a click handler
 * inside a metadata map attached to the class prototype.
 *
 * Each decorated method is associated with a `ClickNamer`
 * stored in `target[CLICK_HANDLERS]`.
 *
 * Example:
 * ```ts
 * class MyComponent {
 *
 *   @ClickHandler(() => "save-button")
 *   onSaveClick(): void {
 *     console.log("Saved");
 *   }
 * }
 * ```
 *
 * Behavior:
 * - Initializes `target[CLICK_HANDLERS]` if it does not exist.
 * - Registers the decorated method (`key`) with its `clickNamer`.
 * - Returns the original property descriptor unchanged.
 *
 * @param clickNamer Function used to generate or resolve
 * the logical click name associated with the decorated method.
 *
 * @returns A TypeScript method decorator.
 */
export function ClickHandler(clickNamer: ClickNamer)
: (target: unknown, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
    /**
     * Decorator applied to the target method.
     *
     * @param target Prototype of the class containing the method.
     * @param key Name of the decorated method.
     * @param descriptor Property descriptor of the method.
     *
     * @returns The original property descriptor.
     */
    return function(target: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        // Initialize the click handlers collection if missing.
        target[CLICK_HANDLERS] ??= new Map<string, ClickNamer>();
        // Associate the method name with its ClickNamer.
        target[CLICK_HANDLERS].set(key, clickNamer);
        return descriptor;
    };
}
