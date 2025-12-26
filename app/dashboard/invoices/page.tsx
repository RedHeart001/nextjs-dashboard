import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { inter } from '@/app/ui/font';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '发票 | Acme 仪表盘',
};

export default async function Page(props :{
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchInvoicesPages(query); // 每页六条数据，按照六条分页返回总页数
    return (
        <div className='w-full'>
            <div className='flex w-full items-center justify-between'>
                <h1 className={`${inter.className} text-2xl text-blue-600`}>Invoices</h1>
            </div>
            <div className='mt-[20px] flex w-full items-center justify-between gap-6 md:mt-8'>
                <Search placeholder="搜索发票..." />
                <CreateInvoice />
            </div>
            <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
                <Table query={query} currentPage={currentPage} />
            </Suspense>
            <div className='w-full flex justify-center mt-5'>
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}