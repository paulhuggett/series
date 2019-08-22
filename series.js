/* globals d3: true */

(function() {
  'use strict';

  const n = 20;
  const timeFormat = '%H:%M:%S';
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40,
  };
  const random = d3.randomUniform(0, 1);
  const duration = 1000;

  const xDomain = (t) => {
    return [t - ((n - 1) * duration), t - duration];
  };

  const data = [];

  const svg = d3.select('svg');
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;

  const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear()
      .domain(xDomain(Date.now()))
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

  const line = d3.line()
      .x((d, i) => {
        return x(d.time);
      })
      .y((d, i) => {
        return y(d.value);
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
      .call(d3.axisBottom(x)
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

  let mult = 1;
  setInterval(() => {
    if (mult > 1) {
      mult = 1;
    } else {
      mult = 2;
    }
  }, 60 * 1000);


  function tick() {
    x.domain(xDomain(Date.now()));

    // Push a new data point onto the back.
    data.push({
      time: Date.now(),
      value: random() * mult,
    });
    if (data.length > n) {
      data.shift();
    }

    y.domain([0, Math.max(1.0, d3.max(data, (d) => {
      return d.value;
    }))]);

    // Redraw the line.
    d3.select(this)
        .attr('d', line)
        .attr('transform', null);

    const distance = x(0) - x(duration);
    d3.active(this)
        .attr('transform', 'translate(' + distance + ',0)')
        .transition()
        .on('start', tick);

    xAxis
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat(timeFormat))
        );

    yAxis
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(y));
  }
})();
