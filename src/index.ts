import * as p5 from 'p5';
import 'p5/lib/addons/p5.sound';

import Sketch from './sketch/index';

// eslint-disable-next-line no-new, new-cap
new p5((s: p5) => new Sketch(s));
