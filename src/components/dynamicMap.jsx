import dynamic from 'next/dynamic'

const Map = dynamic(() => import("./Map"), {
  loading: () => "Loading...",
  ssr: false
});

export default Map