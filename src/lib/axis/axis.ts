import { Selection, select, BaseType } from 'd3-selection';
import { axisLeft, axisBottom, axisTop, axisRight, AxisScale, Axis } from 'd3-axis';
import { nullFunction } from '../utils';
import { Component } from '../component';
import { Layout } from '../layout/layout';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

const classByPosition = new Map<Position, string>();
classByPosition.set(Position.Left, 'left-axis');
classByPosition.set(Position.Bottom, 'bottom-axis');
classByPosition.set(Position.Top, 'top-axis');
classByPosition.set(Position.Right, 'right-axis');

const axisFunctionByPosition = new Map<Position, (scale: AxisScale<unknown>) => Axis<unknown>>();
axisFunctionByPosition.set(Position.Left, axisLeft);
axisFunctionByPosition.set(Position.Bottom, axisBottom);
axisFunctionByPosition.set(Position.Top, axisTop);
axisFunctionByPosition.set(Position.Right, axisRight);

export function axis(): Component {
  let _scale: AxisScale<unknown>;
  let _position: Position = Position.Left;
  let _title: string = '';
  let _updateScale = nullFunction;
  let _updatePosition = nullFunction;
  let _updateTitle = nullFunction;
  let _resize: (layout: Layout) => void;

  function renderedAxis(selection: Selection<SVGElement, unknown, BaseType, unknown>) {
    const axisSelection = selection
      .append('g')
      .classed('axis', true)
      .classed(classByPosition.get(_position)!, true);
    axisSelection.call(renderTitle, _title);
    axisSelection.call(renderTicks);

    function renderTicks(selection: Selection<SVGElement, unknown, BaseType, unknown>) {
      switch (_position) {
        case Position.Bottom:
          selection.call(renderBottomTicks, _scale);
          break;
        case Position.Left:
          selection.call(renderLeftTicks, _scale);
          break;
      }
    }

    _resize = function (layout: Layout) {
      axisSelection.call(renderTicks);
    };
    _updateScale = function () {};
    _updatePosition = function () {};
    _updateTitle = function () {};
  }

  renderedAxis.scale = function scale(scale?: AxisScale<unknown>) {
    if (!arguments.length) return _scale;
    console.assert(scale, 'Cannot set scale to an invalid value');
    _scale = scale!;
    _updateScale();
    return renderedAxis;
  };

  renderedAxis.position = function position(position?: Position) {
    if (!arguments.length) return _position;
    _position = position || Position.Left;
    _updatePosition();
    return renderedAxis;
  };

  renderedAxis.title = function title(title?: string) {
    if (!arguments.length) return _title;
    _title = title || '';
    _updateTitle();
    return renderedAxis;
  };

  renderedAxis.resize = function resize(layout: Layout): void {
    _resize(layout);
  };

  return renderedAxis;
}

function renderTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  position: Position,
  scale: AxisScale<unknown>
): void {
  selection
    .selectAll('.ticks')
    .data([null])
    .join('g')
    .classed('ticks', true)
    .call(axisFunctionByPosition.get(position)!(scale))
    .attr('font-size', null)
    .attr('font-family', null)
    .attr('text-anchor', null)
    .attr('fill', null)
    .call((ticksSelection) => ticksSelection.selectAll('text').attr('dy', null))
    .call((ticksSelection) => ticksSelection.select('.domain').attr('stroke', null))
    .call((ticksSelection) =>
      ticksSelection
        .selectAll('.tick')
        .attr('opacity', null)
        .call((tick) => tick.select('line').attr('stroke', null))
        .call((tick) => tick.select('text').attr('fill', null))
    );
}

function renderLeftTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Left, scale)
    .selectAll('.ticks')
    .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

function renderBottomTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection.call(renderTicks, Position.Bottom, scale);
}

function clearTickAttributes(selection: Selection<SVGElement, unknown, BaseType, unknown>): void {
  selection
    .select('.ticks')
    .attr('transform', 'translate(0, 0)')
    .call(function (ticksSelection) {
      ticksSelection.selectAll('line').attr('x2', 0).attr('y2', 0);
    })
    .call(function (ticksSelection) {
      ticksSelection.selectAll('text').attr('x', 0).attr('y', 0);
    });
}

function renderTitle(selection: Selection<SVGElement, unknown, BaseType, unknown>, title: string) {
  selection.selectAll('.title').data([null]).join('text').classed('title', true).text(title);
}
