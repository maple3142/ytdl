# ytdl

> Get youtube video download url

## JSON api

A sample url to get information of **[DAOKO × 米津玄師『打上花火』MUSIC VIDEO](https://www.youtube.com/watch?v=-tKVN2mAKRI)**.

[https://ytdl.maple3142.net/api?id=-tKVN2mAKRI](https://ytdl.maple3142.net/api?id=-tKVN2mAKRI)

> To download other video, just change id in the url.

### Formatted version

[https://ytdl.maple3142.net/api?id=T2pdmZhDXfo&format=1](https://ytdl.maple3142.net/api?id=T2pdmZhDXfo&format=1)

> You can append `format=1` to get a human readable JSON.

## Graphql

Graphiql: [https://ytdl.maple3142.net/graphql](https://ytdl.maple3142.net/graphql)

### [Example](https://ytdl.maple3142.net/graphql?query=query%20(%24id%3A%20String!)%20%7B%0A%20%20search(id%3A%20%24id)%20%7B%0A%20%20%20%20meta%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20thumbnail_url%0A%20%20%20%20%20%20author%0A%20%20%20%20%20%20view_count%0A%20%20%20%20%7D%0A%20%20%20%20stream%20%7B%0A%20%20%20%20%20%20quality%0A%20%20%20%20%20%20type%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20itag%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&variables=%7B%0A%20%20%22id%22%3A%20%22XogSflwXgpw%22%0A%7D%0A)

Query:

```graphql
query ($id: String!) {
  search(id: $id) {
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

Variables:

```json
{
  "id": "XogSflwXgpw"
}
```

## Userscript

[Local YouTube Downloader](https://greasyfork.org/zh-TW/scripts/369400-local-youtube-downloader)

[Source Code](https://github.com/maple3142/browser-extensions/blob/master/scripts/local-youtube-dl.user.js)

A simple youtube link fetcher implemented in browser.
