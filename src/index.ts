import p5 from 'p5';

import Sketch from './sketch/index';

// eslint-disable-next-line no-new, new-cap
// noinspection JSPotentiallyInvalidConstructorUsage
new p5((s: p5) => new Sketch(s));
