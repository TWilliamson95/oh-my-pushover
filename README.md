# Pushover

This is a handler to handle calls to the [Pushover API](https://pushover.net/api).

Its usage is simple, create a new instance of the class:

```
const pushoverHandler = new PushoverHandler(
  {
    user: "testUser",
    token: "testToken",
  }
);
```

then make a call like:

```
await pushoverHandler.sendMessage("test message", Priority.EMERGENCY);
```

Note: The `Priority` enum is also exported from this package.

## Notes:

This package uses [oh-my-got-so-simple](https://github.com/TWilliamson95/oh-my-got) - a wrapper for got.
