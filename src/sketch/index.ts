import * as p5 from 'p5';

export default class Sketch {
  private x = 0;

  private y = 0;

  private width = 1100;

  private height = 500;

  private s: p5;

  constructor(s: p5) {
    this.s = s;

    this.s.setup = (): void => {
      this.s.createCanvas(this.width, this.height);

      this.x = s.random(this.width / 4);
      this.y = this.height / 2;
    };

    this.s.draw = (): void => {
      this.s.background(this.s.color('#cfd8dc'));

      // const dragElement = null;

      this.drawMirror();
      this.drawDot(true);
    };
  }

  private drawMirror(): void {
    this.s.noStroke();

    this.s.fill(this.s.color('#64b5f6'));
    this.s.rect(this.width / 2 + 1, 32, 8, this.height - 64);

    this.s.fill(this.s.color('#1565c0'));
    this.s.rect(this.width / 2 - 1, 32, 2, this.height - 64);
  }

  private drawDot(drag: boolean): void {
    this.s.fill(this.s.color(255, 0, 0));
    this.s.ellipse(this.x, this.y, drag ? 16 : 8, drag ? 16 : 8);

    if (this.s.mouseIsPressed) {
      this.x = Math.max(8, Math.min(this.s.mouseX, this.width / 2 - 8));
      this.y = Math.max(8, Math.min(this.s.mouseY, this.height - 8));
    }
  }
}
