import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from './config';
import { createDeck, shuffleDeck, dealCards, drawCard } from '../game/deck';
import { isValidPlay, getCardEffect, getNextPlayerIndex, reverseDirection } from '../game/rules';

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function createRoom(hostName) {
    const roomCode = generateRoomCode();
    const uid = auth.currentUser.uid;

    await setDoc(doc(db, 'rooms', roomCode), {
        host: uid,
        status: 'lobby',
        direction: 1,
        currentColor: null,
        discardPile: [],
        deck: [],
        playerOrder: [uid],
        currentPlayerIndex: 0,
    });

    await setDoc(doc(db, 'rooms', roomCode, 'players', uid), {
        name: hostName,
        handCount: 0,
        saidUno: false,
    });

    return roomCode;
}

export async function joinRoom(roomCode, playerName) {
    const uid = auth.currentUser.uid;
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) throw new Error('Room not found');
    if (roomSnap.data().status !== 'lobby') throw new Error('Game already started');

    await setDoc(doc(db, 'rooms', roomCode, 'players', uid), {
        name: playerName,
        handCount: 0,
        saidUno: false,
    });

    await updateDoc(roomRef, {
        playerOrder: [...roomSnap.data().playerOrder, uid],
    });
}

export async function startGame(roomCode) {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    const { playerOrder } = roomSnap.data();

    let deck = shuffleDeck(createDeck());

    for (const uid of playerOrder) {
        const hand = dealCards(deck, 7);
        await setDoc(doc(db, 'rooms', roomCode, 'players', uid, 'private', 'hand'), {
            cards: hand,
        });
        await updateDoc(doc(db, 'rooms', roomCode, 'players', uid), {
            handCount: hand.length,
        });
    }

    let startingCard = drawCard(deck);
    while (startingCard.color === 'black') {
        deck.push(startingCard);
        deck = shuffleDeck(deck);
        startingCard = drawCard(deck);
    }

    await updateDoc(roomRef, {
        status: 'playing',
        deck,
        discardPile: [startingCard],
        currentColor: startingCard.color,
        currentPlayerIndex: 0,
    });
}

export async function playCard(roomCode, card, chosenColor = null) {
    const roomRef = doc(db, 'rooms', roomCode);
    const handRef = doc(db, 'rooms', roomCode, 'players', playerId, 'private', 'hand');

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        const handSnap = await transaction.get(handRef);
        const room = roomSnap.data();
        const hand = handSnap.data().cards;

        const topCard = room.discardPile[room.discardPile.length - 1];
        if (isValidPlay(card, topCard, room.currentColor)) {
            throw new Error('Illegal move');
        }

        const cardIndex = hand.findIndex(
            (c) => c.color === card.color && c.value === card.value
        );
        const newHand = [...hand];
        newHand.splice(cardIndex, 1);

        const effect = getCardEffect(card);
        const newColor = effect.needsColorChoice ? chosenColor : card.color;

        let newDirection = room.direction;
        if (effect.reverse) newDirection = reverseDirection(room.direction);

        const steps = effect.skip ? 2 : 1;
        const nextIndex = getNextPlayerIndex(
            room.currentPlayerIndex, newDirection, room.playrOrder.length, steps
        );

        let updatedDeck = room.deck;

        if (effect.drawCount > 0) {
            const skippedPlayerId = room.playerOrder[
                getNextPlayerIndex(room.currentPlayerIndex, newDirection, room.playerOrder.length, 1)
            ];
            const penaltyCards = dealCards(updatedDeck, effect.drawCount);
            const skippedHandRef = doc(
                db, 'rooms', roomCode, 'players', skippedPlayerId, 'private', 'hand'
            );
            const skippedHandSnap = await transaction.get(skippedHandRef);
            const skippedHand = [...skippedHandSnap.data().cards, ...penaltyCards];
            transaction.set(skippedHandRef, { cards: skippedHand });
            transaction.update(
                doc(db, 'rooms', roomCode, 'players', skippedPlayerId),
                { handCount: skippedHand.length }
            );
        }

        transaction.set(handRef, { cards: newHand });
        transaction.update(playerRef, { handCount: newHand.length, saidUno: false });
        transaction.update(roomRef, {
            discardPile: [...room.discardPile, card],
            currentColor: newColor,
            direction: newDirection,
            currentPlayerIndex: nextIndex,
            deck: updatedDeck,
            status: newHand.length === 0 ? 'finished' : 'playing',
        });
    });
}

export async function drawCardForPlayer(roomCode, playerId) {
  const roomRef = doc(db, 'rooms', roomCode);
  const handRef = doc(db, 'rooms', roomCode, 'players', playerId, 'private', 'hand');
 
  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    const handSnap = await transaction.get(handRef);
    const room = roomSnap.data();
 
    const deck = [...room.deck];
    const card = drawCard(deck);
    const newHand = [...handSnap.data().cards, card];
 
    const nextIndex = getNextPlayerIndex(
      room.currentPlayerIndex, room.direction, room.playerOrder.length, 1
    );
 
    transaction.set(handRef, { cards: newHand });
    transaction.update(
      doc(db, 'rooms', roomCode, 'players', playerId),
      { handCount: newHand.length }
    );
    transaction.update(roomRef, {
      deck,
      currentPlayerIndex: nextIndex,
    });
  });
}

export async function callUno(roomCode, playerId) {
  await updateDoc(doc(db, 'rooms', roomCode, 'players', playerId), {
    saidUno: true,
  });
}