# APOLO Mini App

A source-controlled Persian Telegram Mini App for the Apolo game bot.

## Project intent

This directory is the maintainable source for the Apolo Mini App. The production bot continues to own game state, matchmaking, friend requests, groups, the blind-date queue, player profiles, XP, coins, and game widgets. The Mini App is the user-facing lobby and navigation layer that calls the bot's existing flows.

## References used

- Telegram's official Mini Apps documentation: https://core.telegram.org/bots/webapps
- Telegram-Mini-Apps `tma.js` source and init-data validation: https://github.com/Telegram-Mini-Apps/tma.js
- Telegram-Mini-Apps React template for launch, theme, viewport, and BackButton integration patterns: https://github.com/Telegram-Mini-Apps/reactjs-template
- The server-side `/api/bootstrap` endpoint validates `Telegram.WebApp.initData`. Never trust `initDataUnsafe` for authentication.
- Keep game artwork under `assets/games/`; `/assets/game-art.json` is the bundled source used to self-host those SVGs from the Worker.
- Do not put the bot token, webhook secret, or admin secret in this repository.

## Bot terminology and live routes

The labels and game IDs in `index.html` mirror the Apolo bot:

- Games: `ttt`, `rps`, `quiz`, `math`, `four`, `chess`, `td`, `ludo`, `uno`, `hokm`, `esf`, `mafia`.
- Quick matchmaking: `/start app_quick`.
- A game widget: `/start app_game_<game-id>`.
- Friends, groups, blind date, shop, and profile: `/start app_friends`, `app_groups`, `app_blind`, `app_shop`, and `app_profile`.

The Mini App deliberately routes game actions back to the bot's real game engine. It does not create a second, disconnected game database or fake multiplayer state.

The lobby renders its usable layout and local game-art cards before Telegram SDK initialization or the D1 bootstrap completes. Telegram's bridge is loaded asynchronously; the authenticated bootstrap has a bounded timeout and leaves the lobby visible with retry feedback instead of trapping the user on a blocking loading page.

Game cards are grouped into three categories matching the bot's vocabulary: فکری و استراتژی, دانش و سرعت, and دورهمی و کارتی. Artwork is self-hosted by the same Worker and therefore does not depend on a remote image CDN at launch.

The selected visual preset is the upstream **daisyUI Night** theme. UI symbols follow **Lucide**; game illustrations come from **Game Icons**. See [ASSET-CREDITS.md](./ASSET-CREDITS.md) for upstream projects, licenses and attribution.

## Local preview

Open `index.html` through a local web server. The Mini App requires a Telegram launch context to authenticate. The app displays a safe entry message when opened outside Telegram.

## Security

- Do not put the bot token, webhook secret, or admin secret in this folder.
- Send raw `Telegram.WebApp.initData` to the server as an Authorization value beginning with `tma `.
- The server validates the HMAC using the bot token, following Telegram's documented algorithm and the `@tma.js/init-data` reference implementation.
