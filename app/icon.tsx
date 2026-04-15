import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0f0e0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AptusWheel size={28} />
    </div>,
    { ...size },
  );
}

function AptusWheel({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const ro = size * 0.46;
  const ri = size * 0.28;
  const seasons = [
    { color: '#5aad3e', months: 3 },
    { color: '#e8a020', months: 3 },
    { color: '#c85428', months: 3 },
    { color: '#4a6fa5', months: 4 },
  ];
  const total = 13;
  const degPerMonth = 360 / total;
  const gap = 3;

  let angle = -90;
  const paths: React.ReactElement[] = [];

  seasons.forEach(({ color, months }) => {
    for (let i = 0; i < months; i++) {
      const start = angle + gap / 2;
      const end = angle + degPerMonth - gap / 2;
      const s1r = (start * Math.PI) / 180;
      const e1r = (end * Math.PI) / 180;
      const x1 = cx + ro * Math.cos(s1r);
      const y1 = cy + ro * Math.sin(s1r);
      const x2 = cx + ro * Math.cos(e1r);
      const y2 = cy + ro * Math.sin(e1r);
      const x3 = cx + ri * Math.cos(e1r);
      const y3 = cy + ri * Math.sin(e1r);
      const x4 = cx + ri * Math.cos(s1r);
      const y4 = cy + ri * Math.sin(s1r);
      const lg = end - start > 180 ? 1 : 0;
      const d = `M ${x1} ${y1} A ${ro} ${ro} 0 ${lg} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${lg} 0 ${x4} ${y4} Z`;
      paths.push(<path key={`${color}-${i}`} d={d} fill={color} />);
      angle += degPerMonth;
    }
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
    </svg>
  );
}
