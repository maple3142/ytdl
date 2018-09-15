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

[Example](https://maple-ytdl.herokuapp.com/graphql?query=%7B%0A%20%20search(id%3A%20%22XogSflwXgpw%22)%20%7B%0A%20%20%20%20meta%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20thumbnail_url%0A%20%20%20%20%20%20author%0A%20%20%20%20%20%20view_count%0A%20%20%20%20%7D%0A%20%20%20%20stream%20%7B%0A%20%20%20%20%20%20quality%0A%20%20%20%20%20%20type%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20itag%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A):

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

[Source Code](https://github.com/maple3142/browser-extensions/blob/master/scripts/local-youtube-dl.user.js)

A simple youtube link fetcher implemented in browser.
