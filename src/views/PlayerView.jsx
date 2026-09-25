import { useState } from "react";
import { auth } from "../firebase/config";
import { useRoomListener, useOwnHandListener } from "../firebase/useRoomListener";
import { startGame, playCard, drawCardForPlayer, callUno } from "../firebase/roomActions";
import { isValidPlay, isWildCard, getPlayableCards } from "../game/rules";

const COLORS = ['red', 'yellow', 'green', 'blue'];

function PlayerView({ roomCode }) {
  const uid = auth.currentUser.uid;
  const { room, players, loading } = useRoomListener(roomCode);
  const hand = useOwnHandListener(roomCode);

  const [pendingWildCard, setPendingWildCard] = useState(null);

  if (loading || !room) return <div>Loading room...</div>

  const isHost = room.hostId === uid;

  if(room.status === 'lobby') {
    const playerCount = Object.keys(players).length;
    return (
      <div>
        <h2>Room {roomCode}</h2>
        <p>Waiting for players...</p>
        <ul>
          {Object.entries(players).map(([getNextPlayerIndex, p]) => (
            <li key = {playerId}>{p.name}</li>
          ))}
        </ul>
        {isHost && (
          <button onClick = {() => startGame(roomCode)} disabled = {playerCount < 2}>
            Start Game ({playerCount} player{playerCount === 1 ? '' : 's'})
          </button>
        )}
      </div>
    );
  }

  if (room.status === 'finished') {
    return <div>Game Over!</div>;
  }

  const topCard = room.discardPile[room.discardPile.length - 1];
  const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
  const isMyTurn = currentPlayerId === uid;
  const playableCards = getPlayableCards(hand, topCard, room.currentColor);

  function handleCardTap(card) {
    if (!isMyTurn) return;
    if (!isValidPlay(card, topCard, room.currentColor)) return;
    if (isWildCard(card)) {
      setPendingWildCard(card);
    } else {
      playCard(roomCode, uid, card);
    }
  }

  function handleColorChoice(color) {
    playCard(roomCode, uid, pendingWildCard, color);
    setPendingWildCard(null);
  }

  return (
    <div>
      <p>
        {isMyTurn ? 'Your turn!' : `${players[currentPlayerId]?.name}'s turn`}
      </p>
      <p>
        Top card: {topCard.color} {topCard.value} - current color: {room.currentColor}
      </p>

      {isMyTurn && (
        <button onClick = {() => drawCardForPlayer(roomCode, uid)}>
          Draw Card
        </button>
      )}

      {hand.length === 1 && (
        <button onClick = {() => callUno(roomCode, uid)}>Say UNO!</button>
      )}

      <div className = "hand">
        {hand.map((card, i) => (
          <button
            key = {i}
            onClick = {() => handleCardTap(card)}
            disabled = {!isMyTurn || !playableCards.includes(card)}
          >
            {card.color} {card.value}
          </button>
        ))}
      </div>

      {pendingWildCard && (
        <div className = "color-picker">
          <p>Choose a color: </p>
          {COLORS.map((color) => (
            <button key = {color} onClick = {() => handleColorChoice(color)}>
              {color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerView;