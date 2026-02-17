import type { OverpassJson } from "overpass-ts";
import { overpassJson } from "overpass-ts";
// import { strict as assert } from 'assert';
import osmtogeojson from "osmtogeojson"

export default async function Overpass() {
  console.log('Fetching bike parking through overpass');
  const query = `[out:json][timeout:25]; 
                  (
                    area["wikipedia"="en:Boston"];
                    area["wikipedia"="en:Cambridge, Massachusetts"];
                    area["wikipedia"="en:Brookline, Massachusetts"];
                    area["wikipedia"="en:Somerville, Massachusetts"];
                  )->.searchArea; nwr["amenity"="bicycle_parking"](area.searchArea); 
                out geom;`

  // let attemptCounter = 0
  // let delay = 10
  // try {
  //   attemptCounter++

  //   let json = await overpassJson(query)

  // } catch (error) {
  //   console.log(`Attempt ${attemptCounter} failed with error: ${error.message}. Waiting ${delay} ms before retrying.`);
  // }

  let json = await overpassJson(query)
  let geojson = await osmtogeojson(await json)
  console.log('overpass bike parking data', geojson)
  return geojson

  // overpassJson(query).then((json) => {
  //   // let geojson = osmtogeojson(json)
  //   // console.log('overpass geojson', geojson)
  //   // return geojson
  //   console.log('overpass json', json)
  //   return osmtogeojson(json)
  // })
  
}
