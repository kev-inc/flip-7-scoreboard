'use client';

import { useState, useEffect } from 'react';

interface Player {
  name: string;
  scores: (number | 'BUST')[];
  total: number;
}

interface GameState {
  gameStarted: boolean;
  players: Player[];
  currentRound: number;
}

export default function Home() {
  const [playerNames, setPlayerNames] = useState('');
  const [roundScores, setRoundScores] = useState<{ [key: string]: string }>({});
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedGame = localStorage.getItem('flip7-scoreboard');
      if (savedGame) {
        return JSON.parse(savedGame);
      }
    }
    return {
      gameStarted: false,
      players: [],
      currentRound: 1,
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.gameStarted) {
      localStorage.setItem('flip7-scoreboard', JSON.stringify(gameState));
    }
  }, [gameState]);

  const startGame = () => {
    const names = playerNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) {
      alert('Please enter at least one player name');
      return;
    }

    const newPlayers = names.map(name => ({
      name,
      scores: [],
      total: 0,
    }));

    setGameState({
      gameStarted: true,
      players: newPlayers,
      currentRound: 1,
    });
  };

  const submitRound = () => {
    const updatedPlayers = gameState.players.map(player => {
      const scoreInput = roundScores[player.name] || '';
      let score: number | 'BUST';
      
      if (scoreInput.toUpperCase() === 'BUST' || scoreInput === '') {
        score = 'BUST';
      } else {
        score = parseInt(scoreInput, 10);
        if (isNaN(score)) {
          score = 'BUST';
        }
      }

      const newScores = [...player.scores, score];
      const newTotal = newScores.reduce((sum: number, s) => {
        return s === 'BUST' ? sum : sum + s;
      }, 0);

      return {
        ...player,
        scores: newScores,
        total: newTotal,
      };
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentRound: gameState.currentRound + 1,
    });
    setRoundScores({});
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset the game?')) {
      setGameState({
        gameStarted: false,
        players: [],
        currentRound: 1,
      });
      setPlayerNames('');
      setRoundScores({});
      localStorage.removeItem('flip7-scoreboard');
    }
  };

  const handleBust = (playerName: string) => {
    setRoundScores({
      ...roundScores,
      [playerName]: 'BUST',
    });
  };

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            Flip 7
          </h1>
          <p className="text-center text-gray-600 mb-8">Scoreboard</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Names (comma-separated)
              </label>
              <input
                type="text"
                value={playerNames}
                onChange={(e) => setPlayerNames(e.target.value)}
                placeholder="Alice, Bob, Charlie"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800"
              />
            </div>
            
            <button
              onClick={startGame}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Flip 7 Scoreboard
            </h1>
            <p className="text-center text-white text-opacity-90 mt-1">
              Round {gameState.currentRound}
            </p>
          </div>

          <div className="p-6">
            {/* Scoreboard Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Player</th>
                    {Array.from({ length: Math.max(gameState.currentRound - 1, 1) }, (_, i) => (
                      <th key={i} className="text-center py-3 px-2 font-semibold text-gray-700 text-sm">
                        R{i + 1}
                      </th>
                    ))}
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {gameState.players.map((player, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-2 font-medium text-gray-800">{player.name}</td>
                      {player.scores.map((score, scoreIdx) => (
                        <td key={scoreIdx} className="text-center py-3 px-2 text-sm text-gray-700">
                          {score === 'BUST' ? (
                            <span className="text-red-500 font-semibold">BUST</span>
                          ) : (
                            score
                          )}
                        </td>
                      ))}
                      {Array.from({ length: gameState.currentRound - 1 - player.scores.length }, (_, emptyIdx) => (
                        <td key={`empty-${idx}-${emptyIdx}`} className="text-center py-3 px-2 text-sm text-gray-400">
                          -
                        </td>
                      ))}
                      <td className="text-right py-3 px-2 font-bold text-blue-600 text-lg">
                        {player.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Round Input */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Enter Round {gameState.currentRound} Scores
              </h2>
              <div className="space-y-3">
                {gameState.players.map((player) => (
                  <div key={player.name} className="flex gap-2">
                    <label className="flex-1 flex items-center font-medium text-gray-700">
                      {player.name}
                    </label>
                    <input
                      type="text"
                      value={roundScores[player.name] || ''}
                      onChange={(e) => setRoundScores({
                        ...roundScores,
                        [player.name]: e.target.value,
                      })}
                      placeholder="Points"
                      className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 text-center"
                    />
                    <button
                      onClick={() => handleBust(player.name)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      BUST
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={submitRound}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Submit Round
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetGame}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Reset Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
