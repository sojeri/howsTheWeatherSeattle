# How's the weather, Seattle?

[Live link.](https://sojeri.github.io/howsTheWeatherSeattle)

Note that you will always get the Seattle skyline but aren't actually stuck with our weather. You can override the default location (& also units if you prefer metric!) with URL params. Use `zip=your-favorite-postal-code` to get weather for a different location. The weather API backing this uses country code us by default, so if your zip is outside the US you'll need to add a country code, eg `country=cn`. Use `units=metric` to get degrees Celsius rather than Farenheit.

[Eg, Calgary, AB, Canada.](https://sojeri.github.io/howsTheWeatherSeattle?zip=T2H&country=ca&units=metric)

[Eg, Berlin, DE](https://sojeri.github.io/howsTheWeatherSeattle?zip=10117&country=de&units=metric)

[Eg, Taitoku, Tokyo, Japan](https://sojeri.github.io/howsTheWeatherSeattle?zip=111-0032&country=jp&units=metric)

In case you need it, [here is a list of country codes](https://www.iban.com/country-codes). (Use the 2 letter / alpha 2 designation with this app.)

## What even is this?

Inspired by the 100 days of CSS challenge -- specifically, inspired by day 9 -- I wanted to make a little widget that shows the current state of Seattle's weather.

## If I want to play with it myself, what should I do after cloning?

To load the current assets, open this project's [index.html](./index.html) in your favorite browser. Set breakpoints & muck about with CSS, etc to your heart's desire.

You'll need Node.js 8.0.0+ installed to build new assets. I've been developing this on 11.4.0, but you should be able to get by with an older version if that's what you have.

To install dependencies:
```
yarn
```

To bundle the scripts once:
```
yarn build
```

To bundle the scripts every time you change a file eventually imported through `src/index.js`:
```
yarn build:watch
```

To see random notes I've left for myself
```
yarn todo
```

To run the tests, you'll have to write some first. Poor choices that will come back to haunt me include.... @_@

To see my loose to do list:
- [check out the issues in this repository](https://github.com/sojeri/howsTheWeatherSeattle/issues)