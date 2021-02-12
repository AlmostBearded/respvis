export * from './colors';
export * as utils from './utils';
// export * from './array';

export { v4 as uuid } from 'uuid';

export * from './scales';

export * from './component';
export * from './base-component';

export * from './components/svg-component';
export * from './components/group-component';
export * from './components/text-component';
export * from './components/rect-component';
export * from './components/grid-component';
export * from './components/defs-component';
export * from './components/clip-path-component';

export * from './utility/title-text-attributes';
export * from './utility/vertical-text-attributes';

export * from './chart';

// todo: solve Rect naming conflict (maybe namespaces?)
export * from './rect';

import 'd3-transition';
