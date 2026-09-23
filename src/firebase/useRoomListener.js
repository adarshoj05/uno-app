import { useEffect, useState } from "react";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export function useRoomListener(roomCode) {
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomCode) return;

        const unsubRoom = onSnapshot(doc(db, "rooms", roomCode), (snap) => {
            setRoom(snap.exists() ? snap.data() : null);
            setLoading(false);
        });

        const unsubPlayers = onSnapshot(
            collection(db, "rooms", roomCode, "players"),
            (snap) => {
                const next = {};
                snap.forEach((docSnap) => {
                    next[docSnap.id] = docSnap.data();
                });
                setPlayers(next);
            }
        );

        return () => {
            unsubRoom();
            unsubPlayers();
        };
    }, [roomCode]);

    return { room, players, loading };
}

export function useOwnHandListener(roomCode) {
    const [hand, setHand] = useState([]);
    const uid = auth.currentUser?.uid;

    useEffect(() => {
        if (!roomCode || !uid) return;

        const unsub = onSnapshot(
            doc(db, "rooms", roomCode, "players", uid, 'private', 'hand'),
            (snap) => setHand(snap.exists() ? snap.data()?.cards : [])
        );

        return () => unsub();
    }, [roomCode, uid]);

    return hand;
}