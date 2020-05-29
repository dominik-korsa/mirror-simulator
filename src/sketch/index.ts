import * as p5 from 'p5';
import * as utils from '../utils/index';

enum DragElement {
  dot
}

export default class Sketch {
  private x = 0;

  private y = 0;

  private width = 1100;

  private height = 600;

  private s: p5;

  private dragElement: DragElement | null = null;

  constructor(s: p5) {
    this.s = s;

    this.s.setup = (): void => {
      this.s.createCanvas(this.width, this.height);

      this.x = this.width / 4;
      this.y = this.height / 2;
    };

    this.s.draw = (): void => {
      this.s.background(this.s.color('#cfd8dc'));

      const dragCandidateElement = this.getDragCandidateElement();

      if ((this.dragElement ?? dragCandidateElement) !== null) {
        this.s.cursor('grab');
      } else {
        this.s.cursor('default');
      }

      this.drawMirror();

      [-45, -22.5, 0, 22.5, 45].forEach((deg) => {
        this.drawReflectionLine(deg);
        this.drawExtensionLine(deg);
        this.drawBaseLine(deg);
      });

      this.drawDot((this.dragElement ?? dragCandidateElement) === DragElement.dot);

      this.drawExtensionDot();
    };

    this.s.mousePressed = (): void => {
      const dragCandidateElement = this.getDragCandidateElement();
      if (dragCandidateElement !== null) {
        this.dragElement = dragCandidateElement;
      }
    };

    this.s.mouseReleased = (): void => {
      this.dragElement = null;
    };
  }

  private getDragCandidateElement(): DragElement | null {
    if (utils.distanceSquared(this.x, this.y, this.s.mouseX, this.s.mouseY) <= 16 ** 2) {
      return DragElement.dot;
    }

    return null;
  }

  private drawMirror(): void {
    this.s.noStroke();

    this.s.fill(this.s.color('#64b5f6'));
    this.s.rect(this.width / 2 + 1, 0, 8, this.height);

    this.s.fill(this.s.color('#1565c0'));
    this.s.rect(this.width / 2 - 1, 0, 2, this.height);
  }

  private drawDot(drag: boolean): void {
    this.s.fill(this.s.color('#f44336'));

    if (drag) {
      this.s.stroke(this.s.color('#03a9f4'));
      this.s.strokeWeight(2);
    } else {
      this.s.noStroke();
    }

    this.s.ellipse(this.x, this.y, drag ? 16 : 8, drag ? 16 : 8);

    if (this.dragElement === DragElement.dot) {
      this.x = Math.max(16, Math.min(this.s.mouseX, this.width / 2 - 16));
      this.y = Math.max(16, Math.min(this.s.mouseY, this.height - 16));
    }
  }

  private drawExtensionDot(): void {
    this.s.noStroke();
    this.s.fill(this.s.color('#f44336'));
    this.s.ellipse(this.width - this.x, this.y, 8, 8);
  }

  private drawBaseLine(deg: number): void {
    const tan = Math.tan((Math.PI / 180) * deg);

    this.s.stroke(this.s.color('#000'));
    this.s.strokeWeight(1);

    this.s.line(this.x, this.y, this.width / 2, this.y + (this.width / 2 - this.x) * tan);
  }

  private drawExtensionLine(deg: number): void {
    const tan = Math.tan((Math.PI / 180) * deg);

    this.s.stroke(this.s.color('#673ab7'));
    this.s.strokeWeight(1);

    this.s.line(this.width / 2, this.y + (this.width / 2 - this.x) * tan, this.width, this.y - this.x * tan);
  }

  private drawReflectionLine(deg: number): void {
    const tan = Math.tan((Math.PI / 180) * deg);

    // this.s.stroke(this.s.color('#009688'));
    this.s.stroke(this.s.color('#333'));
    this.s.strokeWeight(1);

    this.s.line(this.width / 2, this.y + (this.width / 2 - this.x) * tan, 0, this.y + (this.width - this.x) * tan);
  }
}
