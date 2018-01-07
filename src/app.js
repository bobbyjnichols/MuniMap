
let width = 960,
  height = 500,
  centered;

// Define color scale
let color = d3.scale.linear()
  .domain([1, 20])
  .clamp(true)
  .range(['#fff', '#409A99']);

let projection = d3.geo.mercator()
  .scale(150000)
  .center([-122.45, 37.75])
  .translate([width / 2, height / 2]);

let path = d3.geo.path()
  .projection(projection);

// Set svg width & height
let svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height);

// Add background
svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', clicked);

let g = svg.append('g');

let effectLayer = g.append('g')
  .classed('effect-layer', true);

let mapLayer = g.append('g')
  .classed('map-layer', true);

// Load map data
d3.json('data/neighborhoods.json', function(error, mapData) {
  let features = mapData.features;

  // Update color scale domain based on data
  color.domain([0, d3.max(features, nameLength)]);

  // Draw each province as a path
  mapLayer.selectAll('path')
    .data(features)
    .enter().append('path')
    .attr('d', path)
    .attr('vector-effect', 'non-scaling-stroke')
    .style('fill', fillFn)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .on('click', clicked);
});

// Get province name
function nameFn(d){
  return d && d.properties ? d.properties.NOMBRE_DPT : null;
}

// Get province name length
function nameLength(d){
  let n = nameFn(d);
  return n ? n.length : 0;
}

// Get province color
function fillFn(d){
  return color(nameLength(d));
}

function clicked(d) {
  let x, y, k;

  if (d && centered !== d) {
    let centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});

  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
}

function mouseover(d){
  // Highlight hovered province
  d3.select(this).style('fill', 'orange');
}

function mouseout(d){
  // Reset province color
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});
}
