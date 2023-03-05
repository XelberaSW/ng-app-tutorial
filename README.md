# Angular App Tutorial by XelberaSW

This library creates application interactive tutorial that could be used by you to show all functions of your app for new users.
It should support any Angular version since 12.

## Installation

Using `npm`:

```
npm i @xelberasw/ng-app-tutorial --save
```

Using `yarn`:

```
yarn add @xelberasw/ng-app-tutorial
```

## Postinstall

This library supports [standalone API](https://angular.io/api/platform-browser/bootstrapApplication) (available since Angular 14) as well as standard modular API as well.

### Standalone API (Supported by angular 14 and newer)

Inject service `NgAppTutorialService` into component you want help show request could be dispatched from. Nothing to be injected of set up before.

### Standard Modular API (Backward compatability)

Import module `NgAppTutorialModule` into your AppModule. After this you will be able to use service `NgAppTutorialService` in any component you want help show request could be dispatched from. Nothing to be injected of set up before.

## Usage

## Data attributes

|Attribute|Type|Optional|Description|
|---|---|---|---|
|data--tutorial-id|`string`|`NO`|Unique identifier of item|
|data--tutorial-order|`number`|yes|Order to be used|
|data--tutorial-text|`string`|yes`*`|Text to be shown|
|data--tutorial-md|`string`|yes`*`|[Markdown](https://www.markdownguide.org/) text to be shown|
|data--tutorial-md-src|`string`|yes`*`|Link to [Markdown](https://www.markdownguide.org/) document to be shown|
|data--tutorial-clickable|`any`|yes|If this must be clickable in tutorial mode|
|data--tutorial-next-id|`string`|yes|Unique identifier of item to be shown next. Overrides `data--tutorial-order`|

>`*`: One of `data--tutorial-text`, `data--tutorial-md` or `data--tutorial-md-src` must be set
 
### Showing tutorial UI

Inject `NgAppTutorialService` in any component and call `show` method. That's all )

All you need is having data attributes set up.

This module tracks mutations of `data--tutorial-id` so UI could be mutated even if tutorial UI is already shown.

### Styling

You could modify visual by setting up custom [CSS Variable](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

| Variable | Default value | Description |
|---|---|---|
|--ng-app-tutorial--backdrop-z-index|2147483600|z-index of backdrop. All other items will be places above it|
|--ng-app-tutorial--frame-color|#ffffff|Color of frames and arrow|
|--ng-app-tutorial--frame-width|0.125rem|Width of frame for popup|
|--ng-app-tutorial--popup-border-radius|0.5rem|Border radius to be use on popup and buttons inside|
|--ng-app-tutorial--popup-background|rgba(0 31 63 / 1)|Background of popup|
|--ng-app-tutorial--popup-color|var(--ng-app-tutorial--frame-color)|Color of text in popup|
|--ng-app-tutorial--popup-shadow|0 1.4286rem 1.7857rem rgba(0, 0, 0, 0.25)|Shadow definition for popup|
|--ng-app-tutorial--btn-background|var(--ng-app-tutorial--popup-background)|Background of any button in popup|
|--ng-app-tutorial--btn-color|var(--ng-app-tutorial--popup-color)|Color of text on any button in popup|
|--ng-app-tutorial--gap|0.625rem|Gap between items in popup. It is used for padding, spacing between buttons and so on|
|--ng-app-tutorial--backdrop-background|rgba(0 0 0 / 0.5)|Background of backdrop|
|--ng-app-tutorial--backdrop-blur|1px|Size of blur to be applied for backdrop|
|--ng-app-tutorial--animation-duration|0.3s|Length of animations used inside this module|

**!NB!** This module is `prefers-reduced-motion`-friendly, so `--ng-app-tutorial--animation-duration` will be set to `0s` automatically if user do not want any animation to occur.



## Support

please feel free to create PR-s with fixes and extending fulctionality.