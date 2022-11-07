import { Rule } from '../../types/Rule';

/**
 * The `Map` object that loads each rule when it's accessed.
 * @example
 * const rules = new LazyLoadingRuleMap([
 *     ["eqeqeq", () => require("eqeqeq")],
 *     ["semi", () => require("semi")],
 *     ["no-unused-vars", () => require("no-unused-vars")]
 * ]);
 *
 * rules.get("semi"); // call `() => require("semi")` here.
 */
class LazyLoadingRuleMap extends Map<string, (() => Rule) | Rule> {
  constructor(loaders: Array<[string, () => Rule]>) {
    super(loaders);

    // Disable this.set()
    Object.defineProperty(LazyLoadingRuleMap.prototype, 'set', {
      configurable: true,
      value: null,
    });
  }

  get(ruleName: string): Rule | undefined {
    const load = super.get(ruleName);

    if (typeof load === 'function') {
      return load();
    }
    return load;
  }

  * values(): IterableIterator<Rule> {
    for (const load of super.values()) {
      console.log('load', load);
      if (typeof load === 'function') {
        yield load();
      }
    }
  }

  * entries(): IterableIterator<[string, Rule]> {
    for (const [ruleId, load] of super.entries()) {
      if (typeof load === 'function') {
        yield [ruleId, load()];
      }
    }
  }

  /**
   * Call a function with each rule.
   * @param {Function} callbackFn The callback function.
   * @param {any} [thisArg] The object to pass to `this` of the callback function.
   * @returns {void}
   */
  forEach(callbackFn: Function, thisArg: any): void {
    for (const [ruleId, load] of super.entries()) {
      callbackFn.call(thisArg, typeof load === 'function' ? load() : load, ruleId, this);
    }
  }
}

// Forbid mutation.
Object.defineProperties(LazyLoadingRuleMap.prototype, {
  clear: { configurable: true, value: null },
  delete: { configurable: true, value: null },
  [Symbol.iterator]: {
    configurable: true,
    writable: true,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    value: LazyLoadingRuleMap.prototype.entries,
  },
});

export default LazyLoadingRuleMap;
