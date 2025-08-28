function getRandomNDVI(min = 0.1, max = 0.8) {
  return Math.random() * (max - min) + min;
}

function calculateMean(values) {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function calculateStdDev(values, mean) {
  const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

async function fetchNDVI(boundary, date) {
  // Simulate 10–20 NDVI samples across the farm
  const sampleCount = Math.floor(Math.random() * 10) + 10;
  const samples = Array.from({ length: sampleCount }, () => getRandomNDVI());

  const mean = calculateMean(samples);
  const stddev = calculateStdDev(samples, mean);

  // Dummy NDVI map URL (replace with real map generation later)
  const ndviMapUrl = `https://dummyimage.com/600x400/4caf50/ffffff&text=NDVI+${date}`;

  // Return simulated result
  return {
    mean: parseFloat(mean.toFixed(2)),
    stddev: parseFloat(stddev.toFixed(2)),
    ndviMapUrl,
  };
}

module.exports = {
  fetchNDVI,
};
