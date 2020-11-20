import { BaseType, select, Selection } from 'd3-selection';
import debounce from 'debounce';
import { IComponent, IComponentConfig } from './component';
import { applyLayoutTransforms, computeLayout } from './layout/layout';

export interface IChart {
  root(root: IComponent<IComponentConfig>): this;
  root(): IComponent<IComponentConfig>;
  mount(containerSelector: string): this;
  update(): this;
}

export class Chart implements IChart {
  private _root: IComponent<IComponentConfig>;
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;

  mount(containerSelector: string): this {
    this._selection = select(containerSelector)
      .append('svg')
      .classed('chart', true)
      .style('width', '100%')
      .style('height', '100%');

    console.assert(
      !this._selection.empty(),
      `Couldn't mount chart under selector '${containerSelector}'`
    );

    this._root.applyConfig().mount(this._selection);

    const resize = () => {
      const bbox = this._selection.node()!.getBoundingClientRect();
      this._selection.attr('viewBox', `0, 0, ${bbox.width}, ${bbox.height}`);

      computeLayout(this._root.selection().node()!, bbox);

      this._root.resize().render(false);

      applyLayoutTransforms(this._root.selection().node()!);
    };

    const afterResize = () => {
      this._root.applyConfig();
      this.update();
    };

    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('resize', debounce(afterResize, 250));

    return this;
  }

  root(root: IComponent<IComponentConfig>): this;
  root(): IComponent<IComponentConfig>;
  root(root?: IComponent<IComponentConfig>): any {
    if (root === undefined) return this._root;
    this._root = root;
    // TODO: Handle changing after mount.
    return this;
  }

  update(): this {
    this._root.applyConfig();

    let bbox = this._selection.node()!.getBoundingClientRect();
    computeLayout(this._root.selection().node()!, bbox);

    this._root.resize().render(true);

    applyLayoutTransforms(this._root.selection().node()!);

    return this;
  }
}

export function chart(): Chart {
  return new Chart();
}
