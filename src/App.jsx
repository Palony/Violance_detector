import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Bell, User, SquareChartGantt } from 'lucide-react';

const BADGE_MAP = {
  violence:  { label: "HIGH", color: "#e53e3e" },
  fight:     { label: "HIGH", color: "#e53e3e" },
  intrusion: { label: "MED",  color: "#f59e0b" },
  default:   { label: "INFO", color: "#00bcd4" },
};

function getBadge(label) {
  const key = Object.keys(BADGE_MAP).find(k => label.toLowerCase().includes(k));
  return key ? BADGE_MAP[key] : BADGE_MAP.default;
}

function App() {
  const backendUrl = "http://localhost:8000/video_feed";
  const [logs, setLogs] = useState([]);
  const idRef = useRef(0);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const es = new EventSource("http://localhost:8000/detections");

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const badge = getBadge(data.label);
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);

      setLogs(prev => [
        {
          id: idRef.current++,
          title: data.label,
          conf: data.conf,
          cam: "Cam 01 (Main)",
          time,
          badge: badge.label,
          badgeColor: badge.color,
          image: `data:image/jpeg;base64,${data.image}`,
        },
        ...prev,
      ].slice(0, 20));
    };

    return () => es.close();
  }, []);

  const CARD_WIDTH = 180 + 12;
  const visibleCount = Math.max(1, Math.floor(containerWidth / CARD_WIDTH));
  const visibleLogs = logs.slice(0, visibleCount);

  return (
    <div className="mainPanel">
      <div className="TopPanel">
        <h1 className="appTitle">Violence Detector</h1>
        <div className="topBar">
          <div className="topBarRight">
            <div className="StatusPanel">
              <h2 className="systemStatus">System Status: <span className="Status">OPTIMAL</span></h2>
            </div>
            <Bell />
            <User />
          </div>
        </div>
      </div>

      <div className="MiddlePanel">
        <div className="leftPanel">
          <h2 className="menuTitle">Menu</h2>
          <div className="menuItems">
            <div className="menuItem">
              <SquareChartGantt style={{ background: '#1C232B' }} />
              <p className="menuText">Analiza</p>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <div className="AiDetails">
            <p className="modelTitle">Model: YOLOv8 Custom</p>
            <p className="AiStatus">AI: Processing ACTIVE</p>
          </div>

          <img src={backendUrl} alt="Video Feed" style={{ width: "100%", maxWidth: "640px", borderRadius: "8px", aspectRatio: "16 / 9" }} />

          <div className="logPanel">
            <div style={{ borderBottom: '1px solid #333' }}>
              <p style={{ textAlign: 'left', paddingTop: '10px', paddingLeft: '10px', paddingBottom: '10px' }}>
                {logs.length === 0 ? "Live analysis Log" : `Wykrycia: ${logs.length}`}
              </p>
              <div className="LogImgs" ref={containerRef}>
                {visibleLogs.map((log) => (
                  <div key={log.id} className="logImg">
                    <div className="logThumb">
                      <img src={log.image} alt={log.title} />
                      <span className="logBadge" style={{ background: log.badgeColor }}>
                        {log.badge}
                      </span>
                    </div>
                    <div className="logMeta">
                      <p className="logTitle">{log.title} ({log.conf})</p>
                      <div className="logSub">
                        <span>{log.cam}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App