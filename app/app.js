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

        visualisation.init(config.xMax, config.yMax);

        this.initalizeUser();
        this.initalizeLandmarks();
        this.initializeParticles();
        //this.initializePlot();
        //this.plotLandmarks();

        visualisation.plotLandmarks(this.landmarks);
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

    	this.iteration++;

        //Update the canvas
        visualisation.update(
            this.user, this.landmarks, this.particles.particles, this.particles.bestSample());
    },

    reset: function() {

        this.initialize(this.config);
    }
};