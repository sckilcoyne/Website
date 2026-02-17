// import Map from '../src/components/dynamicMap.jsx'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import("../src/components/Map"), {
  loading: () => "Loading...",
  ssr: false
});


export default function testMap(props) {
    return(
        <Map />
    )
}
