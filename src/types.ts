import * as p5 from 'p5';

export interface RadioElement extends p5.Element {
  option(label: string, value: string | number | undefined): HTMLInputElement;
}
