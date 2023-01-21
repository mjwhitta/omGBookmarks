# omGBookmarks

<a href="https://www.buymeacoffee.com/mjwhitta">🍪 Buy me a cookie</a>

**Note:** This tool has been deprecated in favor of Raindrop.io.

## What is this?

This is a simple project that would allow me to keep my bookmarks in a
browser independent location. The [Chrome extension] works fairly
well. The Firefox extension was left in an unknown state after I
discovered the extension publishing process to be more involved.

[Chrome extension]: https://chrome.google.com/webstore/detail/oh-my-googlebookmarks/bedelhikckhbbpmfhehmnoodboennmkd

## Usage

This extension creates an `omg` keyword. After this keyword you can
type a command or a pattern to search your bookmarks. There are 4
valid commands with an alias for each:

Command | Alias | Description
------- | ----- | -----------
clear   | rm    | Remove local copy of bookmarks
create  | add   | Add a new bookmark to Google Bookmarks
google  | show  | Open Google Bookmarks in a new tab
refresh | pull  | Update local copy of bookmarks

If you type a pattern, it will show matching bookmarks in the
dropdown. You can then press tab to cycle through the results and
enter to select the bookmark.

## Known issues

Ensure all your bookmarks have a label applied to them.
