# ytdl

> Get youtube video download url

## JSON api

A sample url to get information of **[DAOKO × 米津玄師『打上花火』MUSIC VIDEO](https://www.youtube.com/watch?v=-tKVN2mAKRI)**.

[https://maple-ytdl.herokuapp.com/api?id=-tKVN2mAKRI](https://maple-ytdl.herokuapp.com/api?id=-tKVN2mAKRI)

> To download other video, just change id in the url.

### Formatted version

[https://maple-ytdl.herokuapp.com/api?id=T2pdmZhDXfo&format=1](https://maple-ytdl.herokuapp.com/api?id=T2pdmZhDXfo&format=1)

> You can append `format=1` to get a human readable JSON.

## Graphql

Graphiql: [https://maple-ytdl.herokuapp.com/graphql](https://maple-ytdl.herokuapp.com/graphql)

```graphql
{
  search(id: "XogSflwXgpw") {
    meta {
      title
      thumbnail_url
      author
      view_count
    }
    stream {
      quality
      type
      url
      itag
    }
  }
}
```

## Telegram bot

[@ytdl3142_bot](http://t.me/ytdl3142_bot)

Send video URL to the bot, and it will retrieve the raw video URL for you.

## Userscript

[Local YouTube Downloader](https://greasyfork.org/zh-TW/scripts/369400-local-youtube-downloader)

A simple youtube link fetcher implemented in browser.
