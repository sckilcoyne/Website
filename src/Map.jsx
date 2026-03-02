import { useRef, useEffect, useState } from 'react'
// import { renderToStaticMarkup } from 'react-dom/server';
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'

import Legend from './Legend';
import SideBar, {ModeToggle} from './components/selection/SideBar'
// import {ModeToggle} from './components/selection/SideBar'

import { 
  layerIntersections, 
  layerLTS,
  layerBikeParking,
  layerBlueBikes,
} from './components/MapLayers/MapLayers';

// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/

const INITIAL_CENTER = [-71.0809, 42.3473]
const INITIAL_ZOOM = 12
const MAX_ZOOM = 20
const MIN_ZOOM = 9
const ZOOM_UNION = 12
const BOUNDS = [
  [-71.3000, 42.1500], // Southwest coordinates
  [-70.9000, 42.5000]  // Northeast coordinates
];
const LINE_WIDTH = 4

const COLOR_SCALE = ['#007191', '#62c8d3', '#f47a00', '#d31f11', 'grey'] // https://www.simplifiedsciencepublishing.com/resources/best-color-palettes-for-scientific-figures-and-data-visualizations
// rgb(0, 113, 145), rgb(98, 200, 211), rgb(244, 122, 0), rgb(211, 31, 17)

function Map() {
  console.log(window.location.href) // full URL
  console.log(window.location.pathname) // just the path without the domain
  console.log(window.location.hash) // just the hash fragment of the url

  const ltsLayerName = 'lts'
  const intersectionsLayerName = 'inx'
  const bikeParkingLayerName = 'bpk'
  const bluebikeLayerName = 'blb'

  function updateFragment (key, value) {
    console.log('Updating URL fragment to ', key, '=', value)
    if (window.location.hash.includes(key + "=")) {
      var regex = new RegExp(`(${key}=)[A-Za-z0-9_-]*`)
      var hash = window.location.hash
      // console.log('replaceFragment', hash, key, value, regex, hash.replace(regex, key+'='+value))
      window.location.hash = hash.replace(regex, key + '=' + value)

    } else {
      window.location.hash += '&' + key + '=' + value
    }
  }

  function setFromFragment (hashName, defaultValue) {
    // console.log('setFromFragment/hashName:', hashName)
    if (window.location.hash.includes(hashName + "=")) {
      var splitHash = window.location.hash.split('&')
      // console.log(splitHash)
      var filterHash = splitHash.filter(str => str.includes(hashName + '='))
      // console.log('setFromFragment/filterHash:', filterHash)
      var hashValue = filterHash[0].split('=')[1]
      // console.log('setFromFragment/hashValue:', hashValue)
      if (hashValue == 'true') {hashValue = true}
      else if (hashValue == 'false') {hashValue = false}
      else if (hashValue == 'none') {
        console.log('setFromFragment: Set empty state due to value of none')
        return
      }

      // Find the feature id and select the feature
      if (hashName == 'selected' && window.location.hash.includes('selectedType')) {
        var selectedType = splitHash.filter(str => str.includes('selectedType'))
        selectedType = selectedType[0].split('=')[1]
        console.log('setFromFragment/selectedType:', selectedType)
      } else if (hashName == 'selected') {
        console.log('setFromFragment: URL fragment has selected feature without feature type. Set empty state.')
        return
      }

      var layerFeatures
      if (selectedType == 'bluebikeStation') {
        console.log('-------------Looking up BlueBike station ID from map layer')
        layerFeatures = mapRef.current.queryRenderedFeatures({target: {layerId: bluebikeLayerName}}) 
        console.log('bluebikeStation layerFeatures', layerFeatures, mapRef.current.getStyle())
        function getStationID(element) {
          return element.properties.station_id
        }
        hashValue = layerFeatures.find(getStationID)
        console.log('new hashValue', hashValue)
      } else if (selectedType == 'bikeParking') {
        console.log('-------------Looking up bike parking ID from map layer')

        // FIXME: this probably should be an async/await, but that changes how setFromFragment works 
        // elsewhere, plus I was having a hell of a time getting async to work to wait for the OSM 
        // data to load before trying to read and load the selection
        // let loopCount = 0
        // while (loopCount < 10) { 
        //   if (typeof mapRef.current.getLayer(bikeParkingLayerName) == 'undefined') {
        //     setTimeout(() => {
        //         console.log('bike parking while loop', loopCount, mapRef.current.getLayer(bikeParkingLayerName));
        //     }, 100)
        //     loopCount++
        //   }
        // }
        // console.log('ended bike parking while loop', mapRef.current.getLayer(bikeParkingLayerName))

        layerFeatures = mapRef.current.queryRenderedFeatures({target: {layerId: bikeParkingLayerName}}) 
        // console.log('bikeParking layerFeatures', 
        //             layerFeatures, 
        //             // mapRef.current.getLayer(bikeParkingLayerName),
        //             // mapRef.current.getSource('bike-parking'), 
        //             // mapRef.current.getStyle(),
        //             // mapRef.current.getSource('bike-parking')
        //           )
        function getOSMID(element) {
          return element.properties.id
        }
        hashValue = layerFeatures.find(getOSMID)
        console.log('new hashValue', hashValue)
      } else if (selectedType == 'intersections') {
        console.log('-------------Looking up Intersection ID from map layer')

        // FIXME: this probably should be an async/await, but that changes how setFromFragment works 
        // elsewhere, plus I was having a hell of a time getting async to work to wait for the OSM 
        // data to load before trying to read and load the selection
        let loopCount = 0
        while (loopCount < 10) { 
          if (typeof mapRef.current.getLayer(intersectionsLayerName) == 'undefined') {
            setTimeout(() => {
                console.log(
                  'intersection while loop', 
                  typeof mapRef.current.getLayer(intersectionsLayerName), 
                  loopCount, 
                  mapRef.current.getLayer(intersectionsLayerName)
                );
            }, 100)
            loopCount++
          }
        }
        console.log('ended intersection while loop', mapRef.current.getLayer(intersectionsLayerName))
        
        layerFeatures = mapRef.current.queryRenderedFeatures({target: {layerId: intersectionsLayerName}}) 
        console.log('intersections layerFeatures', layerFeatures, mapRef.current.getStyle())
        function getIntersectionID(element) {
          return element.properties.id
        }
        hashValue = layerFeatures.find(getIntersectionID)
        console.log('new hashValue', hashValue)
      // } else {
      //   console.log('Unknown selectedType', selectedType)
      //   hashValue = defaultValue
      }
      // console.log('setFromFragment: Setting `' + hashName + '` to `' + hashValue + '`')
      return hashValue
    } else {
      console.log('setFromFragment: Key `' + hashName + '` not in URL fragment')
      if (defaultValue == 'none') {return}
      window.location.hash += "&" + hashName + "=" + defaultValue;
      return defaultValue
    }
  }
 
  const [advancedMode, setAdvancedMode] = useState(false);
  // console.log('advancedMode:', advancedMode);
  
  // Set the layers on the map from the URL fragment
  const [displayLTSState, setLTS] = useState(setFromFragment(ltsLayerName, true));
  const [displayIntersectionsState, setIntersections] = useState(setFromFragment(intersectionsLayerName, false));
  const [displayBikeParkingState, setBikeParking] = useState(setFromFragment(bikeParkingLayerName, false));
  const [displayBluebikeStationsState, setBluebikeStations] = useState(setFromFragment(bluebikeLayerName, false));

  // Create activeFeature states, 
  // to be read from URL fragment later because it needs the map layers loaded first
  const [activeFeatureType, setActiveFeatureType] = useState()
  const [activeFeature, setActiveFeature] = useState()
  
  const displayLTSRef = useRef()
  const displayIntersectionsRef = useRef()
  const displayBikeParkingRef = useRef()
  const displayBluebikeStationsRef = useRef()

  displayLTSRef.current = displayLTSState
  displayIntersectionsRef.current = displayIntersectionsState
  displayBikeParkingRef.current = displayBikeParkingState
  displayBluebikeStationsRef.current = displayBluebikeStationsState
  console.log('Map() |',
    'displayLTSRef.current', displayLTSRef.current,
    'displayIntersectionsRef.current', displayIntersectionsRef.current,
    'displayBikeParkingRef.current', displayBikeParkingRef.current,
    'displayBluebikeStationsRef.current', displayBluebikeStationsRef.current,
  )

  const [displayLTS1State, setLTS1] = useState(setFromFragment('lts1', true));
  const [displayLTS2State, setLTS2] = useState(setFromFragment('lts2', true));
  const [displayLTS3State, setLTS3] = useState(setFromFragment('lts3', true));
  const [displayLTS4State, setLTS4] = useState(setFromFragment('lts4', true));

  const displayLTS1Ref = useRef()
  const displayLTS2Ref = useRef()
  const displayLTS3Ref = useRef()
  const displayLTS4Ref = useRef()

  displayLTS1Ref.current = displayLTS1State
  displayLTS2Ref.current = displayLTS2State
  displayLTS3Ref.current = displayLTS3State
  displayLTS4Ref.current = displayLTS4State

  async function loadLayers () {
    // console.log('loadLayers State', 
    //   displayLTSState, displayIntersectionsState, displayBikeParkingState, displayBluebikeStationsState,)
    // console.log('loadLayers Ref',
    //   displayLTSRef.current, displayIntersectionsRef.current, displayBikeParkingRef.current, displayBluebikeStationsRef.current)
    if (displayLTSRef.current == true) {
      layerLTS(mapRef, ltsLayerName, COLOR_SCALE, LINE_WIDTH, setActiveFeature, setActiveFeatureType)
      if (!displayLTS1Ref.current) { setLTSfilter(1) }
      if (!displayLTS2Ref.current) { setLTSfilter(2) }
      if (!displayLTS3Ref.current) { setLTSfilter(3) }
      if (!displayLTS4Ref.current) { setLTSfilter(4) }
    }
    if (displayBikeParkingRef.current == true) {
      layerBikeParking(mapRef, bikeParkingLayerName, COLOR_SCALE, setActiveFeature, setActiveFeatureType).then(console.log('bike parking layer loaded'))
    }
    if (displayBluebikeStationsRef.current == true) {
      console.log('displayBluebikeStationsRef is on')
      layerBlueBikes(mapRef, bluebikeLayerName, setActiveFeature, setActiveFeatureType)
    }
    if (displayIntersectionsRef.current == true) {
      // layerIntersections(mapRef, intersectionsLayerName, displayIntersectionsRef, COLOR_SCALE, setActiveFeature, setActiveFeatureType)
      layerIntersections(mapRef, intersectionsLayerName, COLOR_SCALE, setActiveFeature, setActiveFeatureType)
    }
    // load the active feature from the url fragment (triggers the modal)
    // console.log('***setting activeFeature', setFromFragment('selected', 'none'))
    setActiveFeatureType(setFromFragment('selectedType', 'none'))
    setActiveFeature(setFromFragment('selected', 'none'))
  };

  const mapRef = useRef()
  const mapContainerRef = useRef()

  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)

  const handleAdvancedMode = () => {
    console.log('advancedMode switched from', advancedMode);
    setAdvancedMode(advancedMode => !advancedMode);
  }
  
  const handleLTS1 = () => {
    console.log('displayLTS1 switched from', displayLTS1Ref.current);    
    
    setLTS1(displayLTS1 => !displayLTS1);
    setLTSfilter(1)
    updateFragment('lts1', !displayLTS1Ref.current)
  }
  const handleLTS2 = () => {
    console.log('displayLTS2 switched from', displayLTS2Ref.current);
    setLTS2(displayLTS2 => !displayLTS2);
    setLTSfilter(2)
    updateFragment('lts2', !displayLTS2Ref.current)
  }
  const handleLTS3 = () => {
    console.log('displayLTS3 switched from', displayLTS3Ref.current);
    setLTS3(displayLTS3 => !displayLTS3);
    setLTSfilter(3)
    updateFragment('lts3', !displayLTS3Ref.current)
  }
  const handleLTS4 = () => {
    console.log('displayLTS4 switched from', displayLTS4Ref.current);
    setLTS4(displayLTS4 => !displayLTS4);
    setLTSfilter(4)
    updateFragment('lts4', !displayLTS4Ref.current)
  }
  const setLTSfilter = (level) => {
    let ltsFilter = mapRef.current.getFilter(ltsLayerName)
    // console.log('ltsFilter', ltsFilter)
    if (ltsFilter.includes(level)) {
      const index = ltsFilter.indexOf(level);
      ltsFilter.splice(index, 1); // 2nd parameter means remove one item only
    } else {
      ltsFilter.push(level)
    }
    mapRef.current.setFilter(ltsLayerName, ltsFilter);
  }

  // Load Mapbox map with:
  // - add LTS layer
  // - get current center and zoom of map view
  // - allow user to click on street segments from LTS layer, data saved to state variable
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2tpbGNveW5lIiwiYSI6ImNseTd2cXpwOTA5MnUya3E2ejBkN2ttOW8ifQ.TN39Bd_yu_SqMsu-IW4FKQ'
    mapRef.current = new mapboxgl.Map({ // Can add more options here: https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: BOUNDS,
      hash: "map",
      // style: 'mapbox://styles/mapbox/light-v11',
      // light-v11 doesn't seem like able to show T stations, using config can mimic light-v11 on standard style
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          lightPreset: 'day',
          showPlaceLabels: false,
          showPointOfInterestLabels: false,
          theme: 'monochrome',
          show3dObjects: false,
          showTransitLabels: true,
          showRoadLabels: true
        }
      }
    });

    mapRef.current.on('load', function () {
      loadLayers(ltsLayerName, bikeParkingLayerName, bluebikeLayerName, intersectionsLayerName,).then(() => {
        // load the active feature from the url fragment (triggers the modal)
        // console.log('***setting activeFeature', setFromFragment('selected', 'none'))
        setActiveFeatureType(setFromFragment('selectedType', 'none'))
        setActiveFeature(setFromFragment('selected', 'none'))
      }
      )
      
      // get the current center coordinates and zoom level from the map
      mapRef.current.on('move', () => {
        const mapCenter = mapRef.current.getCenter()
        const mapZoom = mapRef.current.getZoom()

        // update state
        setCenter([ mapCenter.lng, mapCenter.lat ])
        setZoom(mapZoom)
      })

      // Add fullscreen button
      mapRef.current.addControl(new mapboxgl.FullscreenControl());
    })

    mapRef.current.on('zoom', (e) => {
      let zoomThreshold = 16
      let styleStandard = 'mapbox://styles/mapbox/standard'
      let styleStandardConfig = {
              basemap: {
                lightPreset: 'day',
                showPlaceLabels: false,
                showPointOfInterestLabels: false,
                theme: 'monochrome',
                show3dObjects: false,
                showTransitLabels: true,
                showRoadLabels: true
              }}
      let styleSatellite = 'mapbox://styles/mapbox/standard-satellite'

      console.log('zoom:', mapRef.current.getZoom(),
      '| displayLTS:', displayLTSRef.current,
        'displayIntersections:', displayIntersectionsRef.current, 
        'displayBikeParking:', displayBikeParkingRef.current, 
        'displayBluebikeStations:', displayBluebikeStationsRef.current)

      if (mapRef.current.isStyleLoaded()) {

        let currentStyle = mapRef.current.getStyle().imports[0].data.name
        // console.log('currentStyle: ', currentStyle)
        let currentZoom = mapRef.current.getZoom()
        // console.log('zoom: ', currentZoom)
      
        if ( displayIntersectionsRef.current ) {          
          if ( (currentZoom > zoomThreshold) && (currentStyle=='Mapbox Standard') ) {
            mapRef.current.setStyle(styleSatellite);
          } else if ( (currentZoom < zoomThreshold ) && (currentStyle=='Mapbox Standard Satellite')) {
            mapRef.current.setStyle(styleStandard, {config: styleStandardConfig});
          }
        } else {
          if ( currentStyle!='Mapbox Standard' ) {
            mapRef.current.setStyle(styleStandard, {config: styleStandardConfig});
          }
        }
      }
    })

    mapRef.current.on('style.load', () => {
        loadLayers(ltsLayerName, bikeParkingLayerName, bluebikeLayerName, intersectionsLayerName,)
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

  const handleReset = () => {
    // Reset zoom
    mapRef.current.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    })
    // Deactivate selected features
    setActiveFeature()
    setActiveFeatureType()
    mapRef.current.setFilter(ltsLayerName+'-selected', ['in', 'osmid', '']);
  }

  const handleLayerCheckbox = (checkboxState, setState, displayState, layerID) => {
    console.log(layerID + ' checkbox changed to ' + checkboxState);
    setState(checkboxState => !checkboxState)

    if(checkboxState) {
      // Check if the layer has been loaded and load it if it hasn't
      if(typeof mapRef.current.getLayer(layerID) == 'undefined') {
        if (layerID == intersectionsLayerName) {
          // layerIntersections(mapRef, intersectionsLayerName, displayIntersectionsRef, COLOR_SCALE, setActiveFeature, setActiveFeatureType)
          layerIntersections(mapRef, intersectionsLayerName, COLOR_SCALE, setActiveFeature, setActiveFeatureType)
        } else if (layerID == bikeParkingLayerName) {
          layerBikeParking(mapRef, bikeParkingLayerName, COLOR_SCALE, setActiveFeature, setActiveFeatureType)
        } else if (layerID == bluebikeLayerName) {
          layerBlueBikes(mapRef, bluebikeLayerName, setActiveFeature, setActiveFeatureType)
        } else if (layerID == ltsLayerName) {
          layerLTS(mapRef, ltsLayerName, COLOR_SCALE, LINE_WIDTH, setActiveFeature, setActiveFeatureType)
        } 
      }
      console.log("Turning on " + layerID)
      mapRef.current.setLayoutProperty(layerID, 'visibility', 'visible');
      if(typeof mapRef.current.getLayer(layerID+'selected') != 'undefined') {
        mapRef.current.setLayoutProperty(layerID+'selected', 'visibility', 'visible');
      }
    } else {
      console.log("Turning off " + layerID)
      mapRef.current.setLayoutProperty(layerID, 'visibility', 'none');
      if(typeof mapRef.current.getLayer(layerID+'selected') != 'undefined') {
        mapRef.current.setLayoutProperty(layerID+'selected', 'visibility', 'none');
      }
    }

    updateFragment(layerID, checkboxState)

  }

  function OptionsMenu({checkboxName, setLayer, displayRef, layerName, label}) {
      // console.log(label, 'optionsMenu: ', displayRef.current)
      if (displayRef.current == 'hidden') {
        return null;
      }
      // console.log(checkboxName, setLayer, displayRef, layerName, label)
      return <div><label className='options-layer'>
            <input 
              type="checkbox" 
              name={checkboxName}
              checked={displayRef.current} 
              onChange={e => handleLayerCheckbox(
                e.target.checked, setLayer, displayRef, layerName)}
            />
            {label}
          </label></div>
    }

  return (
    <>
      <div id='map-container' ref={mapContainerRef} >
        {/* <div className="topbar">
          Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
        </div> */}

        <Legend 
          colorScale={COLOR_SCALE}
          lts_display={displayLTSState}
          lts1_display={displayLTS1Ref.current}
          lts2_display={displayLTS2Ref.current}
          lts3_display={displayLTS3Ref.current}
          lts4_display={displayLTS4Ref.current}
          handleLTS1={handleLTS1}
          handleLTS2={handleLTS2}
          handleLTS3={handleLTS3}
          handleLTS4={handleLTS4}
        />

        <button className='reset-button' onClick={handleReset}>
          Reset
        </button>
        <button className='advanced-button' onClick={handleAdvancedMode}>
          <ModeToggle advancedMode={advancedMode} />
        </button>

        <div id='options-menu'>
          <h1 id='options-title'>Map Features</h1>
          <OptionsMenu 
            checkboxName="ltsCheckbox"
            setLayer={setLTS}
            displayRef={displayLTSRef}
            layerName={ltsLayerName}
            label="Stress Map"
          />
          <OptionsMenu 
            checkboxName="intersectionAuditCheckbox"
            setLayer={setIntersections}
            displayRef={displayIntersectionsRef}
            layerName={intersectionsLayerName}
            label="Intersection Audits"
          />
          <OptionsMenu 
            checkboxName="bikeParkingCheckbox"
            setLayer={setBikeParking}
            displayRef={displayBikeParkingRef}
            layerName={bikeParkingLayerName}
            label="Bike Parking"
          />
          <OptionsMenu 
            checkboxName="bluebikeStationCheckbox"
            setLayer={setBluebikeStations}
            displayRef={displayBluebikeStationsRef}
            layerName={bluebikeLayerName}
            label="BlueBike Stations"
          />
        </div>

        <SideBar 
            selectedFeature={activeFeature} 
            selectedFeatureType={activeFeatureType} 
            zoom={zoom} zoomLimit={ZOOM_UNION} 
            advancedMode={advancedMode}/>

      </div>
    </>
  )
}

export default Map