import { useEffect, useRef, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

function Chart({
  width = 800,
  height = 500,
  data = [],
  timeStampRequest = 'h',
  setTimeStampRequest = () => {},
}) {
  const chartWrapperRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(width);
  const [chartHeight, setChartHeight] = useState(height);

  useEffect(() => {
    function updateChartSize() {
      const containerWidth = chartWrapperRef.current?.clientWidth || width;
      const viewportWidth = window.innerWidth;
      const nextHeight = viewportWidth < 480 ? 250 : viewportWidth < 768 ? 300 : height;

      setChartWidth(Math.max(Math.floor(containerWidth), 280));
      setChartHeight(nextHeight);
    }

    updateChartSize();
    window.addEventListener('resize', updateChartSize);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && chartWrapperRef.current) {
      resizeObserver = new ResizeObserver(updateChartSize);
      resizeObserver.observe(chartWrapperRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateChartSize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [width, height]);

  if (!data || data.length === 0) return null;

  const yValues = data.map((point) => point.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = Math.max(maxY - minY, 1);
  const padding = range * 0.08;

  const latest = data[data.length - 1];
  const previous = data[data.length - 2] || latest;
  const isUp = (latest?.y || 0) >= (previous?.y || 0);

  const open = Number(data[0]?.y || 0);
  const close = Number(latest?.y || 0);
  const high = maxY;
  const low = minY;
  const change = open ? ((close - open) / open) * 100 : 0;

  function formatPrice(value, digits = 2) {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  return (
    <div className="chart-terminal">
      <div className="chart-toolbar">
        <div className="chart-tools">
          <button type="button" className="active">Price</button>
          <button type="button">Depth</button>
          <button type="button">Indicators</button>
        </div>
        <div className="chart-timeframes">
          <button
            type="button"
            className={timeStampRequest === 'h' ? 'active' : ''}
            onClick={() => setTimeStampRequest('h')}
          >
            1h
          </button>
          <button
            type="button"
            className={timeStampRequest === 'd' ? 'active' : ''}
            onClick={() => setTimeStampRequest('d')}
          >
            24h
          </button>
          <button
            type="button"
            className={timeStampRequest === 'w' ? 'active' : ''}
            onClick={() => setTimeStampRequest('w')}
          >
            1w
          </button>
          <button
            type="button"
            className={timeStampRequest === 'm' ? 'active' : ''}
            onClick={() => setTimeStampRequest('m')}
          >
            1m
          </button>
          <button
            type="button"
            className={timeStampRequest === 'y' ? 'active' : ''}
            onClick={() => setTimeStampRequest('y')}
          >
            1y
          </button>
        </div>
      </div>

      <div className="chart-ohlc">
        <span>O {formatPrice(open)}</span>
        <span>H {formatPrice(high)}</span>
        <span>L {formatPrice(low)}</span>
        <span>C {formatPrice(close)}</span>
        <strong className={change >= 0 ? 'up' : 'down'}>
          {change >= 0 ? '+' : ''}
          {formatPrice(change, 2)}%
        </strong>
      </div>

      <div className="chart-wrapper" ref={chartWrapperRef}>
        <LineChart
          width={chartWidth}
          height={chartHeight}
          dataset={data}
          margin={{ top: 16, right: 72, bottom: 22, left: 20 }}
          grid={{ horizontal: true, vertical: true }}
          xAxis={[
            {
              dataKey: 'x',
              scaleType: 'time',
              valueFormatter: (value) =>
                value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
            },
          ]}
          yAxis={[
            {
              position: 'right',
              min: minY - padding,
              max: maxY + padding,
              valueFormatter: (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            },
          ]}
          series={[
            {
              dataKey: 'y',
              curve: 'linear',
              color: isUp ? '#2dd4a3' : '#ff6a75',
              showMark: false,
              valueFormatter: (value) =>
                `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              area: true,
              connectNulls: true,
            },
          ]}
          sx={{
            '& .MuiChartsSurface-root': { backgroundColor: '#090f1d' },
            '& .MuiLineElement-root': {
              stroke: isUp ? '#2dd4a3' : '#ff6a75',
              strokeWidth: 2.3,
            },
            '& .MuiAreaElement-root': {
              fill: isUp ? 'rgba(45, 212, 163, 0.13)' : 'rgba(255, 106, 117, 0.13)',
            },
            '& .MuiChartsGrid-line': {
              stroke: 'rgba(126, 147, 190, 0.18)',
              strokeDasharray: '5 4',
            },
            '& .MuiChartsAxis-line': { stroke: 'rgba(126, 147, 190, 0.3)' },
            '& .MuiChartsAxis-tick': { stroke: 'rgba(126, 147, 190, 0.3)' },
            '& .MuiChartsAxis-tickLabel': {
              fill: '#8f9abc',
              fontSize: 11,
              fontFamily: 'Space Grotesk, sans-serif',
            },
          }}
          slotProps={{
            legend: { hidden: true },
            // tooltip: {
            //   disablePortal: true,
            //   sx: {
            //     '&.MuiChartsTooltip-root': {
            //       backgroundColor: '#0f172a',
            //       border: '1px solid rgba(126, 147, 190, 0.35)',
            //       borderRadius: '8px',
            //     },
            //     '& .MuiChartsTooltip-table': {
            //       color: '#ffffff',
            //     },
            //     '& .MuiChartsTooltip-cell': {
            //       color: '#ffffff',
            //     },
            //     '& .MuiChartsTooltip-labelCell': {
            //       color: '#ffffff',
            //     },
            //     '& .MuiChartsTooltip-valueCell': {
            //       color: '#ffffff',
            //     },
            //   },
            // },
          }}
        />
      </div>

      <div className={`live-price-tag ${isUp ? 'up' : 'down'}`}>
        ${formatPrice(latest?.y || 0)}
      </div>
    </div>
  );
}

export default Chart;
