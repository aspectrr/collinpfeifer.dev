import type { Component } from "solid-js";
import GameOfLife from "./components/gameoflife";

const App: Component = () => {
  return (
    <main>
      <GameOfLife />
    </main>
  );
};

export default App;
