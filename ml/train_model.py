"""Train the tiny ResumeFUT rating calibration model.

This creates lib/ml-model.json. The checked-in model is intentionally small and
runs in Node.js without TensorFlow/PyTorch. The training data is synthetic and
is only a calibration/demo model; it must not be treated as a hiring predictor.
"""

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

SEED = 42
N = 12000
FEATURES = [
    "resumeLength", "experienceYears", "seniorityHits", "skillHits",
    "leadershipHits", "impactHits", "certHits", "degreeScore",
    "industryBuckets", "githubRepos", "githubFollowers", "githubStars",
    "githubAccountYears", "leetcodeSolved", "leetcodeRankingLog",
]

rng = np.random.default_rng(SEED)
X = np.column_stack([
    rng.integers(80, 6000, N), rng.uniform(0, 12, N), rng.integers(0, 6, N),
    rng.integers(0, 28, N), rng.integers(0, 12, N), rng.integers(0, 18, N),
    rng.integers(0, 6, N), rng.choice([60, 65, 76, 84, 92], N),
    rng.integers(0, 6, N), rng.integers(0, 150, N), rng.integers(0, 2000, N),
    rng.integers(0, 5000, N), rng.uniform(0, 12, N), rng.integers(0, 600, N),
    rng.uniform(0, 8, N),
])

y = (
    18 + .7 * X[:, 1] + 1.0 * X[:, 2] + .45 * X[:, 3] + .7 * X[:, 4]
    + .75 * X[:, 5] + .35 * X[:, 6] + .08 * X[:, 7] + .8 * X[:, 8]
    + .65 * np.log1p(X[:, 9]) + .18 * np.log1p(X[:, 10])
    + .4 * np.log1p(X[:, 11]) + .3 * X[:, 12] + .85 * np.log1p(X[:, 13])
    + .5 * (8 - X[:, 14])
    + .22 * np.sqrt(np.maximum(X[:, 3], 0) * np.maximum(X[:, 1], 0))
    + rng.normal(0, 3, N)
)
y = np.clip(y, 30, 97)

scaler = StandardScaler().fit(X)
model = Ridge(alpha=20).fit(scaler.transform(X), y)

output = {
    "model": "ridge",
    "version": "1.0.0",
    "featureOrder": FEATURES,
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist(),
    "weights": model.coef_.tolist(),
    "intercept": float(model.intercept_),
    "trainingNote": "Lightweight calibration model trained on synthetic profile feature vectors; not a hiring or employability predictor.",
}

Path("lib/ml-model.json").write_text(json.dumps(output, indent=2) + "\n")
print("Wrote lib/ml-model.json")
