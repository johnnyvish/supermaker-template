'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <div className='flex justify-between items-center p-4'>
            <div className='flex items-center'>
                <Image src='/logo.png' alt='logo' width={100} height={100} />
                <Link href='/' className='font-bold'>
                    Title
                </Link>
            </div>
            <div className='flex space-x-4'>
                <Link href='/link1'>Link 1</Link>
                <Link href='/link2'>Link 2</Link>
                <Link href='/link3'>Link 3</Link>
            </div>
            <div className='flex space-x-4'>
                <Link href='/link4'>Dynamic Link</Link>
            </div>
        </div>
    );
}
