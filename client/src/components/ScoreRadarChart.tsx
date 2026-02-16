import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface ScoreRadarChartProps {
  scores: {
    quality: number;
    delivery: number;
    communication: number;
    pricing: number;
    compliance: number;
  };
  showIndustryAverage?: boolean;
}

export default function ScoreRadarChart({ scores, showIndustryAverage = false }: ScoreRadarChartProps) {
  const data = [
    {
      subject: 'Quality',
      score: scores.quality,
      industryAvg: 85,
      fullMark: 100,
    },
    {
      subject: 'Delivery',
      score: scores.delivery,
      industryAvg: 82,
      fullMark: 100,
    },
    {
      subject: 'Communication',
      score: scores.communication,
      industryAvg: 80,
      fullMark: 100,
    },
    {
      subject: 'Pricing',
      score: scores.pricing,
      industryAvg: 83,
      fullMark: 100,
    },
    {
      subject: 'Compliance',
      score: scores.compliance,
      industryAvg: 88,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#888', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: '#666', fontSize: 10 }}
        />
        <Radar
          name="Factory Score"
          dataKey="score"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.6}
        />
        {showIndustryAverage && (
          <Radar
            name="Industry Average"
            dataKey="industryAvg"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
          />
        )}
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
