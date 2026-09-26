
import Image from 'next/image';
const Logo = ({ width, height }: { width: number, height: number }) => {
    return (
        <div>
            <Image src={'/img/logo.png'} alt="logo" width={width} height={height} className={`object-contain`} />
        </div>
    )
}

export default Logo;