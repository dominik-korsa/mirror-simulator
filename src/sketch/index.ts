import * as p5 from 'p5';
// import * as utils from '../utils/index';
import { RadioElement } from '../types';

type MirrorType = 'concave' | 'convex';

interface MirrorTypeRadioElement extends RadioElement {
  option(label: string, value: MirrorType | undefined): HTMLInputElement;
  value(value: MirrorType): RadioElement;
  value(): MirrorType;
}

export default class Sketch {
  private radius = 250;

  private s: p5;

  // private mirrorType: MirrorType = 'convex';

  private canvas: p5.Renderer | undefined;

  private mirrorTypeRadio: MirrorTypeRadioElement | undefined;

  constructor(s: p5) {
    this.s = s;

    this.s.setup = (): void => {
      this.canvas = this.s.createCanvas(this.s.windowWidth - 64, this.s.windowHeight - 256);
      this.canvas?.id('main-canvas');

      this.mirrorTypeRadio = this.s.createRadio() as MirrorTypeRadioElement;
      this.mirrorTypeRadio.option('Wklęsłe', 'convex');
      this.mirrorTypeRadio.option('Wypukłe', 'concave');
      this.mirrorTypeRadio.value('convex');
    };

    this.s.windowResized = (): void => {
      this.s.resizeCanvas(this.s.windowWidth - 64, this.s.windowHeight - 256);
    };

    this.s.draw = (): void => {
      this.s.background(this.s.color('#cfd8dc'));

      this.drawMirror();

      this.s.stroke(this.s.color('#444'));
      this.s.strokeWeight(1);
      this.s.line(0, this.s.height / 2, this.s.width, this.s.height / 2);

      this.s.noStroke();
      this.s.fill(this.s.color('#000'));

      let radiusCenterX;
      let focusX;
      if (this.mirrorTypeRadio?.value() === 'concave') {
        radiusCenterX = this.s.width * (2 / 3);
        focusX = radiusCenterX - this.radius / 2;
      } else {
        radiusCenterX = this.s.width * (1 / 3);
        focusX = radiusCenterX + this.radius / 2;
      }

      this.s.circle(radiusCenterX, this.s.height / 2, 6);
      this.s.text('O', radiusCenterX + 8, this.s.height / 2 - 8);

      this.s.circle(focusX, this.s.height / 2, 6);
      this.s.text('F', focusX + 8, this.s.height / 2 - 8);
    };
  }

  private drawMirror(): void {
    this.s.noFill();
    this.s.strokeCap(this.s.SQUARE);

    this.s.stroke(this.s.color('#64b5f6'));
    this.s.strokeWeight(8);
    if (this.mirrorTypeRadio?.value() === 'concave') {
      this.s.arc(
        this.s.width * (2 / 3),
        this.s.height / 2,
        this.radius * 2 + 9,
        this.radius * 2 + 9,
        Math.PI * (2 / 3),
        Math.PI * (4 / 3),
      );
    } else {
      this.s.arc(
        this.s.width * (1 / 3),
        this.s.height / 2,
        this.radius * 2 - 9,
        this.radius * 2 - 9,
        Math.PI * (5 / 3),
        Math.PI * (7 / 3),
      );
    }

    this.s.stroke(this.s.color('#1565c0'));
    this.s.strokeWeight(2);
    if (this.mirrorTypeRadio?.value() === 'concave') {
      this.s.arc(
        this.s.width * (2 / 3),
        this.s.height / 2,
        this.radius * 2,
        this.radius * 2,
        Math.PI * (2 / 3),
        Math.PI * (4 / 3),
      );
    } else {
      this.s.arc(
        this.s.width * (1 / 3),
        this.s.height / 2,
        this.radius * 2,
        this.radius * 2,
        Math.PI * (5 / 3),
        Math.PI * (7 / 3),
      );
    }
  }
}
