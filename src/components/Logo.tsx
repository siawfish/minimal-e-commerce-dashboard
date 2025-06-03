import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    
    return (
        <Link href="/" className="group">
            <Image src="/logo.png" className="sm:hidden" alt="Zsar Zsar" width={50} height={50} />
            <Image src="/logo.png" className="hidden sm:block" alt="Zsar Zsar" width={100} height={100} />
        </Link>
    )
}