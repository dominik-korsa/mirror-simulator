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
  private circleRadiusWidthPercent = 0.5;

  private get circleRadius(): number {
    return this.s.width * this.circleRadiusWidthPercent;
  }

  private concaveCircleXWidthPercent = 3 / 4;

  private convexCircleXWidthPercent = 1 / 4;

  private get circleX(): number {
    if (this.mirrorTypeRadio?.value() === 'concave') {
      return this.s.width * this.concaveCircleXWidthPercent;
    }
    return this.s.width * this.convexCircleXWidthPercent;
  }

  private s: p5;

  private canvas: p5.Renderer | undefined;

  private mirrorTypeRadio: MirrorTypeRadioElement | undefined;

  private get objectX(): number {
    return this.circleX;
  }

  private get objectY(): number {
    return this.s.height * (1 / 2) + 32;
  }

  constructor(s: p5) {
    this.s = s;

    this.s.setup = (): void => {
      const title = this.s.createElement('h1');
      title.html('Symulator zwierciadeł sferycznych');
      title.id('title');
      const subtitle = this.s.createElement('h3');
      subtitle.html('Przybliżenie dla promieni w pobliżu osi optycznej');
      subtitle.id('subtitle');

      this.canvas = this.s.createCanvas(this.s.windowWidth - 64, this.s.windowHeight - 256);
      this.canvas?.id('main-canvas');

      this.mirrorTypeRadio = this.s.createRadio() as MirrorTypeRadioElement;
      this.mirrorTypeRadio.id('mirror-type-radio');
      this.mirrorTypeRadio.option('Wklęsłe', 'concave');
      this.mirrorTypeRadio.option('Wypukłe', 'convex');
      this.mirrorTypeRadio.value('concave');
    };

    this.s.windowResized = (): void => {
      this.s.resizeCanvas(this.s.windowWidth - 64, this.s.windowHeight - 256);
    };

    this.s.draw = (): void => {
      this.s.background(this.s.color('#fafafa'));

      this.drawMirror();

      this.s.stroke(this.s.color('#444'));
      this.s.strokeWeight(1);
      this.dashedLine(0, this.s.height / 2, this.s.width, this.s.height / 2, 2);

      this.s.noStroke();
      this.s.fill(this.s.color('#000'));

      let focusX;
      if (this.mirrorTypeRadio?.value() === 'concave') {
        focusX = this.circleX - this.circleRadius / 2;
      } else {
        focusX = this.circleX + this.circleRadius / 2;
      }

      this.s.circle(this.circleX, this.s.height / 2, 6);
      this.s.text('O', this.circleX + 8, this.s.height / 2 - 8);

      this.s.circle(focusX, this.s.height / 2, 6);
      this.s.text('F', focusX + 8, this.s.height / 2 - 8);

      this.s.circle(
        this.mirrorTypeRadio?.value() === 'concave' ? this.circleX - this.circleRadius : this.circleX + this.circleRadius,
        this.s.height / 2,
        6,
      );
      this.s.text(
        'S',
        this.mirrorTypeRadio?.value() === 'concave' ? this.circleX - this.circleRadius + 8 : this.circleX + this.circleRadius + 8,
        this.s.height / 2 - 8,
      );

      this.drawConcaveRays(this.objectX, this.objectY);

      this.drawObject();
      this.drawImage();
    };
  }

  private drawMirror(): void {
    this.s.noFill();
    this.s.strokeCap(this.s.SQUARE);

    this.s.stroke(this.s.color('#64b5f6'));
    this.s.strokeWeight(8);
    if (this.mirrorTypeRadio?.value() === 'concave') {
      this.s.arc(
        this.circleX,
        this.s.height / 2,
        this.circleRadius * 2 + 9,
        this.circleRadius * 2 + 9,
        Math.PI * (2 / 3),
        Math.PI * (4 / 3),
      );
    } else {
      this.s.arc(
        this.circleX,
        this.s.height / 2,
        this.circleRadius * 2 - 9,
        this.circleRadius * 2 - 9,
        Math.PI * (5 / 3),
        Math.PI * (7 / 3),
      );
    }

    this.s.stroke(this.s.color('#1565c0'));
    this.s.strokeWeight(2);
    if (this.mirrorTypeRadio?.value() === 'concave') {
      this.s.arc(
        this.circleX,
        this.s.height / 2,
        this.circleRadius * 2,
        this.circleRadius * 2,
        Math.PI * (2 / 3),
        Math.PI * (4 / 3),
      );
    } else {
      this.s.arc(
        this.circleX,
        this.s.height / 2,
        this.circleRadius * 2,
        this.circleRadius * 2,
        Math.PI * (5 / 3),
        Math.PI * (7 / 3),
      );
    }
  }

  private getConcaveReflectionPointX(y: number): number {
    const triangleBase = Math.sqrt(this.circleRadius ** 2 - (this.s.height / 2 - y) ** 2);
    return this.circleX - triangleBase;
  }

  private getConcaveCrossPointX(objectX: number): number {
    return 1 / (1 / (this.circleRadius / 2) - 1 / (objectX - this.circleX + this.circleRadius)) + this.circleX - this.circleRadius;
  }

  private getConcaveScale(objectX : number, crossPointX: number): number {
    return (crossPointX - this.circleX + this.circleRadius) / (objectX - this.circleX + this.circleRadius);
  }

  private dashedLine(x1: number, y1: number, x2: number, y2: number, spacing: number): void {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const stepX = ((x2 - x1) / length) * spacing;
    const stepY = ((y2 - y1) / length) * spacing;

    const dashAndGapNumber = Math.ceil(length / spacing);

    for (let i = 0; i < Math.floor(dashAndGapNumber / 2); i += 1) {
      this.s.line(
        x1 + stepX * i * 2,
        y1 + stepY * i * 2,
        x1 + stepX * (i * 2 + 1),
        y1 + stepY * (i * 2 + 1),
      );
    }

    if (dashAndGapNumber % 2 === 1) {
      this.s.line(
        x1 + stepX * (dashAndGapNumber - 1),
        y1 + stepY * (dashAndGapNumber - 1),
        x2,
        y2,
      );
    }
  }

  private drawConcaveRays(x: number, y: number): void {
    this.drawConcaveParallelRay(x, y);
    this.drawConcaveSymmetricalRay(x, y);
    this.drawConcaveFocusRay(x, y);
  }

  private drawConcaveParallelRay(x: number, y: number): void {
    const reflectionPointX = this.getConcaveReflectionPointX(y);

    this.s.noFill();
    this.s.stroke('#1b5e20');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    this.s.line(x, y, reflectionPointX, y);

    const focusX = this.circleX - this.circleRadius / 2;

    const tan = (this.s.height / 2 - y) / (focusX - reflectionPointX);

    this.s.line(reflectionPointX, y, this.s.width, y + (this.s.width - reflectionPointX) * tan);

    this.dashedLine(reflectionPointX, y, 0, y - (reflectionPointX) * tan, 5);
  }

  private drawConcaveSymmetricalRay(x: number, y: number): void {
    this.s.noFill();
    this.s.stroke('#303f9f');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    this.s.line(x, y, this.circleX - this.circleRadius, this.s.height / 2);

    const tan = (y - this.s.height / 2) / (this.circleX - this.circleRadius - x);

    this.s.line(this.circleX - this.circleRadius, this.s.height / 2, this.s.width, this.s.height / 2 + (this.s.width - this.circleX + this.circleRadius) * tan);

    this.dashedLine(this.circleX - this.circleRadius, this.s.height / 2, 0, this.s.height / 2 - (this.circleX - this.circleRadius) * tan, 5);
  }

  private drawConcaveFocusRay(x: number, y: number): void {
    this.s.noFill();
    this.s.stroke('#d32f2f');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    const crossPointX = this.getConcaveCrossPointX(x);
    const scale = this.getConcaveScale(x, crossPointX);
    const crossPointY = (this.s.height / 2 - y) * scale + this.s.height / 2;
    const reflectionPointX = this.getConcaveReflectionPointX(crossPointY);

    this.s.line(reflectionPointX, crossPointY, this.s.width, crossPointY);
    this.dashedLine(0, crossPointY, reflectionPointX, crossPointY, 5);
    this.s.line(reflectionPointX, crossPointY, x, y);
  }

  private drawObject(): void {
    this.s.fill(this.s.color('#fff'));
    this.s.stroke(this.s.color('#d84315'));
    this.s.strokeWeight(2);
    this.s.strokeCap(this.s.SQUARE);

    this.s.line(this.objectX, this.s.height / 2, this.objectX, this.objectY);
    if (this.s.height / 2 > this.objectY) {
      this.s.triangle(
        this.objectX - 4,
        this.objectY + 7,
        this.objectX,
        this.objectY,
        this.objectX + 4,
        this.objectY + 7,
      );
    } else {
      this.s.triangle(
        this.objectX + 4,
        this.objectY - 7,
        this.objectX,
        this.objectY,
        this.objectX - 4,
        this.objectY - 7,
      );
    }
  }

  private drawImage(): void {
    this.s.fill(this.s.color('#fff'));
    this.s.stroke(this.s.color('#d84315'));
    this.s.strokeWeight(2);
    this.s.strokeCap(this.s.SQUARE);

    const concaveCrossPointX = this.getConcaveCrossPointX(this.objectX);
    const concaveScale = this.getConcaveScale(this.objectX, concaveCrossPointX);
    const concaveCrossPointY = (this.s.height / 2 - this.objectY) * concaveScale + this.s.height / 2;

    this.dashedLine(concaveCrossPointX, this.s.height / 2, concaveCrossPointX, concaveCrossPointY, 3);
    if (this.s.height / 2 > concaveCrossPointY) {
      this.s.triangle(
        concaveCrossPointX - 4,
        concaveCrossPointY + 7,
        concaveCrossPointX,
        concaveCrossPointY,
        concaveCrossPointX + 4,
        concaveCrossPointY + 7,
      );
    } else {
      this.s.triangle(
        concaveCrossPointX + 4,
        concaveCrossPointY - 7,
        concaveCrossPointX,
        concaveCrossPointY,
        concaveCrossPointX - 4,
        concaveCrossPointY - 7,
      );
    }
  }
}
