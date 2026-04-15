import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const s = 180;
  const cx = s / 2;
  const cy = s / 2;
  const ro = s * 0.44;
  const ri = s * 0.26;
  const total = 13;
  const degPerMonth = 360 / total;
  const gap = 2.5;

  const seasons = [
    { color: '#5aad3e', months: 3 },
    { color: '#e8a020', months: 3 },
    { color: '#c85428', months: 3 },
    { color: '#4a6fa5', months: 4 },
  ];

  let angle = -90;
  const paths: React.ReactElement[] = [];

  seasons.forEach(({ color, months }) => {
    for (let i = 0; i < months; i++) {
      const start = angle + gap / 2;
      const end = angle + degPerMonth - gap / 2;
      const sr = (start * Math.PI) / 180;
      const er = (end * Math.PI) / 180;
      const x1 = cx + ro * Math.cos(sr);  const y1 = cy + ro * Math.sin(sr);
      const x2 = cx + ro * Math.cos(er);  const y2 = cy + ro * Math.sin(er);
      const x3 = cx + ri * Math.cos(er);  const y3 = cy + ri * Math.sin(er);
      const x4 = cx + ri * Math.cos(sr);  const y4 = cy + ri * Math.sin(sr);
      const lg = end - start > 180 ? 1 : 0;
      const d = `M ${x1} ${y1} A ${ro} ${ro} 0 ${lg} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${lg} 0 ${x4} ${y4} Z`;
      paths.push(<path key={`${color}-${i}`} d={d} fill={color} />);
      angle += degPerMonth;
    }
  });

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: '#0f0e0c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 40,
    }}>
      <svg width={s * 0.78} height={s * 0.78} viewBox={`0 0 ${s} ${s}`}>
        {paths}
      </svg>
    </div>,
    { ...size },
  );
}
