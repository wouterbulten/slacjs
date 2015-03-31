var app = {
    
    config: {},

    plot: undefined,

    iteration: 0,

    groundTruthSeries: 0,
    landmarkSeries: 1,
    particleSeries: 2,

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
            series: series        });

    },

    iterate: function() {

        this.user.step();

        Z = [];
        //Get sensor readings
        this.landmarks.forEach(function(l) {
            if(l.inRange(this.user.x, this.user.y)) {
                Z.push({id: l.id, value: l.rssiAtLocation(this.user.x, this.user.y)});
            }
        }, this);

        //Update all particles
        this.particles.update(this.user.getControl(), Z);

        //Plot current user position
        this.plot.series[this.groundTruthSeries].addPoint([this.user.x, this.user.y], true)

        //Plot the particles
        this.plot.series[this.particleSeries].setData(this.particles.getEstimateList())

        //Plot traces of the particles (very cpu intensive)
        if(this.config.plotParticleTraces) {
            for(var i = 0; i < this.config.nParticles; i++)
            {
                this.plot.series[4 + i].setData(this.particles.particles[i].trace)
            }
        }

    	this.iteration++;
    },

    reset: function() {

        this.initialize(this.config);
    }
};