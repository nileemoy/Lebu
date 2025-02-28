import React from 'react';
import { TruthScoreProps } from '../../types';

const TruthScore: React.FC<TruthScoreProps> = ({ score }) => {
  // Calculate color based on score
  const getColor = (score: number): string => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBackgroundColor = (score: number): string => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getLabel = (score: number): string => {
    if (score >= 70) return 'Trustworthy';
    if (score >= 40) return 'Questionable';
    return 'Unreliable';
  };

  const color = getColor(score);
  const bgColor = getBackgroundColor(score);
  const label = getLabel(score);

  // Calculate the circle's circumference
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-lg ${bgColor} p-6 flex flex-col items-center justify-center`}>
      <div className="relative flex items-center justify-center">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-gray-500">out of 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`text-sm font-medium ${color}`}>Truth Score</span>
        <h3 className={`text-lg font-semibold ${color}`}>{label}</h3>
      </div>
    </div>
  );
};

export default TruthScore;