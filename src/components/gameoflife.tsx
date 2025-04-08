import { onCleanup, onMount, createSignal } from "solid-js";
import Terminal from "./terminal";

export default function HalftoneWavesWithTerminal() {
  let canvasRef: HTMLCanvasElement | undefined;

  onMount(() => {
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    const gridSize = 20;
    let rows = Math.ceil(window.innerHeight / gridSize);
    let cols = Math.ceil(window.innerWidth / gridSize);

    let grid: boolean[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => Math.random() > 0.8),
      );

    const countNeighbors = (grid: boolean[][], x: number, y: number) => {
      let sum = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          const row = (y + i + rows) % rows;
          const col = (x + j + cols) % cols;
          sum += grid[row][col] ? 1 : 0;
        }
      }
      sum -= grid[y][x] ? 1 : 0;
      return sum;
    };

    const updateGrid = () => {
      const next = Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(false));

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const neighbors = countNeighbors(grid, x, y);
          const state = grid[y][x];

          if (state && (neighbors < 2 || neighbors > 3)) {
            next[y][x] = false;
          } else if (state && (neighbors === 2 || neighbors === 3)) {
            next[y][x] = true;
          } else if (!state && neighbors === 3) {
            next[y][x] = true;
          } else {
            next[y][x] = state;
          }
        }
      }

      grid = next;
    };

    const drawGameOfLife = () => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const centerX = x * gridSize;
          const centerY = y * gridSize;
          const isAlive = grid[y][x];
          const size = isAlive ? gridSize * 0.8 : gridSize * 0.2;

          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          const opacity = isAlive ? 0.6 : 0.1;
          ctx.fillStyle = `rgba(90, 30, 160, ${opacity})`;
          ctx.fill();
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      rows = Math.ceil(canvas.height / gridSize);
      cols = Math.ceil(canvas.width / gridSize);
      grid = Array(rows)
        .fill(null)
        .map(() =>
          Array(cols)
            .fill(null)
            .map(() => Math.random() > 0.8),
        );
    };

    // Function to spawn new live cells when clicked
    const handleCanvasClick = (event: MouseEvent) => {
      // Get click coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Convert to grid coordinates
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);

      // Ensure coordinates are within bounds
      if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        // Create a "glider" pattern or other interesting shape
        // Spawn a small cluster of live cells
        const pattern = [
          [0, 0],
          [1, 0],
          [2, 0],
          [0, 1],
          [1, 1],
          [2, 1],
          [0, 2],
          [1, 2],
          [2, 2],
        ];

        pattern.forEach(([offsetX, offsetY]) => {
          const newX = (gridX + offsetX) % cols;
          const newY = (gridY + offsetY) % rows;
          grid[newY][newX] = true;
        });
      }
    };

    // Add click event listener
    canvas.addEventListener("click", handleCanvasClick);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGameOfLife();

      // Update grid every 10 frames for a slower, more visible evolution
      frameCount++;
      if (frameCount % 10 === 0) {
        updateGrid();
      }

      // Add some randomness occasionally to keep the simulation interesting
      if (frameCount % 200 === 0) {
        const randomX = Math.floor(Math.random() * cols);
        const randomY = Math.floor(Math.random() * rows);
        grid[randomY][randomX] = true;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
      // Reinitialize grid on resize
      grid = Array(Math.ceil(canvas.height / gridSize))
        .fill(null)
        .map(() =>
          Array(Math.ceil(canvas.width / gridSize))
            .fill(null)
            .map(() => Math.random() > 0.8),
        );
    });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animate();

    onCleanup(() => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
    });
  });

  return (
    <div class="relative w-full h-screen">
      {/* Canvas is the animated background */}
      <canvas
        ref={canvasRef}
        class="absolute top-0 left-0 w-full h-full bg-black"
      />
      <Terminal />
    </div>
  );
}
