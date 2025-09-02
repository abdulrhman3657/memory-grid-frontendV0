import axios from "axios";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [cells, setCells] = useState(Array(9).fill(false));
  const [flags, setFlags] = useState(Array(9).fill(false));
  const [fail, setFail] = useState(false);
  const [win, setWin] = useState(false);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [flagsOrder, setFlagsOrder] = useState([]);
  const [patternLength, setPatternLength] = useState(3);
  const [showInstructions, setShowInstructions] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(API)
  }, [])

  const REVEAL_INTERVAL_MS = 500;
  
  const HOLD_AFTER_LAST_MS = 600;
  
  // array that store setTimeout timer accross renders
  const timersRef = useRef([]);

  // stop/interrupt all the timers in timersRef array
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // // delete later
  // useEffect(() => {
  //   // clear all timers before the component unmounts
  //   // (removed from screen)
  //   return () => clearAllTimers();
  // }, []);

  useEffect(() => {
    // if the current round has been completed
    if (correctClicks === patternLength) {
      // check if it is the final round
      if (patternLength === 9) {
        setWin(true);
        return;
      }

      // add one green cell
      const nextLen = patternLength + 1;

      // reset before next round
      setCorrectClicks(0);
      setCells(Array(9).fill(false));
      setFlags(Array(9).fill(false));
      setFlagsOrder([]);
      setPatternLength(nextLen);

      startGame(nextLen);
    }
    // check for the next round when (correctClicks) changes
  }, [correctClicks]);

  const startGame = (len = patternLength) => {
    // clear all the timers from the previous round
    clearAllTimers();

    setFail(false);
    setWin(false);

    const flagsArr = Array(9).fill(false);
    let flaggedCount = 0;
    // randomly select "len" number of green cells
    while (flaggedCount < len) {
      const flag = Math.floor(Math.random() * 9);
      if (flagsArr[flag] === true){
        continue
      }
      flaggedCount++;
      flagsArr[flag] = true;
    }

    setFlags(flagsArr);
    setGameStarted(true);

    // set the indices of the green cells
    const indices = [];
    flagsArr.forEach((value, index) => {
      if (value) {
        indices.push(index)
      }
    });

    // randomly shuffle reveal order
    indices.sort(() => Math.random() - 0.5);

    setFlagsOrder(indices);

    // Ensures all cells are black before starting reveals
    setCells(Array(9).fill(false));

    indices.forEach((cellIndex, step) => {

      const t = setTimeout(() => {

        setCells(prev => {
          const newGrid = [...prev];
          newGrid[cellIndex] = true;
          return newGrid;
        });

      }, step * REVEAL_INTERVAL_MS); // reveal green cells "REVEAL_INTERVAL_MS" apart

      // push the current round timer to the timers array
      // each round have "len" number of timers
      // can be used to reset the timers if the player falis or resets
      timersRef.current.push(t);

    });

    // the time it takes until the last green cell is revealed
    const totalRevealTime = (indices.length - 1) * REVEAL_INTERVAL_MS;
    // Add a little hold time so the last cell stays visible 
    // for a short while before disappearing
    const clearAt = totalRevealTime + HOLD_AFTER_LAST_MS;

    // clears all green cells after the pattern
    // for the current round has been revealed
    const clearTimer = setTimeout(() => {
      setCells(Array(9).fill(false));
    }, clearAt);

    // inturrupt the timer in case of reset or fail
    timersRef.current.push(clearTimer);

  };

  const clickCell = (index) => {
    if (!gameStarted || win || fail) return;
    if (cells[index] === true) return;

    const newGrid = [...cells];
    newGrid[index] = true;
    setCells(newGrid);

    const newFlagsOrder = [...flagsOrder];
    const expectedIndex = newFlagsOrder.shift();

    if (flags[index] === false || expectedIndex !== index) {
      setFail(true);
      clearAllTimers(); // stop all the remaining timers
    } else {
      setCorrectClicks(prev => prev + 1);
      setFlagsOrder(newFlagsOrder);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div className="w-full max-w-md">
      {/* Win / Fail / Title */}
      {win ? (
        <h1 className="text-2xl font-semibold mb-4 text-center text-green-500">You Won</h1>
      ) : fail ? (
        <h1 className="text-2xl font-semibold mb-4 text-center text-red-500">You Failed</h1>
      ) : (
        <h1 className="text-2xl font-semibold mb-4 text-center">Grid Matrix</h1>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {cells.map((isGreen, i) => (
          <button
            key={i}
            onClick={() => clickCell(i)}
            className={[
              "aspect-square w-full rounded-2xl shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              isGreen ? "bg-green-500" : "bg-black",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => startGame()}
          disabled={gameStarted}
          className="px-4 py-2 rounded-xl shadow bg-white hover:bg-gray-50 border text-sm"
        >
          Start
        </button>
        <button
          onClick={() => {
            clearAllTimers();
            setCells(Array(9).fill(false));
            setFlags(Array(9).fill(false));
            setFail(false);
            setWin(false);
            setCorrectClicks(0);
            setGameStarted(false);
            setFlagsOrder([]);
            setPatternLength(3);
          }}
          className="px-4 py-2 rounded-xl shadow bg-white hover:bg-gray-50 border text-sm"
        >
          Reset
        </button>
        <button
          onClick={() => setShowInstructions(true)}
          className="px-4 py-2 rounded-xl shadow bg-white hover:bg-gray-50 border text-sm"
        >
          How to Play
        </button>
      </div>
    </div>

    {/* Modal */}
{showInstructions && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Full-screen backdrop with blur */}
    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>

    {/* Modal content */}
    <div className="relative bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">How to Play</h2>
      <p className="mb-2">1. Click "Start" to reveal a sequence of green cells.</p>
      <p className="mb-2">2. Memorize the sequence while the cells flash.</p>
      <p className="mb-2">3. Click the cells in the exact order they appeared.</p>
      <p className="mb-4">4. Complete all rounds to win.</p>
      <button
        onClick={() => setShowInstructions(false)}
        className="px-4 py-2 rounded-xl shadow bg-indigo-500 text-white hover:bg-indigo-600"
      >
        Close
      </button>
    </div>
  </div>
)}

  </div>
);


}
