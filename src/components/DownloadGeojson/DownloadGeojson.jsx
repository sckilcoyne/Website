/*
Retrieve a GeoJSON from a url, e.g. GitHub

*/

export default async function DownloadGeojson( url ) {
    console.log('Fetching Geojson data from', url);

    let geojson = await fetch(url)
        .then((response) => response.json())

    console.log('Downloaded Geojson', geojson)

    return geojson
}
