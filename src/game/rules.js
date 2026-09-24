const WILD_VALUES = ['Wild', 'Wild Draw Four'];

export function isWildCard(card) {
  return WILD_VALUES.includes(card.value);
}

export function isValidPlay(card, topCard, currentColor) {
  if (isWildCard(card)) return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function getPlayableCards(hand, topCard, currentColor) {
  return hand.filter((card) => isValidPlay(card, topCard, currentColor));
}

export function getNextPlayerIndex(currentIndex, direction, numPlayers, steps = 1) {
  return (currentIndex + direction * steps + numPlayers * steps) % numPlayers;
}

export function reverseDirection(direction) {
  return direction * -1;
}

export function getCardEffect(card) {
  switch (card.value) {
    case 'Skip':
      return { skipNext: true, reverse: false, drawCount: 0, needsColorChoice: false };

    case 'Reverse':
      return { skipNext: false, reverse: true, drawCount: 0, needsColorChoice: false };

    case 'Draw Two':
      // next player draws 2 AND loses their turn — both effects happen together
      return { skipNext: true, reverse: false, drawCount: 2, needsColorChoice: false };

    case 'Wild':
      return { skipNext: false, reverse: false, drawCount: 0, needsColorChoice: true };

    case 'Wild Draw Four':
      return { skipNext: true, reverse: false, drawCount: 4, needsColorChoice: true };

    default:
      // plain number card — no special effect
      return { skipNext: false, reverse: false, drawCount: 0, needsColorChoice: false };
  }
}

export function wasWildDrawFourLegal(handBeforePlay, currentColor) {
  return !handBeforePlay.some(
    (card) => card.color === currentColor && !isWildCard(card)
  );
}