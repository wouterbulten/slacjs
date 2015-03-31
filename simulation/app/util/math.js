var MathAdapter = function() {};

MathAdapter.randn = function(mean, sd) {
	return jStat.normal.sample(mean, sd);
}