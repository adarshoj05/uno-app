const COLOURS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
const WILD_CARDS = ['Wild', 'Wild Draw Four'];

export function createDeck() {
    const deck = [];
    for (const color of COLOURS) {
        for (const value of VALUES) {
            deck.push({color, value});
            if (value !== '0') {
                deck.push({color,value});
            }
        }
    }
    for (const wild of WILD_CARDS) {
        for (let i = 0; i < 4; i++) {
            deck.push({color: 'black', value: wild});
        }
    }
    if (deck.length !== 108) {
        console.warn(`createDeck() built ${deck.length} cards, expected 108`);
    }
    return deck;
}

export function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function dealHands(deck, numPlayers, handSize = 7) {
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
        hands.push(deck.splice(-handSize, handSize).reverse());
    }
    return hands;
}

export function dealCards(deck, count) {
    const dealt = [];
    for (let i = 0; i < count; i++) {
        const card = deck.pop();
        if (!card) break;
        dealt.push(card);
    }
    return dealt;
}

export function drawCard(deck) {
    return dealCards(deck, 1)[0] ?? null;
}