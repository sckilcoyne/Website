import labs_wordmark from '../../../public/labs_wordmark.svg';
import Link from 'next/link'
// import './image.css'

export default function LabsHeader() {
    return(
        <div id='header_stripe'>
            <Link href='/'><img src={labs_wordmark.src} className='labs_wordmark' alt='BCU Labs'/></Link>
        </div>
    )
}
