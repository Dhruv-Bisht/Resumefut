import model from './ml-model.json';

// Lightweight ML calibration layer. The model is intentionally tiny so ResumeFUT
// can run without shipping a Python runtime or a large ML framework.
export function predictMLRating(features) {
  const values = model.featureOrder.map((key) => Number(features[key] || 0));
  const normalized = values.map((value, i) => {
    const scale = Number(model.scale[i]) || 1;
    return (value - Number(model.mean[i] || 0)) / scale;
  });

  const prediction = normalized.reduce(
    (sum, value, i) => sum + value * Number(model.weights[i] || 0),
    Number(model.intercept || 0)
  );

  return Math.max(1, Math.min(99, Math.round(prediction)));
}
