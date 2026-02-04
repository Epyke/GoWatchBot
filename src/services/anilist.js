async function getLatestAnimeId() {
  const now = Math.floor(Date.now() / 1000);
  const tomorrow = now + 86400;

  var query = `query ($now: Int, $tomorrow: Int) {
  Page{
    pageInfo {
      hasNextPage
    }
    airingSchedules (airingAt_greater: $now, airingAt_lesser: $tomorrow, sort: TIME) {
        id
        airingAt
        episode
        timeUntilAiring
      media{
        id
        title {
          english
          romaji
        }
        coverImage {
          extraLarge
          color
        }
        genres
        description(asHtml: false)
        averageScore
        popularity
        rankings {
          rank
        }
        favourites
        episodes
        season
        startDate {
          day
          month
          year
        }
        status
        studios(sort: NAME, isMain:true) {
          nodes {
            name
          }
        }
        siteUrl
      }
    }
  }
}`;

  const variables = {
    now: now,
    tomorrow: tomorrow,
  };

  var url = "https://graphql.anilist.co",
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };

  fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  function handleData(data) {
    console.log(data);
  }

  function handleError(error) {
    console.error(error);
  }
}

module.exports = { getLatestAnimeId };
