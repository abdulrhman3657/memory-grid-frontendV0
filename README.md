# Grid Memory Game

A simple **3x3 grid memory game** built with **React**, **Vite**, and **Tailwind CSS**. The goal is to memorize the sequence of highlighted cells and click them in the correct order.

---

## Features

- Randomized green cell patterns that increase in length each round.
- Strict order clicking — one mistake ends the game.
- Win by completing all rounds (up to 9 cells).
- Start, Reset, and How to Play buttons.
- Animated reveal of cells.
- Foggy glass modal for instructions.
- Fully responsive layout.

---

## How to Play

1. Click **Start** to begin a round.  
2. Watch the green cells light up in sequence.  
3. Memorize the order.  
4. Click the cells in the exact same order.  
5. Complete all rounds to **win**.  
6. Clicking the wrong cell ends the game (**fail**).

---

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed.

```bash
# Clone the repository
git clone https://github.com/your-username/grid-memory-game.git
cd grid-memory-game

# Install dependencies
npm install

# Start the development server
npm run dev
