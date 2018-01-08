(function () {
  'use strict';

  const d3RenderService = function () {
    let self = this;

    let width = 1920,
      height = 1080,
      centered;

    let projection = d3.geo.mercator()
      .scale(250000)
      .center([-122.425, 37.775])
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

    this.g = svg.append('g');

    this.layers = {
      map: self.g.append('g').classed('map-layer', true),
      street: self.g.append('g').classed('street-layer', true),
      artery: self.g.append('g').classed('artery-layer', true),
      freeway: self.g.append('g').classed('freeway-layer', true),
      vehicle: self.g.append('g').classed('vehicle-layer', true)
    };

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

      self.layers.map.selectAll('path')
        .style('fill', d => centered && d===centered ? '#074F5A' : "#073642");

      self.g.transition()
        .duration(750)
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
    }

    function mouseover(d){
      d3.select("[neighborhood='" + d.properties.neighborho + "']").style('fill', '#b58900');
    }

    function mouseout(d){
      self.layers.map.selectAll('path')
        .style('fill', d => centered && d===centered ? '#074F5A' : "#073642");
    }

    this.initMap = function () {
      d3.json('data/neighborhoods.json', function(error, mapData) {
        self.layers.map.selectAll('path')
          .data(mapData.features)
          .enter().append('path')
          .attr('d', path)
          .attr('class', 'neighborhood')
          .attr('neighborhood', d => d.properties.neighborho)
          .attr('vector-effect', 'non-scaling-stroke')
          .style('fill', '#073642')
          .on('mouseover', mouseover)
          .on('mouseout', mouseout)
          .on('click', clicked);
      });

      d3.json('data/freeways.json', function (error, mapData) {
        self.layers.freeway.selectAll('path')
          .data(mapData.features)
          .enter().append('path')
          .attr('d', path)
          .style('fill', "none")
          .style('stroke-width', "1.5")
          .style('stroke', "#b58900");
      });

      d3.json('data/arteries.json', function (error, mapData) {
        self.layers.artery.selectAll('path')
          .data(mapData.features)
          .enter().append('path')
          .attr('d', path)
          .style('fill', "none")
          .style('stroke-width', "1")
          .style('stroke', "#b58900");
      });

      d3.json('data/streets.json', function (error, mapData) {
        self.layers.street.selectAll('path')
          .data(mapData.features)
          .enter().append('path')
          .attr('d', path)
          .style('fill', "none")
          .style('stroke-width', "0.5")
          .style('stroke', "#586e75");
      });
    };

    this.initVehicles = function(vehicles, $scope) {
      self.layers.vehicle.selectAll(".vehicle")
        .data(vehicles, d => d ? d.id : null)
        .enter().append("circle", ".vehicle")
        .attr("r", 2.5)
        .attr("class", "vehicle")
        .attr("vehicle-id", d => d ? d.id : null)
        .attr("data-ng-click", "map.selectVehicle('test')")
        .on('click', d => {
          self.layers.vehicle.selectAll(".vehicle").attr("class", "vehicle");
          self.layers.vehicle.select("[vehicle-id='" + d.id + "']").attr("class", "vehicle selected");
          $scope.map.selectVehicle(d);
          $scope.$apply();
        })
        .attr("transform", d => d ?
          "translate(" + projection([
            parseFloat(d.lon),
            parseFloat(d.lat)
          ]) + ")" : null
        );
    };

    this.updateVehicles = function (vehicles) {
      self.layers.vehicle.selectAll(".vehicle")
        .data(vehicles, d => d ? d.id : null)
        .attr("transform", d => d ?
          "translate(" + projection([
            parseFloat(d.lon),
            parseFloat(d.lat)
          ]) + ")" : null
        );
    };
  };

  angular
    .module("MuniMap")
    .service("d3RenderService", [
      d3RenderService
    ]);
})();