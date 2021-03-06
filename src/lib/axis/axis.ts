import {
  Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { easeCubicOut } from 'd3-ease';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition, Transition } from 'd3-transition';
import {
  debug,
  findByIndex,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,
  textVerticalAttrs,
} from '../core';

export interface ConfigureAxisFn {
  (axis: Axis<AxisDomain>): void;
}

export interface DataAxis {
  scale: AxisScale<AxisDomain>;
  title: string;
  subtitle: string;
  configureAxis: ConfigureAxisFn;
}

export function dataAxis(data: Partial<DataAxis>): DataAxis {
  return {
    scale: data.scale || scaleLinear().domain([0, 1]).range([0, 600]),
    title: data.title || '',
    subtitle: data.subtitle || '',
    configureAxis: data.configureAxis || (() => {}),
  };
}

export function axisLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return (
    axis(selection)
      .classed('axis-left', true)
      // .layout('display', 'grid')
      // .layout('grid-template', 'auto auto 1fr / auto auto')
      .layout('display', 'flex')
      .layout('flex-direction', 'row')
      .layout('justify-content', 'flex-start')
      .call(
        (s) =>
          s
            .selectAll<SVGTextElement, unknown>('.subtitle')
            .call((title) => textVerticalAttrs(title)) //.layout('grid-area', '2 / 1'))
      )
      .call((s) =>
        s
          .selectAll<SVGTextElement, unknown>('.title')
          .layout('margin-right', '0.5em')
          // .layout('grid-area', '1 / 1')
          .call((title) => textVerticalAttrs(title))
          .call((title) => textTitleAttrs(title))
          .raise()
      )
      .call((s) =>
        s
          .selectAll('.ticks-transform')
          // .layout('grid-area', '1 / 2 / 3')
          .layout('width', 'fit')
          .layout('height', '100%')
          .raise()
          .selectAll('.ticks')
          .layout('width', '100%')
          .layout('height', '100%')
          .layout('margin-left', '100%')
      )
      .on('render.axisleft', function (e, d) {
        axisLeftTransition(
          select<GElement, DataAxis>(this).transition('axis').duration(0).ease(easeCubicOut)
        );
      })
      .dispatch('render')
  );
}

export function axisLeftTransition<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  transition: Transition<GElement, Datum, PElement, PDatum>
): Transition<GElement, Datum, PElement, PDatum> {
  return transition.each((d, i, g) => {
    debug(`transition left axis on ${nodeToString(g[i])}`);
    const s = select(g[i]);
    const t = s.transition(transition);
    axisTransition(t, d3Axis(d3AxisLeft, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).attr('dominant-baseline', 'middle');
  });
}

export function axisBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return axis(selection)
    .classed('axis-bottom', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'column')
    .layout('align-items', 'flex-end')
    .call((s) => s.selectAll('.ticks-transform').layout('height', 'fit').layout('width', '100%'))
    .call((s) =>
      s
        .selectAll<SVGTextElement, unknown>('.title')
        .layout('margin-top', '0.5em')
        .call((title) => textHorizontalAttrs(title))
        .call((title) => textTitleAttrs(title))
    )
    .call((s) =>
      s.selectAll<SVGTextElement, unknown>('.subtitle').call((title) => textHorizontalAttrs(title))
    )
    .on('render.axisbottom', function (e, d) {
      axisBottomTransition(
        select<GElement, DataAxis>(this).transition('axis').duration(0).ease(easeCubicOut)
      );
    })
    .dispatch('render');
}

export function axisBottomTransition<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  transition: Transition<GElement, Datum, PElement, PDatum>
): Transition<GElement, Datum, PElement, PDatum> {
  return transition.each((d, i, g) => {
    debug(`transition bottom axis on ${nodeToString(g[i])}`);
    const s = select(g[i]);
    axisTransition(s.transition(transition), d3Axis(d3AxisBottom, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).attr('dominant-baseline', 'hanging');
  });
}

function axis<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('axis', true)
    .attr('font-size', '0.7em')
    .call((s) => s.append('g').classed('ticks-transform', true).append('g').classed('ticks', true))
    .call((s) => s.append('text').classed('title', true))
    .call((s) => s.append('text').classed('subtitle', true))
    .on(
      'render.axis-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.axis', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    );
}

function axisTransition<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  transition: Transition<GElement, Datum, PElement, PDatum>,
  axis: Axis<AxisDomain>,
  title: string,
  subtitle: string
): Transition<GElement, Datum, PElement, PDatum> {
  return transition
    .call((t) =>
      t
        .selectAll<SVGGElement, unknown>('.ticks')
        .call((ticks) => axis(ticks))
        .call((ticks) =>
          ticks
            .attr('fill', null)
            .attr('font-family', null)
            .attr('font-size', null)
            .call((t) => t.selectAll<SVGTextElement, unknown>('.tick text').attr('fill', null))
            .call((t) => t.selectAll('.domain').attr('fill', 'none'))
        )
    )
    .call((t) => t.selectAll<SVGGElement, unknown>('.title').text(title))
    .call((t) => t.selectAll<SVGGElement, unknown>('.subtitle').text(subtitle));
}

function d3Axis(
  axisGenerator: (scale: AxisScale<AxisDomain>) => Axis<AxisDomain>,
  data: DataAxis
): Axis<AxisDomain> {
  const axis = axisGenerator(data.scale);
  data.configureAxis(axis);
  return axis;
}

export function xyAttrsToTransformAttr(
  selection: SelectionOrTransition<Element, any, BaseType, any>
): void {
  selection
    .attr('transform', function () {
      return `translate(${this.getAttribute('x') || 0}, ${this.getAttribute('y') || 0})`;
    })
    .attr('x', null)
    .attr('y', null);
}

export function axisTickFindByIndex(container: Selection, index: number): Selection<SVGGElement> {
  return findByIndex<SVGGElement>(container, '.tick', index);
}

export function axisTickHighlight(tick: Selection, highlight: boolean): void {
  if (highlight) tick.attr('text-decoration', 'underline');
  else tick.attr('text-decoration', null);
}
