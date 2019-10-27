/* globals d3: true */
/* eslint space-before-function-paren: "error" */
/* eslint indent: ["error", 4] */
/* eslint-env es6 */

(function () {
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
    const curve = d3.curveBasis; // d3.curveLinear
    const offset = 2; // set to 2 if curve===curveBasis, 1 if curveLinear

    const xDomain = (t) => {
        return [t - ((n - offset) * duration), t - (offset * duration)];
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
        .x((d) => {
            return x(d.time);
        })
        .y((d) => {
            return y(d.value);
        })
        .curve(curve);

    g.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

    const xAxisCall = d3.axisBottom(x).tickFormat(d3.timeFormat(timeFormat));
    const yAxisCall = d3.axisLeft(y);

    const xAxis = g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', 'translate(0,' + y(0) + ')')
        .call(xAxisCall);

    const yAxis = g.append('g')
        .attr('class', 'axis axis-y')
        .call(yAxisCall);

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

    function tick () {
        // Push a new data point onto the back.
        const time = Date.now();
        data.push({ time: time, value: random() * mult });
        if (data.length > n) {
            data.shift();
        }

        x.domain(xDomain(time));
        y.domain([0, Math.max(1.0, d3.max(data, (d) => {
            return d.value;
        }))]);

        // Redraw the line.
        d3.select(this)
            .attr('d', line)
            .attr('transform', null);

        const t = d3.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        xAxis.transition(t).call(xAxisCall);
        yAxis.transition(t).call(yAxisCall);

        d3.active(this)
            .attr('transform', 'translate(' + (x(0) - x(duration)) + ',0)')
            .transition(t)
            .on('start', tick);
    }
})();
