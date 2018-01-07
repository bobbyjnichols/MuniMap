let routes = [];
let vehicles = [];

let width = 1920,
  height = 1080,
  centered;

let projection = d3.geo.mercator()
  .scale(250000)
  .center([-122.45, 37.75])
  .translate([width / 2, height / 2]);

let path = d3.geo.path()
  .projection(projection);

let svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height);

svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', clicked);

let g = svg.append('g');

let mapLayer = g.append('g')
  .classed('map-layer', true);

let streetLayer = g.append('g')
  .classed('street-layer', true);

let arteryLayer = g.append('g')
  .classed('artery-layer', true);

let freewayLayer = g.append('g')
  .classed('freeway-layer', true);

let vehicleLayer = g.append('g')
  .classed('vehicle-layer', true);

d3.json('data/neighborhoods.json', function(error, mapData) {
  let features = mapData.features;

  mapLayer.selectAll('path')
    .data(features)
    .enter().append('path')
    .attr('d', path)
    .attr('vector-effect', 'non-scaling-stroke')
    .style('fill', '#073642')
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .on('click', clicked);
});

d3.json('data/freeways.json', function (error, mapData) {
  freewayLayer.selectAll('path')
    .data(mapData.features)
    .enter().append('path')
    .attr('d', path)
    .style('fill', "none")
    .style('stroke-width', "1.5")
    .style('stroke', "#b58900");
});

d3.json('data/arteries.json', function (error, mapData) {
  arteryLayer.selectAll('path')
    .data(mapData.features)
    .enter().append('path')
    .attr('d', path)
    .style('fill', "none")
    .style('stroke-width', "1")
    .style('stroke', "#b58900");
});

d3.json('data/streets.json', function (error, mapData) {
  streetLayer.selectAll('path')
    .data(mapData.features)
    .enter().append('path')
    .attr('d', path)
    .style('fill', "none")
    .style('stroke-width', "0.5")
    .style('stroke', "#586e75");
});

function initVehicles() {
  vehicleLayer.selectAll(".vehicle")
    .data(vehicles)
    .enter().append("circle", ".vehicle")
    .attr("r", 2.5)
    .attr("class", "vehicle")
    .attr("vehicle-id", d => d ? d.id : null)
    .attr("transform", d => d ?
      "translate(" + projection([
        parseFloat(d.lon),
        parseFloat(d.lat)
      ]) + ")" : null
    );
}

function nameFn(d){
  return d && d.properties ? d.properties.neighborho : null;
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
    .style('fill', d => centered && d===centered ? '#074F5A' : "#073642");

  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
}

function mouseover(d){
  d3.select(this).style('fill', '#b58900');
}

function mouseout(d){
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#074F5A' : "#073642";});
}

function getRoutes() {
  let resolveList = [];
  axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=sf-muni').then(routeListResponse => {
    routes = routeListResponse.data.route;
    routes.forEach(route => {
      resolveList.push(
        axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=sf-muni&r=' + route.tag).then(routeConfigResponse => {
          route.route = routeConfigResponse.data.route;
        })
      );
      resolveList.push(
        axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=0&r=' + route.tag).then(vehicleLocationsResponse => {
          route.vehicles = vehicleLocationsResponse.data.vehicle;
          vehicles = vehicles.concat(vehicleLocationsResponse.data.vehicle);
        })
      );
    });
    Promise.all(resolveList).then(()=>initVehicles());
    return routes;
  });
}

getRoutes();
