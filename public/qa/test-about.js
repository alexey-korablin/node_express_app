suite('"About" Tests Page', () => {
    test('page should contain link to contact page', () => {
        console.log($('a[href="/contact"]'));
        assert($('a[href="/contact"]').length);
    });
});