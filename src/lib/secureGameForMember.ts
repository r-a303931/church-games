import { Game, GameType, RoomParticipant, UNO } from 'common';
import { CardType, HandCard } from 'common/dist/types/uno';

const stripUnoGame = (participant: RoomParticipant) => (game: UNO.Game): UNO.Game => ({
	currentPlayerID: game.currentPlayerID,
	deck: game.deck.map(({ id }) => ({ id, type: CardType.UNKNOWN })),
	discardPile: game.discardPile,
	players: [
		...game.players.filter(({ playerID }) => playerID === participant.id),
		...game.players
			.filter(({ playerID }) => playerID !== participant.id)
			.map(player => ({
				playerID: player.playerID,
				cards: player.cards.map<HandCard>(({ id }) => ({ id, type: CardType.UNKNOWN })),
			})),
	],
	type: GameType.UNO,
});

export default (game: Game, participant: RoomParticipant): UNO.Game => {
	switch (game.type) {
		case GameType.UNO:
			return stripUnoGame(participant)(game);
	}
};
