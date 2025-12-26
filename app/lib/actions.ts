'use server';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import z from 'zod'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error:'请选择客户',
    }),
    amount: z.coerce.number().gt(0, '请输入大于 $0 的金额', ),
    status: z.enum(['pending', 'paid'],{
        invalid_type_error:"请选择发票状态"
    }),
    date: z.string(),
});

export type State = {
    errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}

// 统一和Invoices数据格式，忽略无关属性值
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true });


// 通过添加'use server'，将文件中的所有导出函数标记为服务端操作。然后可以在客户端组件和服务端组件中导入和使用这些服务端函数。
// 此文件中未使用的任何函数将自动从最终应用程序包中删除。
// 另外，还可以通过将 "use server" 添加到操作内部来直接在服务端组件中编写服务端操作。
export const createInvoice = async (preState: State, formData: FormData) => {
    try{
        const validatedFields= CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
        console.log(validatedFields)
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: '字段缺失，创建发票失败',
            };
        }
        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];
        // 通过sql和数据库直接完成交互,
        // 将数据插入数据库
        try {
            await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
            `;
        } catch (error) {
            // 如果发生数据库错误，返回更具体的错误
            return {
                message: '数据库错误：创建发票失败',
            };
        }
        // 刷新发票页面的缓存
        revalidatePath("/dashboard/invoices");
        // 创建成功之后重定向到发票列表页面
    }catch(e){
        throw(e)
    }
    redirect("/dashboard/invoices")
    // 测试一下：
    // 提交后，应该会在终端（而不是浏览器）中看到刚刚输入到表单中的数据。
    // console.log("rawFormData", customerId, amount, status);
    // console.log(typeof amount);
}

export const updateInvoice = async (preState: State, formData: FormData) => {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        id: formData.get("id"),
    });
    console.log(formData.get("id"));
    if(validatedFields.error){
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: '字段缺失，更新发票失败',
        };
    }
    const { customerId, amount, status, id } = validatedFields.data;
    const amountInCents = amount * 100;
    console.log(validatedFields, validatedFields.data)
    // 通过sql和数据库直接完成交互,
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        throw '数据库错误：创建发票失败'
    }
    // 刷新发票页面的缓存
    revalidatePath("/dashboard/invoices");
    // 创建成功之后重定向到发票列表页面
    redirect("/dashboard/invoices")
}

export const deleteInvoice = async (id: string) => {
    throw new Error('删除发票失败');

    await sql`DELETE FROM invoices WHERE id = ${id}`;
    // 只需要缓存，不需要改变路由
    revalidatePath('/dashboard/invoices');
}

// 针对react19的useActionState调整服务端方法
export const authenticate = async (preState: string | undefined, formData: FormData) => {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
    throw error;
    }
}