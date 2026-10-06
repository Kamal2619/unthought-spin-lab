import { Header, SpinController } from './components';
import { useWheelSound } from './hooks';

function App() {
  const { muted, toggleMute, playTick, playStop, ensureContext } = useWheelSound();

  return (
    <div className="app">
      <Header muted={muted} onToggleMute={toggleMute} />
      <main className="main">
        <SpinController
          playTick={playTick}
          playStop={playStop}
          ensureContext={ensureContext}
        />
      </main>
    </div>
  );
}

export default App;
