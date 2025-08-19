import LabsHeader from '../src/components/ImageLinks/LabsHeader.jsx';
import LabsFooter from '../src/components/Footer/Footer.jsx';


export default function MdxLayout({ children }) {
  // Create any shared layout or styles here
  return (
    <div>
        <header><LabsHeader /></header>
        <div>{children}</div>
        <footer><LabsFooter /></footer>
    </div>
  
  )
}