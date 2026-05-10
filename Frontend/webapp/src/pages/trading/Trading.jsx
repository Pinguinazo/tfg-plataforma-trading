import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { CRYPTOS } from '../../utils/constants';

function calculateRSI(closes, period = 14) {
  if (closes.length < period) return [];
  let rsiArray = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i].value - closes[i - 1].value;
    if (diff >= 0) gains += diff; else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < closes.length; i++) {
    if (i > period) {
      const diff = closes[i].value - closes[i - 1].value;
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    }
    let rs = avgGain === 0 ? 0 : (avgLoss === 0 ? 100 : avgGain / avgLoss);
    let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    rsiArray.push({ time: closes[i].time, value: rsi });
  }
  return rsiArray;
}

export default function TradingTab({ globalUser, logEvent, balance, handleTrade, holdings, currency, rate, sym, updateLotLimits }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const compareSeriesRef = useRef(null);

  const priceLinesRef = useRef([]);
  const manualLevelsRef = useRef([]);
  const trendlinesRef = useRef([]);
  const fiboLinesRef = useRef([]);
  const tempLineSeriesRef = useRef(null);

  const dataBufferRef = useRef([]);
  const lastCandleTimeRef = useRef(0);
  const currentPriceRef = useRef(null);
  const lastUiUpdateRef = useRef(0);
  const lastChartUpdateRef = useRef(0);
  const holdingsRef = useRef(holdings);
  const executeTradeRef = useRef(null);
  const processingLotsRef = useRef(new Set());
  
  const isDrawingLevelRef = useRef(false);
  const isDrawingTrendlineRef = useRef(false);
  const isDrawingFiboRef = useRef(false);
  const drawingStepRef = useRef(0);
  const startPointRef = useRef(null);
  const isUpdatingLineRef = useRef(false);
  
  const tier = globalUser?.tier || 'Básico';

  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOS[0]);
  const [compareCrypto, setCompareCrypto] = useState('');
  const [chartType, setChartType] = useState('candle');
  const [interval, setInterval] = useState('1m');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentCandleTime, setCurrentCandleTime] = useState(null);
  const [tradeCrypto, setTradeCrypto] = useState('');
  const [tradeFiat, setTradeFiat] = useState('');
  const [tpSlMode, setTpSlMode] = useState('price');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');

  const [showVolume, setShowVolume] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [isDrawingLevel, setIsDrawingLevel] = useState(false);
  const [isDrawingTrendline, setIsDrawingTrendline] = useState(false);
  const [isDrawingFibo, setIsDrawingFibo] = useState(false);

  const currentLots = holdings[selectedCrypto.symbol] || [];
  const totalCrypto = currentLots.reduce((acc, lot) => acc + lot.amount, 0);
  
  const INTERVAL_OPTIONS = [
    { label: '1m', value: '1m' }, { label: '15m', value: '15m' },
    { label: '1H', value: '1h' }, { label: '4H', value: '4h' },
    { label: '1D', value: '1d' }, { label: '1 Sem', value: '1w' },
    { label: '1 Mes', value: '1M' }
  ];

  useEffect(() => { holdingsRef.current = holdings; }, [holdings]);

  useEffect(() => {
    const currentIds = new Set(currentLots.map(l => l.id));
    for (let id of processingLotsRef.current) {
      if (!currentIds.has(id)) processingLotsRef.current.delete(id);
    }
  }, [currentLots]);

  const executeTrade = useCallback((type, lotId = null, forcePrice = null) => {
    const execPrice = forcePrice || currentPriceRef.current || currentPrice;

    if (type === 'BUY') {
      const amount = parseFloat(tradeCrypto);
      if (isNaN(amount) || amount <= 0) return logEvent('Introduce una cantidad válida', 'error');
      if (!execPrice) return logEvent('Esperando datos del mercado...', 'error');

      let finalTpUSD = null; 
      let finalSlUSD = null;
      
      if (tp && !isNaN(tp)) finalTpUSD = tpSlMode === 'price' ? parseFloat(tp) / rate : (parseFloat(tp) / rate) / amount;
      if (sl && !isNaN(sl)) finalSlUSD = tpSlMode === 'price' ? parseFloat(sl) / rate : (parseFloat(sl) / rate) / amount;

      if (finalTpUSD && finalTpUSD <= execPrice) return logEvent(`El Take Profit debe ser mayor a ${(execPrice * rate).toFixed(2)}${sym}`, 'error');
      if (finalSlUSD && finalSlUSD >= execPrice) return logEvent(`El Stop Loss debe ser menor a ${(execPrice * rate).toFixed(2)}${sym}`, 'error');
      
      handleTrade('BUY', selectedCrypto.symbol, selectedCrypto.ticker, amount, execPrice, currentCandleTime, null, finalTpUSD, finalSlUSD);
      setTradeCrypto(''); setTradeFiat(''); setTp(''); setSl('');
    } else if (type === 'SELL_LOT') {
      handleTrade('SELL_LOT', selectedCrypto.symbol, selectedCrypto.ticker, null, execPrice, currentCandleTime, lotId);
      setTradeCrypto('');
      setTradeFiat('');
    } else if (type === 'SELL_ALL') {
      handleTrade('SELL_ALL', selectedCrypto.symbol, selectedCrypto.ticker, null, execPrice, currentCandleTime);
      setTradeCrypto('');
      setTradeFiat('');
    }
  }, [tradeCrypto, tp, sl, tpSlMode, selectedCrypto, currentCandleTime, currentPrice, rate, sym, handleTrade, logEvent]);

  useEffect(() => { executeTradeRef.current = executeTrade; }, [executeTrade]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    let isMounted = true;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: '#0f172a' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      crosshair: { mode: 0 },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    
    chartInstanceRef.current = chart;

    let series = chartType === 'candle'
      ? chart.addSeries(CandlestickSeries, { upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444' })
      : chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 });
      
    seriesRef.current = series;

    const volumeSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.8, bottom: 0 }, visible: showVolume });
    volumeSeriesRef.current = volumeSeries;

    const smaSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, crosshairMarkerVisible: false, visible: showSMA });
    smaSeriesRef.current = smaSeries;

    const rsiSeries = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, crosshairMarkerVisible: false, visible: showRSI, priceScaleId: 'rsi' });
    chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    rsiSeriesRef.current = rsiSeries;

    const handleResize = () => { 
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
    };
    window.addEventListener('resize', handleResize);

    const getTimeFromCoordinate = (x, paramTime) => {
      if (paramTime) return paramTime;
      const timeScale = chart.timeScale();
      const logical = timeScale.coordinateToLogical(x);
      
      if (logical !== null && lastCandleTimeRef.current) {
        const lastCoord = timeScale.timeToCoordinate(lastCandleTimeRef.current);
        if (lastCoord !== null) {
          const lastLogical = timeScale.coordinateToLogical(lastCoord);
          if (lastLogical !== null) {
            const diff = logical - lastLogical;
            const intervalMins = { '1m': 1, '15m': 15, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080, '1M': 43200 }[interval];
            return lastCandleTimeRef.current + Math.round(diff * intervalMins * 60);
          }
        }
      }
      return null;
    };

    chart.subscribeClick((param) => {
      if (!param.point || !seriesRef.current) return;
      const price = seriesRef.current.coordinateToPrice(param.point.y);
      let rawTime = getTimeFromCoordinate(param.point.x, param.time);
      if (!rawTime || !price) return;
      
      const intervalMins = { '1m': 1, '15m': 15, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080, '1M': 43200 }[interval];
      const time = Math.round(rawTime / (intervalMins * 60)) * (intervalMins * 60);

      if (isDrawingLevelRef.current) {
        const line = seriesRef.current.createPriceLine({ price, color: '#3b82f6', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'Nivel' });
        manualLevelsRef.current.push(line);
        setIsDrawingLevel(false); 
        isDrawingLevelRef.current = false; 
        return;
      }

      if (isDrawingTrendlineRef.current) {
        if (drawingStepRef.current === 0) {
          startPointRef.current = { time, value: price };
          tempLineSeriesRef.current = chart.addSeries(LineSeries, { 
            color: '#a855f7', 
            lineWidth: 2, 
            crosshairMarkerVisible: false, 
            lastValueVisible: false, 
            priceLineVisible: false,
            autoscaleInfoProvider: () => null
          });
          drawingStepRef.current = 1;
        } else if (drawingStepRef.current === 1) {
          trendlinesRef.current.push(tempLineSeriesRef.current);
          tempLineSeriesRef.current = null;
          drawingStepRef.current = 0;
          setIsDrawingTrendline(false); 
          isDrawingTrendlineRef.current = false;
        }
      }

      if (isDrawingFiboRef.current) {
        if (drawingStepRef.current === 0) {
          startPointRef.current = { time, value: price };
          drawingStepRef.current = 1;
          logEvent('Punto A fijado. Selecciona el Punto B.', 'info');
        } else if (drawingStepRef.current === 1) {
          const endPrice = price;
          const diff = endPrice - startPointRef.current.value;
          const fiboLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
          const colors = ['#787b86', '#ef4444', '#81c784', '#4caf50', '#009688', '#64b5f6', '#787b86'];
          
          fiboLevels.forEach((level, i) => {
            const levelPrice = startPointRef.current.value + (diff * level);
            const line = seriesRef.current.createPriceLine({
              price: levelPrice, color: colors[i], lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `Fib ${level}`
            });
            fiboLinesRef.current.push(line);
          });
          
          drawingStepRef.current = 0; 
          startPointRef.current = null;
          setIsDrawingFibo(false); 
          isDrawingFiboRef.current = false;
          logEvent('Retroceso de Fibonacci trazado.', 'success');
        }
      }
    });

    chart.subscribeCrosshairMove((param) => {
      if (drawingStepRef.current === 1 && tempLineSeriesRef.current && param.point && seriesRef.current && isDrawingTrendlineRef.current) {
        if (isUpdatingLineRef.current) return;
        isUpdatingLineRef.current = true;

        requestAnimationFrame(() => {
          if (!tempLineSeriesRef.current || !seriesRef.current) {
            isUpdatingLineRef.current = false;
            return;
          }
          const currentPrice = seriesRef.current.coordinateToPrice(param.point.y);
          let rawTime = getTimeFromCoordinate(param.point.x, param.time);
          if (!rawTime || !currentPrice) {
            isUpdatingLineRef.current = false;
            return;
          }
          
          const intervalMins = { '1m': 1, '15m': 15, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080, '1M': 43200 }[interval];
          const currentTime = Math.round(rawTime / (intervalMins * 60)) * (intervalMins * 60);
          const startP = startPointRef.current;
          
          if (currentTime !== startP.time) {
            const data = currentTime > startP.time 
              ? [startP, { time: currentTime, value: currentPrice }] 
              : [{ time: currentTime, value: currentPrice }, startP];
            try {
              tempLineSeriesRef.current.setData(data);
            } catch (error) {}
          }
          isUpdatingLineRef.current = false;
        });
      }
    });

    let maxDays = 7;
    if (tier === 'Pro') maxDays = 365;
    if (tier === 'Élite') maxDays = 730;
    
    const intervalMapMins = { '1m': 1, '15m': 15, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080, '1M': 43200 };
    const maxMinsAllowed = maxDays * 24 * 60;
    let calculatedLimit = Math.floor(maxMinsAllowed / intervalMapMins[interval]);
    
    if (calculatedLimit > 1000) calculatedLimit = 1000;
    if (calculatedLimit < 1) calculatedLimit = 1;
    
    fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedCrypto.symbol}&interval=${interval}&limit=${calculatedLimit}`)
      .then(res => res.json())
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) return;
        const ohlc = []; const vol = []; const closes = [];
        
        data.forEach(d => {
          const time = d[0] / 1000; 
          const open = parseFloat(d[1]); 
          const high = parseFloat(d[2]); 
          const low = parseFloat(d[3]); 
          const close = parseFloat(d[4]); 
          const volume = parseFloat(d[5]);
          const isUp = close >= open;
          
          ohlc.push({ time, open, high, low, close, value: close });
          vol.push({ time, value: volume, color: isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)' });
          closes.push({ time, value: close });
        });

        series.setData(ohlc); 
        volumeSeries.setData(vol);
        dataBufferRef.current = closes; 
        lastCandleTimeRef.current = ohlc[ohlc.length - 1]?.time || 0;

        if (closes.length >= 20) {
          const smaData = [];
          for (let i = 19; i < closes.length; i++) {
            const sum = closes.slice(i - 19, i + 1).reduce((a, b) => a + b.value, 0);
            smaData.push({ time: ohlc[i].time, value: sum / 20 });
          }
          smaSeries.setData(smaData);
        }

        if (tier === 'Pro' || tier === 'Élite') {
          const rsiData = calculateRSI(closes);
          rsiSeries.setData(rsiData);
        }

        if (ohlc.length > 0) {
          currentPriceRef.current = ohlc[ohlc.length - 1].close;
          setCurrentPrice(ohlc[ohlc.length - 1].close);
          setCurrentCandleTime(ohlc[ohlc.length - 1].time);
        }
        chart.timeScale().applyOptions({ rightOffset: 20 });
      });

    let wsInterval = interval === '1M' ? '1M' : interval;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCrypto.symbol.toLowerCase()}@kline_${wsInterval}`);
    
    ws.onopen = () => {
      if (!isMounted) ws.close();
    };
    
    ws.onmessage = (event) => {
      if (!isMounted) return;
      const candle = JSON.parse(event.data).k;
      const cTime = candle.t / 1000; 
      const cPrice = parseFloat(candle.c); 
      const isUp = cPrice >= parseFloat(candle.o);
      currentPriceRef.current = cPrice;
      const now = Date.now();

      if (now - lastUiUpdateRef.current > 500) {
        setCurrentPrice(cPrice);
        setCurrentCandleTime(cTime);
        lastUiUpdateRef.current = now;
      }

      if (now - lastChartUpdateRef.current > 100) {
        series.update({ time: cTime, open: parseFloat(candle.o), high: parseFloat(candle.h), low: parseFloat(candle.l), close: cPrice, value: cPrice });
        volumeSeries.update({ time: cTime, value: parseFloat(candle.v), color: isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)' });
        lastChartUpdateRef.current = now;
      }

      const buffer = dataBufferRef.current;
      if (buffer.length > 0) {
        if (cTime > lastCandleTimeRef.current) {
          buffer.push({ time: cTime, value: cPrice });
          if (buffer.length > 100) buffer.shift(); 
          lastCandleTimeRef.current = cTime;
        } else { 
          buffer[buffer.length - 1] = { time: cTime, value: cPrice };
        }

        if (buffer.length >= 20) {
          const sum = buffer.slice(-20).reduce((a, b) => a + b.value, 0);
          smaSeries.update({ time: cTime, value: sum / 20 });
        }
        
        if ((tier === 'Pro' || tier === 'Élite') && buffer.length > 14) {
          const rsiData = calculateRSI(buffer.slice(-15));
          if (rsiData.length > 0) rsiSeries.update(rsiData[rsiData.length - 1]);
        }
      }

      const currentSymbolLots = holdingsRef.current[selectedCrypto.symbol] || [];
      currentSymbolLots.forEach(lot => {
        if (processingLotsRef.current.has(lot.id)) return;
        if (lot.tp && cPrice >= lot.tp) { 
          processingLotsRef.current.add(lot.id); 
          executeTradeRef.current('SELL_LOT', lot.id, cPrice); 
        } else if (lot.sl && cPrice <= lot.sl) { 
          processingLotsRef.current.add(lot.id); 
          executeTradeRef.current('SELL_LOT', lot.id, cPrice); 
        }
      });
    };

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize); 
      
      if (ws.readyState === 1) {
        ws.close();
      }
      
      chart.remove();
      priceLinesRef.current = [];
      manualLevelsRef.current = [];
      trendlinesRef.current = []; 
      fiboLinesRef.current = [];
    };
  }, [selectedCrypto.symbol, chartType, interval, tier]);

  useEffect(() => {
    if (!compareCrypto || !chartInstanceRef.current || tier !== 'Élite') return;
    
    let isMounted = true;
    const chart = chartInstanceRef.current;

    chart.priceScale('left').applyOptions({ visible: true, textColor: '#a855f7' });

    const compSeries = chart.addSeries(LineSeries, {
      color: '#a855f7', lineWidth: 2, priceScaleId: 'left', crosshairMarkerVisible: true
    });
    compareSeriesRef.current = compSeries;

    fetch(`https://api.binance.com/api/v3/klines?symbol=${compareCrypto}&interval=${interval}&limit=500`)
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return;
        const lineData = data.map(d => ({ time: d[0] / 1000, value: parseFloat(d[4]) }));
        compSeries.setData(lineData);
      });

    let wsInterval = interval === '1M' ? '1M' : interval;
    const wsCompare = new WebSocket(`wss://stream.binance.com:9443/ws/${compareCrypto.toLowerCase()}@kline_${wsInterval}`);

    wsCompare.onopen = () => {
      if (!isMounted) wsCompare.close();
    };

    wsCompare.onmessage = (event) => {
      if (!isMounted) return;
      const candle = JSON.parse(event.data).k;
      compSeries.update({ time: candle.t / 1000, value: parseFloat(candle.c) });
    };

    return () => {
      isMounted = false;
      if (wsCompare.readyState === 1) {
        wsCompare.close();
      }
      
      if (chart) { 
        chart.removeSeries(compSeries);
        chart.priceScale('left').applyOptions({ visible: false }); 
      }
    };
  }, [compareCrypto, interval, tier]);

  useEffect(() => { if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume }); }, [showVolume]);
  useEffect(() => { if (smaSeriesRef.current) smaSeriesRef.current.applyOptions({ visible: showSMA }); }, [showSMA]);
  useEffect(() => { if (rsiSeriesRef.current) rsiSeriesRef.current.applyOptions({ visible: showRSI }); }, [showRSI]);

  useEffect(() => {
    if (!seriesRef.current) return;
    
    priceLinesRef.current.forEach(line => { try { seriesRef.current.removePriceLine(line); } catch (e) { } });
    priceLinesRef.current = [];
    
    currentLots.forEach(lot => {
      const buyLine = seriesRef.current.createPriceLine({ price: lot.buyPrice, color: '#3b82f6', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: `COMPRA` });
      priceLinesRef.current.push(buyLine);
      
      if (lot.tp) { 
        const tpLine = seriesRef.current.createPriceLine({ price: lot.tp, color: '#22c55e', lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: `TP` }); 
        priceLinesRef.current.push(tpLine); 
      }
      if (lot.sl) { 
        const slLine = seriesRef.current.createPriceLine({ price: lot.sl, color: '#ef4444', lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: `SL` }); 
        priceLinesRef.current.push(slLine); 
      }
    });
  }, [currentLots, selectedCrypto.symbol]);

  const disableAllTools = () => {
    setIsDrawingLevel(false); 
    isDrawingLevelRef.current = false;
    setIsDrawingTrendline(false); 
    isDrawingTrendlineRef.current = false;
    setIsDrawingFibo(false);
    isDrawingFiboRef.current = false;
    
    if (drawingStepRef.current === 1 && chartInstanceRef.current && tempLineSeriesRef.current) {
      try { chartInstanceRef.current.removeSeries(tempLineSeriesRef.current); } catch (e) { }
    }
    
    drawingStepRef.current = 0;
    tempLineSeriesRef.current = null;
    startPointRef.current = null;
  };

  const toggleLevelMode = () => { const s = !isDrawingLevel; disableAllTools(); setIsDrawingLevel(s); isDrawingLevelRef.current = s; };
  const toggleTrendlineMode = () => { const s = !isDrawingTrendline; disableAllTools(); setIsDrawingTrendline(s); isDrawingTrendlineRef.current = s; };
  const toggleFiboMode = () => {
    if (tier !== 'Élite') return logEvent('Herramienta exclusiva del plan Élite', 'error');
    const s = !isDrawingFibo; disableAllTools(); setIsDrawingFibo(s); isDrawingFiboRef.current = s;
  };

  const clearManualLines = () => {
    if (!chartInstanceRef.current || !seriesRef.current) return;
    manualLevelsRef.current.forEach(l => { try { seriesRef.current.removePriceLine(l); } catch (e) { } }); 
    manualLevelsRef.current = [];
    fiboLinesRef.current.forEach(l => { try { seriesRef.current.removePriceLine(l); } catch (e) { } }); 
    fiboLinesRef.current = [];
    trendlinesRef.current.forEach(s => { try { chartInstanceRef.current.removeSeries(s); } catch (e) { } }); 
    trendlinesRef.current = [];
    disableAllTools();
  };

  const handleCryptoChange = (e) => {
    const val = e.target.value; setTradeCrypto(val);
    if (val && currentPriceRef.current) setTradeFiat((parseFloat(val) * currentPriceRef.current * rate).toFixed(2)); else setTradeFiat('');
  };

  const handleFiatChange = (e) => {
    const val = e.target.value; setTradeFiat(val);
    if (val && currentPriceRef.current) setTradeCrypto(((parseFloat(val) / rate) / currentPriceRef.current).toFixed(6)); else setTradeCrypto('');
  };

  const setMaxSell = () => {
    setTradeCrypto(totalCrypto.toString());
    if (currentPriceRef.current) setTradeFiat((totalCrypto * currentPriceRef.current * rate).toFixed(2));
  };

  const currentPriceConverted = currentPrice ? currentPrice * rate : 0;
  const isAnyToolActive = isDrawingLevel || isDrawingTrendline || isDrawingFibo;

  return (
    <div className="flex flex-col h-full gap-6 xl:flex-row w-full">
      <div className="flex-1 flex flex-col h-full w-full min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 w-full">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl md:text-3xl font-bold">{selectedCrypto.name}</h2>
                {tier === 'Élite' && (
                  <div className="flex items-center bg-slate-900 border border-purple-500/50 rounded-lg px-2 py-0.5">
                    <span className="text-[10px] text-purple-400 font-bold mr-1 hidden sm:inline">Vs:</span>
                    <select value={compareCrypto} onChange={(e) => setCompareCrypto(e.target.value)} className="bg-transparent text-[10px] text-white font-bold outline-none cursor-pointer">
                      <option value="" className="bg-slate-900">Ninguno</option>
                      {CRYPTOS.filter(c => c.symbol !== selectedCrypto.symbol).map(c => <option key={c.symbol} value={c.symbol} className="bg-slate-900">{c.ticker}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tabular-nums text-slate-50">
                {currentPriceConverted ? currentPriceConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '---'}{sym}
              </h3>
            </div>
          </div>

          <div className="flex flex-col w-full md:w-auto gap-3">
            <div className="flex w-full gap-2">
              <select
                value={selectedCrypto.symbol}
                onChange={(e) => { 
                  setSelectedCrypto(CRYPTOS.find(c => c.symbol === e.target.value));
                  setCompareCrypto(''); 
                }}
                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-bold outline-none text-sm cursor-pointer text-white appearance-none"
              >
                {CRYPTOS.map(c => <option key={c.symbol} value={c.symbol}>{c.ticker}</option>)}
              </select>

              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                <button onClick={() => setChartType('candle')} className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-colors ${chartType === 'candle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Velas</button>
                <button onClick={() => setChartType('line')} className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-colors ${chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Líneas</button>
              </div>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden touch-pan-x">
              {INTERVAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setInterval(opt.value)}
                  className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${interval === opt.value ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-t-3xl p-1 relative min-h-[400px]">
          <div ref={chartContainerRef} className={`absolute inset-0 transform-gpu will-change-transform [&_a]:!hidden ${isAnyToolActive ? 'cursor-crosshair' : 'cursor-default'}`} />
        </div>

        <div className="bg-slate-950 border border-slate-800 border-t-0 rounded-b-3xl p-4 flex gap-4 items-center overflow-x-auto custom-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4 shrink-0">
            <button onClick={() => setShowVolume(!showVolume)} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showVolume ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>📊 Vol</button>
            <button onClick={() => setShowSMA(!showSMA)} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showSMA ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>📈 SMA</button>
            <button onClick={toggleLevelMode} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDrawingLevel ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>📌 Nivel</button>
            <button onClick={toggleTrendlineMode} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDrawingTrendline ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>✏️ Dibujar</button>
          </div>

          <div className="flex items-center gap-2 border-r border-slate-800 pr-4 shrink-0">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Pro</span>
            <button onClick={() => { if (tier === 'Básico') return logEvent('Hazte Pro para usar RSI', 'error'); setShowRSI(!showRSI); }} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tier === 'Básico' ? 'opacity-50 grayscale cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800' : showRSI ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
              {tier === 'Básico' ? '🔒 RSI' : '📉 RSI'}
            </button>
          </div>

          <div className="flex items-center gap-2 border-r border-slate-800 pr-4 shrink-0">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Élite</span>
            <button onClick={toggleFiboMode} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tier !== 'Élite' ? 'opacity-50 grayscale cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800' : isDrawingFibo ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
              {tier !== 'Élite' ? '🔒 Fibonacci' : '🕸️ Fibonacci'}
            </button>
          </div>

          <button onClick={clearManualLines} className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-red-400 border border-slate-800 hover:bg-red-900/20 shrink-0">🗑️ Limpiar Dibujos</button>
        </div>
      </div>

      <div className="w-full xl:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 max-h-full overflow-y-auto">
        <h3 className="text-xl font-bold border-b border-slate-800 pb-4 text-center">Panel de Compra</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
            <p className="text-xs text-slate-400 font-bold">Dinero {currency}</p>
            <p className="text-lg font-bold text-green-400">{(balance * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{sym}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
            <p className="text-xs text-slate-400 font-bold">Tus {selectedCrypto.ticker}</p>
            <p className="text-lg font-bold text-blue-400">{totalCrypto.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4 border border-slate-800 p-4 rounded-xl bg-slate-950/50">
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-2 font-bold">
              <span>Cantidad de {selectedCrypto.ticker}</span>
              {totalCrypto > 0 && <button onClick={setMaxSell} className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer">Vender Max</button>}
            </label>
            <div className="relative">
              <input type="number" value={tradeCrypto} onChange={handleCryptoChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" />
              <span className="absolute right-4 top-3 text-slate-500 font-bold">{selectedCrypto.ticker}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2 font-bold">Total ({currency})</label>
            <div className="relative">
              <input type="number" value={tradeFiat} onChange={handleFiatChange} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" />
              <span className="absolute right-4 top-3 text-slate-500 font-bold">{sym}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Modo Auto-Venta</span>
              <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                <button onClick={() => setTpSlMode('price')} className={`cursor-pointer text-[10px] px-2 py-1 rounded font-bold transition-all ${tpSlMode === 'price' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Precio Moneda</button>
                <button onClick={() => setTpSlMode('value')} className={`cursor-pointer text-[10px] px-2 py-1 rounded font-bold transition-all ${tpSlMode === 'value' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Valor Total</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wide">
                  {tpSlMode === 'price' ? 'TP (Al llegar a)' : 'TP (Quiero ganar)'}
                </label>
                <div className="relative">
                  <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder={tpSlMode === 'price' ? `Ej: ${((currentPriceRef.current || 0) * rate * 1.05).toFixed(0)}` : `Ej: ${tradeFiat ? (tradeFiat * 1.05).toFixed(2) : '210'}`} className="w-full bg-slate-900 border border-green-900/50 rounded-lg px-3 py-2 text-slate-50 text-sm font-bold outline-none focus:border-green-500 placeholder-slate-700" />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-bold">{sym}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wide">
                  {tpSlMode === 'price' ? 'SL (Si cae a)' : 'SL (Máx pérdida)'}
                </label>
                <div className="relative">
                  <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder={tpSlMode === 'price' ? `Ej: ${((currentPriceRef.current || 0) * rate * 0.95).toFixed(0)}` : `Ej: ${tradeFiat ? (tradeFiat * 0.95).toFixed(2) : '190'}`} className="w-full bg-slate-900 border border-red-900/50 rounded-lg px-3 py-2 text-slate-50 text-sm font-bold outline-none focus:border-red-500 placeholder-slate-700" />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-bold">{sym}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => executeTrade('BUY')} className="cursor-pointer w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 text-lg">
          COMPRAR AHORA
        </button>

        {currentLots.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-400">Posiciones</h4>
              {currentLots.length > 1 && <button onClick={() => executeTrade('SELL_ALL')} className="cursor-pointer text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">Vender Todo</button>}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {currentLots.map(lot => {
                const pnlUSD = ((currentPriceRef.current || 0) - lot.buyPrice) * lot.amount;
                const pnlConverted = pnlUSD * rate;
                const pnlPercent = (pnlUSD / (lot.amount * lot.buyPrice)) * 100;
                const isProfit = pnlUSD >= 0;
                return (
                  <div key={lot.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col gap-3 group">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-50">{lot.amount} {selectedCrypto.ticker}</p>
                        <p className={`text-xs font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                          {isProfit ? '+' : ''}{pnlConverted.toLocaleString(undefined, { maximumFractionDigits: 2 })}{sym} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                      <button onClick={() => executeTrade('SELL_LOT', lot.id)} className="cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all">
                        Vender
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col bg-slate-900 rounded border border-green-900/30 px-2 py-1">
                        <div className="flex items-center">
                          <span className="text-[10px] text-slate-500 font-bold mr-2">TP</span>
                          <input type="number" defaultValue={lot.tp ? (lot.tp * rate).toFixed(2) : ''} onBlur={(e) => updateLotLimits(selectedCrypto.symbol, lot.id, (parseFloat(e.target.value) / rate) || null, lot.sl)} className="w-full bg-transparent py-0.5 text-xs text-green-400 outline-none" placeholder={`Precio ${sym}`} />
                        </div>
                        {lot.tp && <span className="text-[9px] text-green-500/60 text-right">Val: {(lot.tp * lot.amount * rate).toFixed(2)}{sym}</span>}
                      </div>
                      
                      <div className="flex-1 flex flex-col bg-slate-900 rounded border border-red-900/30 px-2 py-1">
                        <div className="flex items-center">
                          <span className="text-[10px] text-slate-500 font-bold mr-2">SL</span>
                          <input type="number" defaultValue={lot.sl ? (lot.sl * rate).toFixed(2) : ''} onBlur={(e) => updateLotLimits(selectedCrypto.symbol, lot.id, lot.tp, (parseFloat(e.target.value) / rate) || null)} className="w-full bg-transparent py-0.5 text-xs text-red-400 outline-none" placeholder={`Precio ${sym}`} />
                        </div>
                        {lot.sl && <span className="text-[9px] text-red-500/60 text-right">Val: {(lot.sl * lot.amount * rate).toFixed(2)}{sym}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}