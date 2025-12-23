'use cache'

// 开启use cache执行，对当前组件进行缓存
import Sidenav from '@/app/ui/dashboard/sidenav'
export default async function Layout({children}:{children:React.ReactNode}) {
    return <div className='flex h-screen flex-col md:flex-row md:overflow-hidden'>
        <div className='flex-none md:w-64 w-full'>
            <Sidenav />
        </div>
        <div className='flex-grow p-6 md:overflow-y-auto md:p-12'>
            {children}
        </div>
    </div>
}