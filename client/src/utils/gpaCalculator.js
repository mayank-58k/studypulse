export function toGradePoint(avg) {
  if (avg >= 90) return 4;
  if (avg >= 80) return 3;
  if (avg >= 70) return 2;
  if (avg >= 60) return 1;
  return 0;
}

export function calcWeightedAverage(grades) {
  if (!grades?.length) return 0;
  const total = grades.reduce((acc, grade) => acc + (grade.score / grade.maxScore) * 100 * (grade.weight || 1), 0);
  const weights = grades.reduce((acc, grade) => acc + (grade.weight || 1), 0);
  return weights ? Number((total / weights).toFixed(2)) : 0;
}
