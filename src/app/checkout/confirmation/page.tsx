import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function ConfirmationPage() {
    return (
        <div className="container mx-auto py-10 text-center">
            
            <h1 className="text-3xl font-bold mb-5">Đặt Hàng Thành Công!</h1>
            <p className="mb-5">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
            <div className="flex justify-center mb-8">
                <Image
                    src="/test.jpg"
                    alt="Order Success"
                    width={300}
                    height={300}
                    className="animate-bounce object-contain"

                />
            </div>
            <Link href="/">
                <Button>Quay Về Trang Chủ</Button>
            </Link>
        </div>
    )
}

