/*jshint strict:true, esnext:true */
/*globals d3: true*/

const n = 40;
const time_format = "%H:%M:%S";
const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40
};
const box_width = 500;
const box_height = 250;

var random = d3.randomUniform (0, 1),
    data = d3.range(n).map((d) => { return 0; }),
    duration = 1000;

var svg = d3.select ("svg")
    .attr ("width", box_width)
    .attr ("height", box_height);
var width = +svg.attr ("width") - margin.left - margin.right,
    height = +svg.attr ("height") - margin.top - margin.bottom;

var time = Date.now ();
var g = svg.append ("g")
    .attr ("transform", "translate(" + margin.left + "," + margin.top + ")");
var x = d3.scaleLinear ()
    .domain ([0, n - 1])
    .range ([0, width]);


function x2_domain (t) {
    return [t, t + (n - 1) * duration];

}
var x2 = d3.scaleLinear ().domain (x2_domain (time)).range ([0, width]);
var y = d3.scaleLinear ().domain ([0, 1]).range ([height, 0]);
var line = d3.line ()
    .x ((d, i) => { return x (i); })
    .y ((d, i) => { return y (d); });

g.append ("defs")
    .append ("clipPath")
    .attr ("id", "clip")
    .append ("rect")
    .attr ("width", width)
    .attr ("height", height);
var x_axis = g.append ("g")
    .attr ("class", "axis axis--x")
    .attr ("transform", "translate(0," + y (0) + ")")
    .call (d3.axisBottom (x2)
        .tickFormat(d3.timeFormat(time_format))
    );
var y_axis = g.append ("g")
    .attr ("class", "axis axis--y")
    .call (d3.axisLeft (y));
g.append ("g")
    .attr ("clip-path", "url(#clip)")
    .append ("path")
    .datum (data)
    .attr ("class", "line")
    .transition ()
    .duration (duration)
    .ease (d3.easeLinear)
    .on ("start", tick);

function tick () {
    time = time + duration;
    x2.domain (x2_domain (time));

    // Push a new data point onto the back.
    data.push (random ());
    //data.push (time);
y.domain ([0, Math.max (1.0, d3.max (data))]);

    // Redraw the line.
    d3.select (this)
        .attr ("d", line)
        .attr ("transform", null);

    if (data.length > n) {
        data.shift ();
    }
    d3.active (this)
        .attr("transform", "translate(" + x(-1) + ",0)")
        .transition ()
        .on ("start", tick);

    x_axis
        .transition ()
        .duration (duration)
        .ease (d3.easeLinear)
        .call (d3.axisBottom (x2)
            .tickFormat(d3.timeFormat(time_format))
        );

    y_axis
        .transition ()
        .duration (duration)
        .ease (d3.easeLinear)
        .call (d3.axisLeft (y));
}

