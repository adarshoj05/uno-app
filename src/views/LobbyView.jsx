import { useState } from "react";
import { createRoom, joinRoom } from "../firebase/roomActions";

function LobbyView({ onJoin }) {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreateRoom() {
    if (!name.trim()) {
      setError('Enter a name first');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const roomCode = await createRoom(name.trim());
      onJoin(roomCode, 'player');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  async function handleJoinAsPlayer() {
    if (!name.trim() || !roomCodeInput.trim()) {
      setError('Enter a name and room code first');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const code = roomCodeInput.trim().toUpperCase();
      await joinRoom(code, name.trim());
      onJoin(code, 'player');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  function handleJoinAsTable() {
    if (!roomCodeInput.trim()) {
      setError('Enter a room code first');
      return;
    }
    onJoin(roomCodeInput.trim().toUpperCase(), 'table');
  }

  return (
    <div className = "lobby">
      <h1>UNO</h1>

      {error && <p className="error">{error}</p>}

      <label>
        Your Name: 
        <input 
          value = {name}
          onChange = {(e) => setName(e.target.value)}
          disabled = {isLoading}
          placeholder = "Player"
        />
      </label>

      <button onClick = {handleCreateRoom} disabled = {isLoading}>
        Create New Room
      </button>

      <hr />

      <label>
        Room code: 
        <input
          value = {roomCodeInput}
          onChange = {(e) => setRoomCodeInput(e.target.value)}
          disabled = {isLoading}
          placeholder = "eg. AB12"
        />
      </label>

      <button onClick = {handleJoinAsPlayer} disabled = {isLoading}>
        Join as Player
      </button>

      <button onClick = {handleJoinAsTable} disabled = {isLoading}>
        Use This Device as the Table
      </button>
    </div>
  );
}

export default LobbyView;