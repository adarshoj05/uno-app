// App.jsx
// -----------------------------------------------------------------------
// Top-level component. It only has two jobs:
//   1. Make sure we're signed in to Firebase (anonymously) before
//      rendering anything that touches Firestore — otherwise reads/
//      writes would just get rejected by firestore.rules.
//   2. Decide which "screen" to show: the lobby (no room yet), or
//      once in a room, either the player's hand view or the shared
//      table view, depending on which role this device picked.
//
// LobbyView, PlayerView, and TableView live in their own files (not
// built yet) — this file only decides WHEN to show each one, it
// doesn't contain any of their actual UI.
// -----------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { ensureSignedIn } from './firebase/config';
import LobbyView from './views/LobbyView.jsx';
import PlayerView from './views/PlayerView';
import TableView from './views/TableView';

function App() {
  // Becomes true once Firebase has actually confirmed we're signed
  // in. Nothing that touches Firestore should render before this.
  const [isSignedIn, setIsSignedIn] = useState(false);

  // null until the person creates or joins a room. Once set, it's
  // the room code everything else (PlayerView, TableView) needs to
  // know which Firestore document to subscribe to.
  const [roomCode, setRoomCode] = useState(null);

  // Which screen THIS device should show once it's in a room —
  // decided in the lobby when someone picks "I'm a player" vs
  // "this is the table."
  const [role, setRole] = useState(null); // 'player' | 'table'

  useEffect(() => {
    ensureSignedIn().then(() => setIsSignedIn(true));
  }, []);

  // Still waiting on Firebase — show basically nothing rather than a
  // half-working screen that might try to read Firestore too early.
  if (!isSignedIn) {
    return <div className="loading">Connecting...</div>;
  }

  // No room joined/created yet — show the lobby. It's responsible for
  // calling onJoin(code, role) once the person creates or joins one.
  if (!roomCode) {
    return (
      <LobbyView
        onJoin={(code, chosenRole) => {
          setRoomCode(code);
          setRole(chosenRole);
        }}
      />
    );
  }

  // In a room now — render whichever screen matches this device's role.
  return role === 'table' ? (
    <TableView roomCode={roomCode} />
  ) : (
    <PlayerView roomCode={roomCode} />
  );
}

export default App;