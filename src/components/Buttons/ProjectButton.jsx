import Link from 'next/link'

export default function ProjectButton( props) {
  const { link, title, subtitle } = props;
    return (
      <div className='Pad'>
        <Link href={link} >
          <button className='Button Project'>
            <h1 className='ButtonProjectTitle'>{title} </h1>
            <h2 className='ButtonProjectSubtitle'>{subtitle} </h2>
          </button>
        </Link>
      </div>
    );
  }
  
  