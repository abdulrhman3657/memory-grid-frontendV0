import { useMemoryGame } from "../hooks/useMemoryGame";
export default function Home() {
	const {
		cells,
		clickCell,
		gameStarted,
		startGame,
		resetGame,
		showInstructions,
		win,
		fail,
		setShowInstructions,
	} = useMemoryGame();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
			<div className="w-full max-w-md">
				{/* Win / Fail / Title */}
				{win ? (
					<h1 className="text-2xl font-semibold mb-4 text-center text-green-500">
						You Won
					</h1>
				) : fail ? (
					<h1 className="text-2xl font-semibold mb-4 text-center text-red-500">
						You Failed
					</h1>
				) : (
					<h1 className="text-2xl font-semibold mb-4 text-center">
						Grid Matrix
					</h1>
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
						onClick={() => resetGame()}
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
						<p className="mb-2">
							1. Click "Start" to reveal a sequence of green cells.
						</p>
						<p className="mb-2">
							2. Memorize the sequence while the cells flash.
						</p>
						<p className="mb-2">
							3. Click the cells in the exact order they appeared.
						</p>
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
