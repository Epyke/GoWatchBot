async function searchAnime(query) {
  const graphqlQuery = `
        query ($search: String) {
            Page{
                media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
                    id
                    title {
                        romaji
                        english
                    }
                }
            }
        }
    `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { search: query },
      }),
    });

    const json = await response.json();
    return json.data.Page.media;
  } catch (error) {
    console.error("AniList Search Error:", error);
    return [];
  }
}

module.exports = { getLatestAnimeId, searchAnime };
