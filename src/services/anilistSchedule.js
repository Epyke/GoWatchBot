async function getLatestAnimeId() {
  const now = Math.floor(Date.now() / 1000 - 2 * 60 * 60);
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
        bannerImage
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
          id
          rank
          type
          format
          year
          season
          allTime
          context
        }
        trailer{
          id
          site
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

  try {
    const response = await fetch(url, options);
    const json = await response.json();

    if (!response.ok) {
      console.error("AniList API Error:", json);
      return [];
    }

    return json.data.Page.airingSchedules || [];
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

module.exports = { getLatestAnimeId };
