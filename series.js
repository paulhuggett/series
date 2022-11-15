import * as d3 from 'https://cdn.skypack.dev/d3@7'

const defaultOptions = {
  width: 520,
  height: 250,
  n: 20, // The number of data points shown.
  timeFormat: '%H:%M:%S',
  duration: 1000, // The update frequency
  margin: { top: 20, right: 20, bottom: 20, left: 40 },
  curve: d3.curveBasis // d3.curveLinear
}

function realOptions (options) {
  return Object
    .assign({},
      Object.fromEntries(
        Object.keys(defaultOptions)
          .filter(k => !(k in options))
          .map(k => [k, defaultOptions[k]])),
      options)
}

export function series (svgSelector, pull, ...args) {
  const options = realOptions(args.length === 0 ? {} : args[0])

  const offset = options.curve === d3.curveBasis ? 2 : 1
  const xDomain = t => [t - ((options.n - offset) * options.duration), t - (offset * options.duration)]
  const data = []

  const svg = d3.select(svgSelector)
  const width = (+svg.attr('width') || options.width) - options.margin.left - options.margin.right
  const height = (+svg.attr('height') || options.height) - options.margin.top - options.margin.bottom

  const xScale = d3.scaleLinear().domain(xDomain(Date.now())).range([0, width])
  const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0])

  const line = d3.line().x(d => xScale(d.time)).y(d => yScale(d.value)).curve(options.curve)

  const xAxisCall = d3.axisBottom(xScale).tickFormat(d3.timeFormat(options.timeFormat))
  const yAxisCall = d3.axisLeft(yScale)

  const g = svg.append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`)
  g.append('defs')
    .append('clipPath').attr('id', 'clip')
    .append('rect').attr('width', width).attr('height', height)

  const xAxis = g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${yScale(0)})`)
    .call(xAxisCall)

  const yAxis = g.append('g')
    .attr('class', 'axis axis-y')
    .call(yAxisCall)

  const path = g.append('g')
    .attr('clip-path', 'url(#clip)')
    .append('path')
  path.datum(data)
    .attr('class', 'line')
    .transition()
    .duration(options.duration)
    .ease(d3.easeLinear)
    .on('start', tick)

  function tick () {
    // Push a new data point onto the back.
    const time = Date.now()
    data.push({ time: time, value: pull(time) })
    if (data.length > options.n) {
      data.shift()
    }

    xScale.domain(xDomain(time))
    yScale.domain([0, Math.max(1.0, d3.max(data, d => d.value))])

    // Redraw the line.
    path.attr('d', line).attr('transform', null)

    const t = d3.transition()
      .duration(options.duration)
      .ease(d3.easeLinear)

    xAxis.transition(t).call(xAxisCall)
    yAxis.transition(t).call(yAxisCall)

    d3.active(this)
      .attr('transform', `translate(${xScale(0) - xScale(options.duration)},0)`)
      .transition(t)
      .on('start', tick)
  }
}
