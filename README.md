# magic-conch-shell

Discord bot

## Commands

### music related

---

#### `/play <q> [querytype]`

- `q` url or query
- plays the first match
- `[querytype]`
  - optional search engine `discord-player#QueryType`
  - `default=YOUTUBE_SEARCH`

---

`/search <q> [count] [querytype]`

- `q` url or query
- `querytype`
  - optional search engine `discord-player#QueryType`
  - `default=YOUTUBE_SEARCH` 
- returns dropdown menu for results
- forward response to `/play`

---

`playlist <url> [querytype]`

- `url` playlist url
- `querytype` optional, `default=YOUTUBE_PLAYLIST`

---

`/queue`

- returns queue with 10(?) items per page.
- Expires after 10(?) seconds
- `[<]` and `[>] buttons to navigate page.

---

`/skip [count]`

- `count` optional skip count, default=1
- skips current song

---

`/stop`

- stops music, bot leaves the channel, clears queue

---

`/clear`

- clear queue

---

`/history`

- show history of recent songs, layout same as `/queue`

---

###Funny
- Agree
- Bite
- Boop
- Cry
- Hug
- Kiss
- Lick
- Pat
- Pickle
- Punch
- Slap
- Roast

---
