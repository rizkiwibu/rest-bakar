(async () => {

  // main function, return object, throws error, param string youtube videos url
  let ytmp3mobi = async (youtubeUrl) => {

    const regYoutubeId = /https:\/\/(www.youtube.com\/watch\?v=|youtu.be\/|www.youtube.com\/shorts\/)([^&|^?]+)/
    const videoId = youtubeUrl.match(regYoutubeId) // 0OjISWlmM9k (example)

    if (!videoId) throw Error("cant extract youtube video id from given link. please check your youtube link")

    const urlParam = {
      v: videoId[2], // your youtube video id 0OjISWlmM9k (example)
      f: "mp4", // or mp4 if you want to download video
      _: Math.random()
    }

    const headers = {
      "Referer": "https://id.ytmp3.mobi/",
    }

    const fetchJson = async (url, fetchDescription) => {
      const res = await fetch(url, { headers })
      if (!res.ok) throw Error(`fetch failed on ${fetchDescription} | ${res.status} ${res.statusText}`)
      const json = await res.json()
      return json
    }

    const { convertURL } = (await fetchJson("https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(), "get convertURL"))
    const { progressURL, downloadURL } = (await fetchJson(`${convertURL}&${new URLSearchParams(urlParam).toString()}`, "get progressURL and downloadURL"))

    let { error, progress, title } = {}
    while (progress != 3) {
      ({ error, progress, title } = (await fetchJson(progressURL, "fetch progressURL")))
      if (error) throw Error(`error found in json object, here the value of error key : ${error}`)
      // let statusToPrint = progress == 1 ? "[loading]" : progress == 2 ? "[converting]" : "[ready]"
      // statusToPrint += ` ${title}`
      // console.log(statusToPrint)
    }

    const result = {
      title,
      downloadURL
    }

    return result
  }

  // how to use
  const youtubeUrl = "https://youtu.be/UHr7YQZcodA?si=J2rm7SovP8ALkjpC"

  ytmp3mobi(youtubeUrl)
    .then(data => console.log(data))
    .catch(error => console.log(error.message))

})()
