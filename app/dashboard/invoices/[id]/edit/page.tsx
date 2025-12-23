import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { notFound } from 'next/navigation'
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
// page组件一定有的页面路由参数 params，统一都是promise对象
const Page = async (props: {
    params: Promise<{
        id ?: string
    }>
}) => {
    const { id = '' } = await props.params;
    const [ invoice, customers ] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers()
    ])
    if(!invoice){
        notFound()
    }
    return  <main>
        <Breadcrumbs
            breadcrumbs={[
                { label: 'Invoices', href: '/dashboard/invoices' },
                {
                    label: 'Edit Invoice',
                    href: `/dashboard/invoices/${id}/edit`,
                    active: true,
                },
            ]}
        />
        <Form invoice={invoice} customers={customers} />
    </main>
}
export default Page;