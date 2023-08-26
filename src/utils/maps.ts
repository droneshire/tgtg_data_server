
export function generateMapsUrl(lat: string, lon: string) {
    // URL encode the latitude and longitude
    const encodedLat = encodeURIComponent(lat);
    const encodedLon = encodeURIComponent(lon);

    // Generate the URL
    const baseUrl = "https://www.google.com/maps/search/?api=1&query=";
    return `${baseUrl}${encodedLat}%2C${encodedLon}`;
}
