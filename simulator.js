class Card {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }

    toString() {
        return `${this.color} ${this.value}`;
    }

    isActionCard() {
        return ['Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild Draw Four'].includes(this.value);
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const colors = ['Red', 'Yellow', 'Green', 'Blue'];
        const values = Array.from({ length: 10 }, (_, i) => i.toString()); // 0-9
        const actionValues = ['Skip', 'Reverse', 'Draw Two'];
        const wilds = ['Wild', 'Wild Draw Four'];

        for (let color of colors) {
            for (let value of values) {
                this.cards.push(new Card(color, value));
                if (value !== '0') { // Each color gets two of each number except 0
                    this.cards.push(new Card(color, value));
                }
            }
            for (let value of actionValues) {
                this.cards.push(new Card(color, value), new Card(color, value));
            }
        }

        for (let wild of wilds) {
            for (let i = 0; i < 4; i++) { // Four of each Wild and Wild Draw Four
                this.cards.push(new Card('Wild', wild));
            }
        }

        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }
}

class UnoGame {
    constructor(playerCount) {
        this.deck = new Deck();
        this.players = Array.from({ length: playerCount }, () => ({ hand: [] }));
        this.discardPile = [];
        this.currentPlayer = 0;
        this.direction = 1; // 1 for clockwise, -1 for counterclockwise
        this.gameOver = false;

        this.start();
    }

    start() {
        for (let player of this.players) {
            for (let i = 0; i < 7; i++) {
                player.hand.push(this.deck.draw());
            }
        }

        this.discardPile.push(this.deck.draw());
    }

    playCard(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.hand.splice(cardIndex, 1)[0];
        const nextPlayer = (this.currentPlayer + this.direction + this.players.length) % this.players.length

        this.discardPile.push(card);

        function getRandomColor() {
            const colorNum = Math.floor(Math.random() * 4);
            switch (colorNum) {
                case 0:
                    return "Red"
                case 1:
                    return "Blue"
                case 2:
                    return "Yellow"
                default:
                    return "Green"
            }
        }

        // Handle special cards
        if (!card || !card.value) {
            console.log(card, cardIndex);
            console.log(player);
        }
        switch (card.value) {
            case 'Skip':
                // Skip the next player
                this.currentPlayer = nextPlayer;
                break;
            case 'Reverse':
                // Reverse the play direction
                this.direction *= -1;
                break;
            case 'Draw Two':
                // The next player draws two cards
                // Placeholder for draw two logic
                this.drawCard((this.currentPlayer + this.direction + this.players.length) % this.players.length)
                this.drawCard((this.currentPlayer + this.direction + this.players.length) % this.players.length)
                this.currentPlayer = nextPlayer;
                break;
            case 'Wild':
                // Player chooses color
                this.discardPile.at(-1).color = getRandomColor();
                break;
            case 'Wild Draw Four':
                // Next player draws four cards and player chooses color
                this.discardPile.at(-1).color = getRandomColor();
                for (let i = 0; i < 4; i++) {
                    this.drawCard(nextPlayer);
                }
                this.currentPlayer = nextPlayer;
                break;
        }

        // Change the turn, considering the direction
        // Need to recalculate next player
        this.currentPlayer = (this.currentPlayer + this.direction + this.players.length) % this.players.length;
    }

    drawCard(playerIndex) {
        // Reshuffle if out of cards
        if (this.deck.cards.length === 0) {
            this.deck.cards = [...this.discardPile];
            this.discardPile = this.deck.cards.pop();
            
            this.deck.shuffle();
        }
        const player = this.players[playerIndex];
        const card = this.deck.draw();
        player.hand.push(card);

        // Change turn if normal rules
        // this.currentPlayer = (this.currentPlayer + this.direction + this.players.length) % this.players.length;
    }

    async takeTurn() {
        // Check for matching color first
        const hand = this.players[this.currentPlayer].hand;
        const playableCards = [];
        for (let i = 0; i < hand.length; i++) {
            if (this.playableCard(hand[i])) { playableCards.push({ card: hand[i], index: i }) }
        }

        console.log(this.discardPile.at(-1))
        console.log(playableCards);

        // Choose a card to play if a valid move exists
        if (playableCards.length > 0) {
            // TODO: Add logic to bot choices
            this.playCard(this.currentPlayer, playableCards[0].index);
            if (hand.length < 1) {
                alert('Game Over!')
                this.gameOver = true;
            }
            return;
        }



        // Draw until a valid card is drawn
        while (!this.playableCard(this.players[this.currentPlayer].hand.at(-1))) {
            this.drawCard(this.currentPlayer);
            await this.delay(250);

        }
        this.playCard(this.currentPlayer, this.players[this.currentPlayer].hand.length - 1);

    }

    playableCard(card) {
        return (card.color === "Wild" ||
            card.value === this.discardPile.at(-1).value ||
            card.color === this.discardPile.at(-1).color)

    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}




// Example usage
// Show initial hand of
