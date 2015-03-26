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

        this.user = new User(25, 25, config.xMax, config.yMax)
        
        this.particles = new ParticleSet(30);
        this.particles.initializeParticles();

        this.initializeNodes();
        this.initializePlot();
        this.plotNodes();

    },

    initializeNodes: function() {

        for(var n = 0; n < this.config.nNodes; n++)
        {
            x = Math.random() * this.config.xMax;
            y = Math.random() * this.config.yMax;

            this.nodes.push(new Node("Node #" + n, n, x, y))
        }
    },

    plotNodes: function() {

        var _this = this;

        this.nodes.forEach(function(n) {
            _this.plot.series[_this.nodesSeries].addPoint([n.x, n.y])
        });
    },

    initializePlot: function() {

    	this.plot = new Highcharts.Chart({
            chart: {
                renderTo: this.config.mapElement,
            },
            title: {
                text: 'Localisation',
                x: -20 //center
            },
            subtitle: {
                text: 'Showing node positions, ground truth of user path and prediction.',
                x: -20
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
            series: [{
                name: 'Ground truth',
                type: 'scatter',
                lineWidth: 1,
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
                    radius: 1
                }
            },
            {
                name: "Estimated trace",

            }]
        });

    },

    iterate: function() {

        this.user.step();
        this.particles.sample();

        console.log([this.user.x, this.user.y])

        //Plot current user position
        this.plot.series[this.groundTruthSeries].addPoint([this.user.x, this.user.y], true)

        //Plot the particles
        this.plot.series[this.particleSeries].setData(this.particles.getEstimateList())

    	this.iteration++;
    },

    reset: function() {

        this.iteration = 0;
    	this.plot.series[this.groundTruthSeries].setData([]);
        this.user.reset();
    }
};