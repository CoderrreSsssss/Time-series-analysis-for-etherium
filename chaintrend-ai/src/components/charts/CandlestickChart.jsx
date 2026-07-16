import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from 'lightweight-charts'

/**
 * Candlestick chart powered by TradingView's lightweight-charts library.
 * data: array of { date, open, high, low, close, volume }
 */
export default function CandlestickChart({ data, showVolume = true, height = 340 }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.06)' },
        horzLines: { color: 'rgba(148,163,184,0.06)' },
      },
      rightPriceScale: { borderColor: 'rgba(148,163,184,0.15)' },
      timeScale: { borderColor: 'rgba(148,163,184,0.15)', timeVisible: false },
      crosshair: { mode: 0 },
      width: containerRef.current.clientWidth,
      height,
    })
    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#f43f5e',
    })
    candleSeries.setData(data.map((d) => ({ time: d.date, open: d.open, high: d.high, low: d.low, close: d.close })))

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })
      volumeSeries.setData(
        data.map((d) => ({
          time: d.date,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.4)',
        }))
      )
    }

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data, showVolume, height])

  return <div ref={containerRef} className="w-full" style={{ height }} role="img" aria-label="Candlestick price chart" />
}
