'use client';

import { useState, useEffect } from 'react';

type CardType = number | 'x2' | '+2' | '+4' | '+6' | '+8' | '+10' | 'BUST';

interface Player {
  name: string;
  scores: CardType[][]; // Array of rounds, each round is an array of cards
  total: number;
}

interface GameState {
  gameStarted: boolean;
  players: Player[];
  currentRound: number;
}

const NUMBER_CARDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MODIFIER_CARDS: ('x2' | '+2' | '+4' | '+6' | '+8' | '+10')[] = ['x2', '+2', '+4', '+6', '+8', '+10'];

export default function Home() {
  const [playerNames, setPlayerNames] = useState('');
  const [roundScores, setRoundScores] = useState<{ [key: string]: CardType[] }>({});
  const [winner, setWinner] = useState<string | null>(null);
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
      const cards = roundScores[player.name] || [];
      
      // If no cards or only BUST, mark as BUST
      if (cards.length === 0 || (cards.length === 1 && cards[0] === 'BUST')) {
        return {
          ...player,
          scores: [...player.scores, ['BUST' as CardType]],
          total: player.total,
        };
      }

      const newScores = [...player.scores, cards];
      
      // Calculate total across all rounds
      let newTotal = 0;
      
      for (const roundCards of newScores) {
        newTotal += calculateRoundScore(roundCards);
      }

      return {
        ...player,
        scores: newScores,
        total: newTotal,
      };
    });

    // Check for winner (first player to reach 200 or more)
    const winningPlayer = updatedPlayers.find(player => player.total >= 200);
    if (winningPlayer) {
      setWinner(winningPlayer.name);
    }

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
      setWinner(null);
      localStorage.removeItem('flip7-scoreboard');
    }
  };

  const restartGameWithSamePlayers = () => {
    const playerNames = gameState.players.map(p => p.name);
    setGameState({
      gameStarted: true,
      players: playerNames.map(name => ({ name, scores: [], total: 0 })),
      currentRound: 1,
    });
    setRoundScores({});
    setWinner(null);
    localStorage.setItem('flip7-scoreboard', JSON.stringify({
      gameStarted: true,
      players: playerNames.map(name => ({ name, scores: [], total: 0 })),
      currentRound: 1,
    }));
  };

  const handleBust = (playerName: string) => {
    setRoundScores({
      ...roundScores,
      [playerName]: ['BUST'],
    });
  };

  const handleCardSelect = (playerName: string, card: CardType) => {
    const currentCards = roundScores[playerName] || [];
    
    // If BUST is already selected, replace with new card
    if (currentCards.length === 1 && currentCards[0] === 'BUST') {
      setRoundScores({
        ...roundScores,
        [playerName]: [card],
      });
      return;
    }
    
    // If selecting BUST, replace all cards with BUST
    if (card === 'BUST') {
      setRoundScores({
        ...roundScores,
        [playerName]: ['BUST'],
      });
      return;
    }
    
    // Check if card is already selected
    const cardIndex = currentCards.findIndex(c => c === card);
    if (cardIndex !== -1) {
      // Deselect the card
      const newCards = currentCards.filter((_, i) => i !== cardIndex);
      if (newCards.length === 0) {
        const { [playerName]: _, ...rest } = roundScores;
        setRoundScores(rest);
      } else {
        setRoundScores({
          ...roundScores,
          [playerName]: newCards,
        });
      }
    } else {
      // Check if adding a number card would exceed 7 number cards limit
      if (typeof card === 'number') {
        const currentNumberCardCount = currentCards.filter(c => typeof c === 'number').length;
        if (currentNumberCardCount >= 7) {
          // Don't allow more than 7 number cards
          return;
        }
      }
      
      // Add the card
      setRoundScores({
        ...roundScores,
        [playerName]: [...currentCards, card],
      });
    }
  };

  const isCardSelected = (playerName: string, card: CardType): boolean => {
    const cards = roundScores[playerName] || [];
    return cards.includes(card);
  };

  const getCardColor = (card: CardType): string => {
    if (card === 'BUST') return 'bg-red-500';
    if (typeof card === 'string') {
      // Modifiers get orange
      return 'bg-orange-500';
    }
    // Number cards get various colors like the game
    const colors = [
      'bg-cyan-500', 'bg-yellow-400', 'bg-pink-500', 'bg-purple-500',
      'bg-teal-500', 'bg-red-400', 'bg-blue-500', 'bg-green-500',
      'bg-indigo-500', 'bg-orange-400', 'bg-lime-500', 'bg-rose-500', 'bg-violet-500'
    ];
    return colors[card % colors.length];
  };

  const formatCardDisplay = (card: CardType): string => {
    if (card === 'BUST') return 'BUST';
    if (typeof card === 'number') return card.toString();
    return card;
  };

  // Calculate round score from cards
  const calculateRoundScore = (cards: CardType[]): number => {
    if (cards.length === 1 && cards[0] === 'BUST') {
      return 0;
    }

    let roundSum = 0;
    const modifiers: CardType[] = [];
    let numberCardCount = 0;

    // Separate number cards and modifiers
    for (const card of cards) {
      if (card === 'BUST') {
        continue;
      } else if (typeof card === 'number') {
        roundSum += card;
        numberCardCount++;
      } else {
        modifiers.push(card);
      }
    }

    // Apply modifiers to this round's sum
    for (const modifier of modifiers) {
      if (modifier === 'x2') {
        roundSum *= 2;
      } else if (typeof modifier === 'string') {
        const addValue = parseInt(modifier.substring(1));
        roundSum += addValue;
      }
    }

    // Add +15 bonus if exactly 7 number cards were selected
    if (numberCardCount === 7) {
      roundSum += 15;
    }

    return roundSum;
  };

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-4 border-yellow-400">
          <h1 className="text-5xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flip7-title">
            FLIP 7
          </h1>
          <p className="text-center text-gray-700 mb-8 text-lg font-semibold">Scoreboard</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Player Names (comma-separated)
              </label>
              <input
                type="text"
                value={playerNames}
                onChange={(e) => setPlayerNames(e.target.value)}
                placeholder="Alice, Bob, Charlie"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 text-gray-800"
              />
            </div>
            
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-400">
          <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-6">
            <h1 className="text-4xl font-bold text-white text-center flip7-title">
              FLIP 7 SCOREBOARD
            </h1>
            <p className="text-center text-white text-lg font-semibold mt-1">
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
                      {player.scores.map((roundCards, scoreIdx) => {
                        const roundScore = calculateRoundScore(roundCards);
                        const isBust = roundCards.length === 1 && roundCards[0] === 'BUST';
                        return (
                          <td key={scoreIdx} className="text-center py-3 px-2 text-sm">
                            {isBust ? (
                              <span className="text-red-500 font-semibold">BUST</span>
                            ) : (
                              <span className="font-semibold text-gray-800">{roundScore}</span>
                            )}
                          </td>
                        );
                      })}
                      {Array.from({ length: gameState.currentRound - 1 - player.scores.length }, (_, emptyIdx) => (
                        <td key={`empty-${idx}-${emptyIdx}`} className="text-center py-3 px-2 text-sm text-gray-400">
                          -
                        </td>
                      ))}
                      <td className="text-right py-3 px-2 font-bold text-cyan-600 text-lg">
                        {player.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Round Input */}
            <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-cyan-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Enter Round {gameState.currentRound} Scores
              </h2>
              <div className="space-y-6">
                {gameState.players.map((player) => (
                  <div key={player.name} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <label className="block font-bold text-gray-800 mb-3 text-lg">
                      {player.name}
                    </label>
                    
                    {/* Selected Cards Display */}
                    <div className="mb-3 min-h-[120px]">
                      {roundScores[player.name] && roundScores[player.name].length > 0 ? (
                        <>
                          <span className="text-sm text-gray-600">Selected: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {roundScores[player.name].map((card, idx) => (
                              <span key={idx} className={`inline-block px-3 py-1 rounded-lg font-bold text-white ${getCardColor(card)}`}>
                                {formatCardDisplay(card)}
                              </span>
                            ))}
                          </div>
                          {/* Round Total */}
                          <div className="mt-2">
                            {(() => {
                              const cards = roundScores[player.name];
                              const roundScore = calculateRoundScore(cards);
                              const numberCardCount = cards.filter(c => typeof c === 'number').length;
                              const has7CardBonus = numberCardCount === 7;
                              
                              return (
                                <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-2">
                                  <span className="text-sm font-semibold text-gray-700">Round Total: </span>
                                  <span className="text-lg font-bold text-cyan-600">{roundScore}</span>
                                  {has7CardBonus && (
                                    <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                      +15 Bonus! (7 cards)
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      ) : null}
                    </div>
                    
                    {/* Number Cards */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Number Cards:</p>
                      <div className="flex flex-wrap gap-2">
                        {NUMBER_CARDS.map((num) => {
                          const currentCards = roundScores[player.name] || [];
                          const numberCardCount = currentCards.filter(c => typeof c === 'number').length;
                          const isSelected = isCardSelected(player.name, num);
                          const isDisabled = !isSelected && numberCardCount >= 7;
                          
                          return (
                            <button
                              key={num}
                              onClick={() => handleCardSelect(player.name, num)}
                              disabled={isDisabled}
                              className={`w-12 h-12 rounded-lg font-bold text-white transition-all shadow ${
                                isSelected
                                  ? `${getCardColor(num)} ring-4 ring-yellow-400 scale-110` 
                                  : isDisabled
                                  ? `${getCardColor(num)} opacity-40 cursor-not-allowed`
                                  : `${getCardColor(num)} hover:scale-105`
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Modifier Cards */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Modifier Cards:</p>
                      <div className="flex flex-wrap gap-2">
                        {MODIFIER_CARDS.map((mod) => (
                          <button
                            key={mod}
                            onClick={() => handleCardSelect(player.name, mod)}
                            className={`px-3 py-2 rounded-lg font-bold text-white transition-all shadow ${
                              isCardSelected(player.name, mod)
                                ? 'bg-orange-500 ring-4 ring-yellow-400 scale-110' 
                                : 'bg-orange-500 hover:scale-105'
                            }`}
                          >
                            {mod}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* BUST Button */}
                    <button
                      onClick={() => handleBust(player.name)}
                      className={`w-full py-2 rounded-lg font-bold text-white transition-all shadow ${
                        isCardSelected(player.name, 'BUST')
                          ? 'bg-red-600 ring-4 ring-yellow-400'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      BUST
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={submitRound}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
              >
                Submit Round
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
            >
              Reset Game
            </button>
          </div>
        </div>

        {/* Winner Modal */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-yellow-400">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 flip7-title">
                  🎉 WINNER! 🎉
                </h2>
                <p className="text-3xl font-bold text-gray-800 mb-6">
                  {winner}
                </p>
                <p className="text-xl text-gray-600 mb-6">
                  Congratulations! You've reached 200 points!
                </p>
                <button
                  onClick={restartGameWithSamePlayers}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
                >
                  Start New Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
