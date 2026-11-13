# Visual asset credits

## Prepared theme
**daisyUI Night** is the selected preset. APOLO uses the upstream Night theme variables rather than an improvised color palette.
- Project: https://github.com/saadeghi/daisyui
- Preset source: https://github.com/saadeghi/daisyui/blob/master/packages/daisyui/src/themes/night.css
- License: MIT
- Upstream repository stars checked on 2026-11-13: 42,827

## Interface icons
**Lucide** provides the interface icon design language. UI icons are local SVGs or compact inline SVGs; no icon CDN is required at runtime.
- Project: https://github.com/lucide-icons/lucide
- License: ISC
- Upstream repository stars checked on 2026-11-13: 25,740

## Game illustrations
Game illustrations are adapted from **Game Icons**. The upstream project states CC-BY; attribution is included below.
- Project: https://github.com/game-icons/icons
- Website: https://game-icons.net
- Upstream repository stars checked on 2026-11-13: 1,368

| APOLO game | Original asset | Creator directory |
|---|---|---|
| دوز | tic-tac-toe.svg | delapouite |
| سنگ‌کاغذ‌قیچی | fist.svg | lorc |
| کوییز دانستنی | brain.svg | lorc |
| چالش ریاضی | calculator.svg | delapouite |
| چهاردرخط | puzzle.svg | delapouite |
| شطرنج | chess-king.svg | skoll |
| جرئت یا حقیقت | jester-hat.svg | delapouite |
| منچ | rolling-dices.svg | delapouite |
| UNO | card-ace-spades.svg | aussiesim |
| حکم | spades.svg | skoll |
| اسم‌وفامیل | pencil.svg | delapouite |
| مافیا | drama-masks.svg | lorc |

The game-art SVGs were converted to transparent-background variants for the dark theme. Attribution remains with the original creators.

## Telegram integration
The implementation follows the official Telegram Mini Apps ecosystem for initialization and launch-data handling.
- React template: https://github.com/Telegram-Mini-Apps/reactjs-template (MIT, 430 stars checked on 2026-11-13)
- tma.js: https://github.com/Telegram-Mini-Apps/tma.js
- Telegram Mini Apps: https://core.telegram.org/bots/webapps

The server continues to validate raw `Telegram.WebApp.initData`; `initDataUnsafe` is never used as an authentication source.
