var app = {
    
    config: {},

    plot: undefined,

    iteration: 0,

    groundTruthSeries: 0,
    landmarkSeries: 1,
    particleSeries: 2,
    sensorRangeSeries: 4,

    user: undefined,
    landmarks: [],
    particles: undefined,

    // Application Constructor
    initialize: function(config) {

        this.config = config;

        this.initalizeUser();
        this.initalizeLandmarks();
        this.initializeParticles();
        this.initializePlot();
        this.plotLandmarks();
    },

    initalizeLandmarks: function() {
        this.landmarks = [];
        
        for(var n = 0; n < this.config.nLandmarks; n++)
        {
            x = Math.random() * this.config.xMax;
            y = Math.random() * this.config.yMax;

            this.landmarks.push(new Landmark("Node #" + n, n, x, y, 
                this.config.pathLoss, this.config.txPower, this.config.sensorNoise, this.config.sensorRange))
        }
    },

    initalizeUser: function() {
        this.user = new User(25, 25, this.config.xMax, this.config.yMax)
    },

    initializeParticles: function() {
        this.particles = new ParticleSet(this.config.nParticles);
        this.particles.initializeParticles(0,0,4);
    },

    plotLandmarks: function() {

        this.landmarks.forEach(function(n) {
            this.plot.series[this.landmarkSeries].addPoint([n.x, n.y])
        }, this);
    },

    initializePlot: function() {

        var series = [{
            name: 'Ground truth',
            type: 'scatter',
            lineWidth: 2,
            data: [[this.user.x, this.user.y]],
            marker: {
                enabled: false
            }
        },
        {
            name: "Node positions",
            type: 'scatter',
            animation: false,
        },
        {
            name: "Particle estimate",
            type: 'scatter',
            animation: false,
            marker: {
                fillColor: '#C90C0C',
                radius: 2
            }
        },
        {
            name: "Estimated trace",

        },
        {
            name: "Sensor range",
            type: 'scatter',
            marker: {
                radius: 2 * this.config.sensorRange,
                symbol: "circle",
                lineWidth: 1,
                lineColor: "rgba(0, 0, 0, 0.05)",
                fillColor: "rgba(0, 0, 255, 0.04)",
            }
        }];

        
        for(var i = 0; i < this.config.nParticles; i++) {
            series.push({
                name: 'P' + i,
                animation: false,
                type: 'scatter',
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                color: '#C9C9C9'
            });
            
        }

    	this.plot = new Highcharts.Chart({
            chart: {
                renderTo: this.config.mapElement,
            },
            title: {
                text: 'Localisation',
                x: 30 //center
            },
            subtitle: {
                text: 'Showing node positions, ground truth of user path and prediction.',
                x: 30
            },
            xAxis: {
                title: {
                    text: 'Y position'
                },
                max: 55,
                min: -5,
                gridLineWidth: 1,
            },
            yAxis: {
                title: {
                    text: 'X position'
                },
                max: 55,
                min: -5,
                gridLineWidth: 1,
            },
            tooltip: {
                
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            series: series
        }, function(chart) {

            //Fix the marker size for the radius plot
            var r = 4;
            chart.series[4].legendSymbol.attr({
                height: 2 * r,
                width: 2 * r,
                x: (chart.legend.options.symbolWidth / 2)  - r,
                y: chart.legend.baseline - 4 - r
            });
        });

    },

    iterate: function() {

        this.user.step();

        Z = [];
        //Get sensor readings
        this.landmarks.forEach(function(l) {
            if(l.inRange(this.user.x, this.user.y)) {
                //@todo Remove r, now added to create a range-only with bearing implementation
                
                var rssi = l.rssiAtLocation(this.user.x, this.user.y);

                //Calculate bearing
                var r = Math.atan2(l.y - this.user.y, l.x - this.user.x) - this.user.r //atan2(y,x)

                Z.push({
                    id: l.id, 
                    value: rssi,
                    r: l.rssiToDistance(rssi),
                    theta: r + MathAdapter.randn(0,0.5)
                });
            }
        }, this);

        //Update all particles
        this.particles.update(this.user.getControl(), Z);

        //Plot current user position
        this.plot.series[this.groundTruthSeries].addPoint([this.user.x, this.user.y], true);
        //this.plot.series[this.sensorRangeSeries].setData([[this.user.x, this.user.y]]);

        //Plot the particles
        this.plot.series[this.particleSeries].setData(this.particles.getEstimateList())

        //Plot traces of the particles (very cpu intensive)
        if(this.config.plotParticleTraces) {
            for(var i = 0; i < this.config.nParticles; i++)
            {
                this.plot.series[5 + i].setData(this.particles.particles[i].trace)
            }
        }

    	this.iteration++;
    },

    reset: function() {

        this.initialize(this.config);
    }
};