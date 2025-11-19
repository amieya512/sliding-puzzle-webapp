// src/utils/fetchRandomImage.js

export async function fetchRandomImage() {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  const res = await fetch("https://api.pexels.com/v1/search?query=nature&per_page=40", {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Pexels API request failed");
  }

  const data = await res.json();

  // Pick a random photo from the results
  const photos = data.photos;
  const random = photos[Math.floor(Math.random() * photos.length)];

  return random.src.large; // good quality, stable size
}
