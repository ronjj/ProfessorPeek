import { createHotContext, updateStyle, removeStyle } from '../node_modules/vite/dist/client/client.mjs.js';

import.meta.hot = createHotContext("/src/index.css.js");const __vite__id = "/Users/ronaldjabouin/Documents/ProfessorPeek/ProfPeekReact/src/index.css";
const __vite__css = "#crx-root {\n  position: fixed;\n  top: 3rem;\n  left: 50%;\n  transform: translate(-50%, 0);\n}\n\n#crx-root button {\n  background-color: rgb(239, 239, 239);\n  border-color: rgb(118, 118, 118);\n  border-image: initial;\n  border-style: outset;\n  border-width: 2px;\n  margin: 0;\n  padding: 1px 6px;\n}";
updateStyle(__vite__id, __vite__css);
import.meta.hot.accept();
import.meta.hot.prune(() => removeStyle(__vite__id));

export { __vite__css as default };
