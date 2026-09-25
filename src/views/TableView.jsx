import { useRoomListener } from "../firebase/useRoomListener";

function TableView({ roomCode }) {
  const { room, players, loading } = useRoomListener(roomCode);

  if (loading ||!room) return <div>Loading room...</div>;

  if (room.status === 'lobby') {
    return (
      <div>
        <h1>Room Code: {roomCode}</h1>
        <p>Waiting for players to join...</p>
        <ul>
          {Object.entries(players).map(([playerId, p]) => (
            <li key = {playerId}>{p.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  const topCard = room.discardPile[room.discardPile.length - 1];
  const currentPlayerId = room.playerOrder[room.currentPlayerId];

  return (
    <div>
      <h2>{players[currentPlayerId]?.name}'s turn</h2>

      <div className = "discard-pile">
        <p>{topCard.color} {topCard.value}</p>
        <p>Current color: {room.currentColor}</p>
      </div>

      <div className = "player-list">
        {room.playerOrder.map((playerId) => (
          <div
            key = {playerId}
            className = {playerId === currentPlayerId ? 'active-player' : ''}
          >
            {players[playerId]?.name}: {players[playerId]?.handCount} cards
            {players[playerId]?.saidUno && ' - said UNO!'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableView;