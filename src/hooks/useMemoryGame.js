import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import {
	HOLD_AFTER_LAST_MS,
	REVEAL_INTERVAL_MS,
	API,
	MAX_ROUNDS,
	GRID_SIZE,
	STARTING_LENGTH,
} from "../lib/constants";

const useMemoryGame = () => {
	const [cells, setCells] = useState(Array(GRID_SIZE).fill(false));
	const [flags, setFlags] = useState(Array(GRID_SIZE).fill(false));
	const [fail, setFail] = useState(false);
	const [correctClicks, setCorrectClicks] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [flagsOrder, setFlagsOrder] = useState([]);
	const [patternLength, setPatternLength] = useState(STARTING_LENGTH);
	const [showInstructions, setShowInstructions] = useState(false);
	const isRoundOver = correctClicks === patternLength;
	const win = correctClicks === patternLength && patternLength === MAX_ROUNDS;

	useEffect(() => {
		axios.get(API);
	}, []);

	// array that store setTimeout timer accross renders
	const timersRef = useRef([]);

	const shuffleArray = (arr) => {
		const shuffledArr = [...arr];
		for (let i = shuffledArr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
		}

		return shuffledArr;
	};

	const resetGrid = useCallback((len = STARTING_LENGTH) => {
		setCorrectClicks(0);
		setCells(Array(MAX_ROUNDS).fill(false));
		setFlags(Array(MAX_ROUNDS).fill(false));
		setFlagsOrder([]);
		setPatternLength(len);
	}, []);

	const resetGame = () => {
		clearAllTimers();
		resetGrid();
		setFail(false);
		setGameStarted(false);
	};

	// stop/interrupt all the timers in timersRef array
	const clearAllTimers = useCallback(() => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];
	}, []);

	const chooseRandomCells = (len) => {
		const flagsArr = Array(GRID_SIZE).fill(false);
		let flaggedCount = 0;
		// randomly select "len" number of green cells

		while (flaggedCount < len) {
			const flag = Math.floor(Math.random() * GRID_SIZE);
			if (flagsArr[flag] === true) {
				continue;
			}
			flaggedCount++;
			flagsArr[flag] = true;
		}

		setFlags(flagsArr);
		return flagsArr;
	};

	const getFlagIndices = (flagsArr) => {
		const indices = [];
		flagsArr.forEach((value, index) => {
			if (value) {
				indices.push(index);
			}
		});
		return indices;
	};

	const revealFlags = (shuffledIndices) => {
		// Ensures all cells are black before starting reveals
		setCells(Array(GRID_SIZE).fill(false));

		shuffledIndices.forEach((cellIndex, step) => {
			const t = setTimeout(() => {
				setCells((prev) => {
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
		const totalRevealTime = (shuffledIndices.length - 1) * REVEAL_INTERVAL_MS;
		// Add a little hold time so the last cell stays visible
		// for a short while before disappearing
		const clearAt = totalRevealTime + HOLD_AFTER_LAST_MS;

		// clears all green cells after the pattern
		// for the current round has been revealed
		const clearTimer = setTimeout(() => {
			setCells(Array(GRID_SIZE).fill(false));
		}, clearAt);

		// inturrupt the timer in case of reset or fail
		timersRef.current.push(clearTimer);
	};

	const startGame = useCallback(
		(len = patternLength) => {
			clearAllTimers();

			setFail(false);
			const flagsArr = chooseRandomCells(len);
			setGameStarted(true);

			const indices = getFlagIndices(flagsArr);
			const shuffledIndices = shuffleArray(indices);

			setFlagsOrder(shuffledIndices);

			revealFlags(shuffledIndices);
		},
		[patternLength, clearAllTimers]
	);
	// // delete later
	// useEffect(() => {
	//   // clear all timers before the component unmounts
	//   // (removed from screen)
	//   return () => clearAllTimers();
	// }, []);

	useEffect(() => {
		// if the current round has been completed
		if (win || !isRoundOver || !gameStarted) return;

		// add one green cell
		const nextLen = patternLength + 1;

		// reset before next round
		resetGrid(nextLen);
		startGame(nextLen);
		// check for the next round when (correctClicks) changes
	}, [isRoundOver, gameStarted, win, patternLength, startGame, resetGrid]);

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
			setCorrectClicks((prev) => prev + 1);
			setFlagsOrder(newFlagsOrder);
		}

		if (isRoundOver) {
			const nextLen = patternLength + 1;
			resetGrid(nextLen);
			startGame(nextLen);
		}
	};
	return {
		win,
		fail,
		cells,
		clickCell,
		startGame,
		setShowInstructions,
		gameStarted,
		resetGame,
		showInstructions,
	};
};

export { useMemoryGame };
