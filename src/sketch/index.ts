import * as p5 from 'p5';
import * as utils from '../utils/index';
import { RadioElement } from '../types';

type MirrorType = 'concave' | 'convex';

type DragElement = 'circle-center' | 'circle-radius' | 'object';

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

  private objectXWidthPercent: number = 2 / 3;

  private objectYWidthPercent: number = 3 / 7;

  private get objectX(): number {
    return this.s.width * this.objectXWidthPercent;
  }

  private get objectY(): number {
    return this.s.height * this.objectYWidthPercent;
  }

  private draggedElement: DragElement | null = null;

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

      let focusX;
      let circleAxisCrossX;
      if (this.mirrorTypeRadio?.value() === 'concave') {
        focusX = this.circleX - this.circleRadius / 2;
        circleAxisCrossX = this.circleX - this.circleRadius;
      } else {
        focusX = this.circleX + this.circleRadius / 2;
        circleAxisCrossX = this.circleX + this.circleRadius;
      }

      let dragCandidateElement: DragElement | null = null;

      if (this.isInDragRange(this.objectX, this.objectY)) dragCandidateElement = 'object';
      else if (this.isInDragRange(circleAxisCrossX, this.s.height / 2)) dragCandidateElement = 'circle-radius';
      else if (this.isInDragRange(this.circleX, this.s.height / 2)) dragCandidateElement = 'circle-center';

      if (this.draggedElement === null && dragCandidateElement !== null && this.s.mouseIsPressed) this.draggedElement = dragCandidateElement;
      else if (this.draggedElement !== null && !this.s.mouseIsPressed) this.draggedElement = null;

      if (this.draggedElement === 'circle-center') {
        if (this.mirrorTypeRadio?.value() === 'concave') {
          this.concaveCircleXWidthPercent = Math.max(0.05, Math.min(0.95, this.s.mouseX / this.s.width));
        } else {
          this.convexCircleXWidthPercent = Math.max(0.05, Math.min(0.95, this.s.mouseX / this.s.width));
        }
      } else if (this.draggedElement === 'circle-radius') {
        if (this.mirrorTypeRadio?.value() === 'concave') {
          this.circleRadiusWidthPercent = Math.max(0.05, (this.circleX - Math.max(0.02 * this.s.width, this.s.mouseX)) / this.s.width);
        } else {
          this.circleRadiusWidthPercent = Math.max(0.05, (Math.min(0.98 * this.s.width, this.s.mouseX) - this.circleX) / this.s.width);
        }
      } else if (this.draggedElement === 'object') {
        this.objectXWidthPercent = Math.max(0.05, Math.min(0.95, this.s.mouseX / this.s.width));
        this.objectYWidthPercent = Math.max(0.05, Math.min(0.95, this.s.mouseY / this.s.height));
      }

      if (this.draggedElement) this.s.cursor('grabbing');
      else if (dragCandidateElement) this.s.cursor('grab');
      else this.s.cursor('auto');

      const dragHighlightElement: DragElement | null = this.draggedElement ?? dragCandidateElement;

      this.drawObject(dragHighlightElement === 'object');

      const reflectionPointX = this.getReflectionPointX(this.objectY);

      let canDraw = true;
      if (this.mirrorTypeRadio?.value() === 'concave' && this.objectX <= reflectionPointX + 4) canDraw = false;
      else if (this.mirrorTypeRadio?.value() === 'convex' && this.objectX < this.circleX + this.circleRadius + 4) canDraw = false;

      if (canDraw) {
        this.drawRays(this.objectX, this.objectY);
        this.drawImage();
      }

      this.drawPoint(this.circleX, this.s.height / 2, 'O', dragHighlightElement === 'circle-center');
      this.drawPoint(focusX, this.s.height / 2, 'F');
      this.drawPoint(circleAxisCrossX, this.s.height / 2, 'S', dragHighlightElement === 'circle-radius');
    };
  }

  private isInDragRange(x: number, y: number): boolean {
    return utils.distanceSquared(x, y, this.s.mouseX, this.s.mouseY) <= 16 ** 2;
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

  private getReflectionPointX(y: number): number {
    const triangleBase = Math.sqrt(this.circleRadius ** 2 - (this.s.height / 2 - y) ** 2);

    if (this.mirrorTypeRadio?.value() === 'concave') {
      return this.circleX - triangleBase;
    }
    return this.circleX + triangleBase;
  }

  private getCrossPointX(objectX: number): number {
    if (this.mirrorTypeRadio?.value() === 'concave') {
      return 1 / (
        1 / (this.circleRadius / 2)
        - 1 / (objectX - this.circleX + this.circleRadius)
      ) + this.circleX - this.circleRadius;
    }
    return this.circleX + this.circleRadius - 1 / (
      1 / (this.circleRadius / 2)
      + 1 / (objectX - this.circleX - this.circleRadius)
    );
  }

  private getConcaveScale(objectX : number, crossPointX: number): number {
    return (crossPointX - this.circleX + this.circleRadius) / (objectX - this.circleX + this.circleRadius);
  }

  private getConvexScale(objectX : number, crossPointX: number): number {
    return (this.circleX + this.circleRadius - crossPointX) / (objectX - this.circleX - this.circleRadius);
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

  private drawRays(x: number, y: number): void {
    this.drawParallelRay(x, y);
    this.drawSymmetricalRay(x, y);
    this.drawFocusRay(x, y);
  }

  private drawParallelRay(x: number, y: number): void {
    const reflectionPointX = this.getReflectionPointX(y);

    this.s.noFill();
    this.s.stroke('#1b5e20');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    this.s.line(x, y, reflectionPointX, y);

    let focusX;
    if (this.mirrorTypeRadio?.value() === 'concave') {
      focusX = this.circleX - this.circleRadius / 2;
    } else {
      focusX = this.circleX + this.circleRadius / 2;
    }

    const tan = (this.s.height / 2 - y) / (focusX - reflectionPointX);

    this.s.line(reflectionPointX, y, this.s.width, y + (this.s.width - reflectionPointX) * tan);

    this.dashedLine(reflectionPointX, y, 0, y - (reflectionPointX) * tan, 5);
  }

  private drawSymmetricalRay(x: number, y: number): void {
    this.s.noFill();
    this.s.stroke('#303f9f');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    let circleAxisCrossX;
    if (this.mirrorTypeRadio?.value() === 'concave') {
      circleAxisCrossX = this.circleX - this.circleRadius;
    } else {
      circleAxisCrossX = this.circleX + this.circleRadius;
    }

    this.s.line(x, y, circleAxisCrossX, this.s.height / 2);

    const tan = (y - this.s.height / 2) / (circleAxisCrossX - x);

    this.s.line(circleAxisCrossX, this.s.height / 2, this.s.width, this.s.height / 2 + (this.s.width - circleAxisCrossX) * tan);

    this.dashedLine(circleAxisCrossX, this.s.height / 2, 0, this.s.height / 2 - (circleAxisCrossX) * tan, 5);
  }

  private drawFocusRay(x: number, y: number): void {
    this.s.noFill();
    this.s.stroke('#d32f2f');
    this.s.strokeCap(this.s.SQUARE);
    this.s.strokeWeight(1);

    const crossPointX = this.getCrossPointX(x);
    let crossPointY: number;
    if (this.mirrorTypeRadio?.value() === 'concave') {
      const scale = this.getConcaveScale(x, crossPointX);
      crossPointY = (this.s.height / 2 - y) * scale + this.s.height / 2;
    } else {
      const scale = this.getConvexScale(x, crossPointX);
      crossPointY = (y - this.s.height / 2) * scale + this.s.height / 2;
    }
    const reflectionPointX = this.getReflectionPointX(crossPointY);

    this.s.line(reflectionPointX, crossPointY, this.s.width, crossPointY);
    this.dashedLine(0, crossPointY, reflectionPointX, crossPointY, 5);
    this.s.line(reflectionPointX, crossPointY, x, y);

    if (this.mirrorTypeRadio?.value() === 'convex') {
      const focusX = this.circleX + this.circleRadius / 2;
      this.s.stroke('#000');
      this.dashedLine(reflectionPointX, crossPointY, focusX, this.s.height / 2, 3);
    }
  }

  private drawObject(drag = false): void {
    this.s.fill(drag ? this.s.color('#fff') : this.s.color('#d84315'));
    this.s.stroke(this.s.color('#d84315'));
    this.s.strokeWeight(2);
    this.s.strokeCap(this.s.SQUARE);

    this.s.line(this.objectX, this.s.height / 2, this.objectX, this.objectY);
    if (this.s.height / 2 > this.objectY) {
      this.s.triangle(
        this.objectX - (drag ? 8 : 4),
        this.objectY + (drag ? 6 : 7),
        this.objectX,
        this.objectY - (drag ? 8 : 0),
        this.objectX + (drag ? 8 : 4),
        this.objectY + (drag ? 6 : 7),
      );
    } else {
      this.s.triangle(
        this.objectX + (drag ? 8 : 4),
        this.objectY - (drag ? 14 : 7),
        this.objectX,
        this.objectY + (drag ? 8 : 0),
        this.objectX - (drag ? 4 : 4),
        this.objectY - (drag ? 14 : 7),
      );
    }
  }

  private drawImage(): void {
    this.s.fill(this.s.color('#d84315'));
    this.s.stroke(this.s.color('#d84315'));
    this.s.strokeWeight(2);
    this.s.strokeCap(this.s.SQUARE);

    const crossPointX = this.getCrossPointX(this.objectX);
    let crossPointY: number;
    if (this.mirrorTypeRadio?.value() === 'concave') {
      const scale = this.getConcaveScale(this.objectX, crossPointX);
      crossPointY = (this.s.height / 2 - this.objectY) * scale + this.s.height / 2;
    } else {
      const scale = this.getConvexScale(this.objectX, crossPointX);
      crossPointY = (this.objectY - this.s.height / 2) * scale + this.s.height / 2;
    }

    this.dashedLine(crossPointX, this.s.height / 2, crossPointX, crossPointY, 3);
    if (this.s.height / 2 > crossPointY) {
      this.s.triangle(
        crossPointX - 4,
        crossPointY + 7,
        crossPointX,
        crossPointY,
        crossPointX + 4,
        crossPointY + 7,
      );
    } else {
      this.s.triangle(
        crossPointX + 4,
        crossPointY - 7,
        crossPointX,
        crossPointY,
        crossPointX - 4,
        crossPointY - 7,
      );
    }
  }

  private drawPoint(x: number, y: number, label: string, drag = false): void {
    this.s.noStroke();
    this.s.fill(this.s.color('#000'));
    this.s.text(label, x + 6, y - 6);

    if (drag) {
      this.s.fill(this.s.color('#fff'));
      this.s.stroke(this.s.color('#000'));
      this.s.strokeWeight(2);
      this.s.circle(x, y, 20);
    } else {
      this.s.circle(x, y, 8);
    }
  }
}
