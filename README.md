DF
==========
[![Build Status](https://travis-ci.org/Aldenard/DF.svg?branch=master)](https://travis-ci.org/Aldenard/DF)
[![dependencies](https://david-dm.org/Aldenard/DF.png)](https://david-dm.org/ALdenard/DF)

DF = Duty Finder

## Events

### Client to Server
- join
- leave
- accept

### Server to Client
- joined
- updated
- matched
- canceled
- accepted

## Data Format

### join
```js
{
  name: "name",
  role: "t, d or h"
}
```


### Updated
```js
{
  party: {
    t: {current: 0, accept: 0, require: 1},
    d: {current: 0, accept: 0, require: 2},
    h: {current: 0, accept: 0, require: 1}
  }
};
```

### Accepted
```js
{
  players: ["list", "of", "name"]
}
```

## License

:copyright: 2014 Takeshi Yaeda. Released under the [MIT license](http://www.opensource.org/licenses/mit-license.php).
