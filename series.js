/* globals d3: true */

(function() {
  'use strict';

  const n = 40;
  const timeFormat = '%H:%M:%S';
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40,
  };
  const random = d3.randomUniform(0, 1);
  const duration = 1000;

  const data = d3.range(n).map((d)=> {
    return 0;
  });

  const svg = d3.select('svg');
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  let time = Date.now();
  const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  const x = d3.scaleLinear().domain([0, n - 1]).range([0, width]);

  const x2Domain = (t) => {
    return [t, t + (n - 1) * duration];
  };

  const x2 = d3.scaleLinear().domain(x2Domain(time)).range([0, width]);
  const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  const line = d3.line()
      .x((d, i) => {
        return x(i);
      })
      .y((d, i) => {
        return y(d);
      });

  g.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

  const xAxis = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + y(0) + ')')
      .call(d3.axisBottom(x2)
          .tickFormat(d3.timeFormat(timeFormat))
      );

  const yAxis = g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y));

  g.append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(data)
      .attr('class', 'line')
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .on('start', tick);

  function tick() {
    time = time + duration;
    x2.domain(x2Domain(time));

    // Push a new data point onto the back.
    data.push(random());
    // data.push (time);
    y.domain([0, Math.max(1.0, d3.max(data))]);

    // Redraw the line.
    d3.select(this)
        .attr('d', line)
        .attr('transform', null);

    if (data.length > n) {
      data.shift();
    }
    d3.active(this)
        .attr('transform', 'translate(' + x(-1) + ',0)')
        .transition()
        .on('start', tick);

    xAxis
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(x2)
            .tickFormat(d3.timeFormat(timeFormat))
        );

    yAxis
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(y));
  }
})();
