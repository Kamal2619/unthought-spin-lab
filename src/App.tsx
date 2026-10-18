import { Header, SpinController } from './components';
import { useWheelSound, useTheme } from './hooks';

function App() {
  const { muted, toggleMute, playTick, playStop, ensureContext } = useWheelSound();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Header
        muted={muted}
        onToggleMute={toggleMute}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
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
