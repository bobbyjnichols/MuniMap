# MuniMap
A real-time D3 visualization of San Francisco Muni bus locations

### Features
* **Vehicle Details** - Click on a vehicle to see more information about it.
* **Zoom** - Click on a neighborhood to zoom the view. 
Click other neighborhoods to pan around the map. 
Click the currently selected neighborhood to return to the full map.
* **Route Select** - Use the hamburger menu to select the routes to display on the map.
* **Live Locations** - Vehicle data points are animated to reflect an approximate real-world location.

### Requirements
This README assumes your machine has the Gulp task runner installed globally. 
If this is not the case you can do so by running `npm install -g gulp` or `yarn global add gulp`.

### Setup
Yarn is the preferred package manager for MuniMap. 
To get started, run the command `yarn install`. 
If you do not use Yarn, `npm install` should work just as well. 
Once all packages are installed you can run a local web server to serve MuniMap using the default Gulp command, `gulp`.
With the web server running, go to [http://127.0.0.1:9019](http://127.0.0.1:9019) in your browser.
