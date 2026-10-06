import { Header, Hero, SpinController } from './components';
import { useWheelSound } from './hooks';

function App() {
  const { muted, toggleMute, playTick, playStop, ensureContext } = useWheelSound();

  return (
    <div className="app">
      <Header muted={muted} onToggleMute={toggleMute} />
      <main className="main">
        <Hero />
        <SpinController
          playTick={playTick}
          playStop={playStop}
          ensureContext={ensureContext}
        />
      </main>
      <footer className="footer">
        <span className="footer-text">UNTHOUGHT — BRANDS MEET THE UNEXPECTED</span>
      </footer>
    </div>
  );
}

export default App;
