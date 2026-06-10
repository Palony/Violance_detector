import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Bell, User,SquareChartGantt} from 'lucide-react';

function App() {


  return (
    <>
      <div className="mainPanel">
        <div className="TopPanel">
          <h1 className="appTitle">Violance Detector</h1>
          <div className="topBar">
            <div className="StatusPanel">
                <h2 className="systemStatus">System Status: <span className="Status">OPTIMAL</span></h2>
            </div>
            <Bell />
            <User />
          </div>
        </div>
        <div className="MiddlePanel">
          <div className="leftPanel">
            <h2 className="menuTitle">Menu</h2>
            <div className="menuItems">
              <div className="menuItem">
                  <SquareChartGantt style={{ background: '#1C232B' }}/>
                  <p className="menuText">Analiza</p>
              </div>
            </div>
          </div>
          <div className="rightPanel">
            <div className="AiDetails">
              <p className="modelTitle">Model: YOLOBLABLABLA</p>
              <p className="AiStatus">AI: Processing ACTIVE </p>
            </div>
            <div className="videoFeed">
              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
