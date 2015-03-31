var app = {
    
    config: {},

    plot: undefined,

    iteration: 0,

    groundTruthSeries: 0,
    nodesSeries: 1,
    particleSeries: 2,

    user: undefined,
    nodes: [],
    particles: undefined,

    // Application Constructor
    initialize: function(config) {

        this.config = config;

        this.initalizeUser();
        this.initializeParticles();
        this.initializeNodes();
        this.initializePlot();
        this.plotNodes();

    },

    initializeNodes: function() {

        this.nodes = [];
        
        for(var n = 0; n < this.config.nNodes; n++)
        {
            x = Math.random() * this.config.xMax;
            y = Math.random() * this.config.yMax;

            this.nodes.push(new Node("Node #" + n, n, x, y))
        }
    },

    initalizeUser: function() {
        this.user = new User(25, 25, this.config.xMax, this.config.yMax)
    },

    initializeParticles: function() {
        this.particles = new ParticleSet(this.config.nParticles);
        this.particles.initializeParticles(0,0,4);
    },

    plotNodes: function() {

        var _this = this;

        this.nodes.forEach(function(n) {
            _this.plot.series[_this.nodesSeries].addPoint([n.x, n.y])
        });
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
        this.particles.sample(this.user.getControl());

        this.particles.resample();

        //Plot current user position
        this.plot.series[this.groundTruthSeries].addPoint([this.user.x, this.user.y], true)

        //Plot the particles
        this.plot.series[this.particleSeries].setData(this.particles.getEstimateList())

        if(this.config.plotParticleTraces) {
            for(var i = 0; i < this.config.nParticles; i++)
            {
                this.plot.series[4 + i].setData(this.particles.particles[i].trace)
            }
        }

    	this.iteration++;
    },

    reset: function() {

        this.initalizeUser();
        this.initializeParticles();
        this.initializeNodes();
        this.initializePlot();
        this.plotNodes();
    }
};