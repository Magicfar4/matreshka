import defs from '../_core/defs';
import toArray from '../_helpers/toarray';
import dom from '../_dom';

const customSelectorReg = /\s*:bound\(([^(]*)\)\s*([\S\s]*)\s*|\s*:sandbox\s*([\S\s]*)\s*/;
const randomAttr = `${Math.random().toString().replace('0.', 'x')}y`; // x12345y

// the function selects nodes based on a selector (including custom values, eg :sandbox)
// TODO: selectNodes looks not good, it needs to be refactored and accelerated if possible
export default function selectNodes(object, givenSelector) {
    const { props } = defs.get(object);
    const selectors = givenSelector.split(',');
    let result = dom.$();

    nofn.forEach(selectors, (selector) => {
        const execResult = customSelectorReg.exec(selector);
        if (execResult) {
            const boundKey = execResult[3] !== undefined ? 'sandbox' : execResult[1];
            const subSelector = execResult[3] !== undefined ? execResult[3] : execResult[2];
            const propDef = props[boundKey];

            if (propDef) {
                const { bindings } = propDef;
                if (bindings) {
                    const boundNodes = Array(bindings.length);
                    nofn.forEach(bindings, (binding, i) => {
                        boundNodes[i] = binding.node;
                    });

                    // if native selector passed after :bound(KEY) is not empty string
                    // for example ":bound(KEY) .my-selector"
                    if (subSelector) {
                        // if native selector contains children selector
                        // for example ":bound(KEY) > .my-selector"
                        if (subSelector.indexOf('>') === 0) {
                            // selecting children
                            nofn.forEach(boundNodes, (node) => {
                                node.setAttribute(randomAttr, randomAttr);
                                const selected = node.querySelectorAll(
                                    `[${randomAttr}="${randomAttr}"] ${subSelector}`
                                );
                                result = result.add(toArray(selected));
                                node.removeAttribute(randomAttr);
                            });
                        } else {
                            // if native selector doesn't contain children selector
                            nofn.forEach(boundNodes, (node) => {
                                const selected = node.querySelectorAll(subSelector);
                                result = result.add(toArray(selected));
                            });
                        }
                    } else {
                        // if native selector is empty string just add bound nodes to result
                        result = result.add(boundNodes);
                    }
                }
            }
        } else {
            // if it's native selector (no custom things)
            result = result.add(selector);
        }
    });

    return result;
}
