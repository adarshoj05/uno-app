// LobbyView.jsx — TEMPORARY PLACEHOLDER
// -----------------------------------------------------------------------
// Just enough to satisfy App.jsx's import and let you test that Firebase
// sign-in actually works end to end. The real create-room/join-room UI
// (room code input, host vs table choice, etc.) gets built here later —
// this file will be fully replaced, not extended.
// -----------------------------------------------------------------------
function LobbyView({ onJoin }) {
  return (
    <div>
      <p>Lobby placeholder — real create/join UI comes in a later step.</p>
      <button onClick={() => onJoin('TEST', 'player')}>
        Fake join room "TEST" as player
      </button>
      <button onClick={() => onJoin('TEST', 'table')}>
        Fake join room "TEST" as table
      </button>
    </div>
  );
}

export default LobbyView;