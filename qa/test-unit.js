const fortune = require('../lib/fortune');
const expect = require('chai').expect;

suite('Fortune cookie tests', () => {
    test('getFortune() should return a fortune', () => {
        expect(typeof fortune.getFortune() === 'string');
    });
    test('getFortune() should return random fortunes', () => {
        const fortunes = [];
        const getFortune = fortune.getFortune;
        for (let i = 0; i < 10; i++) {
            let fortuneStr = getFortune();
            if (!fortunes.includes(fortuneStr)) {
                fortunes.push(fortuneStr);
            }
        }
        console.log(fortunes);
        expect(fortunes.length > 1);
    });
});