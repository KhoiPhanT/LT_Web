"use client";
// Phụ trách phần mới: Lợi. Form đăng nhập nhân viên dùng phiên Servlet.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
export default function StaffLogin() {
  const router=useRouter(); const [phone,setPhone]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const user=await api.staffLogin(phone,password); router.push(user.role==="MANAGER"?"/manager":"/technician"); } catch(e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl border p-8 shadow-sm space-y-4"><h1 className="text-2xl font-bold">Đăng nhập nhân viên</h1><p className="text-sm text-slate-500">Quản lý gara hoặc kỹ thuật viên kiêm tư vấn</p><label className="block text-sm">Số điện thoại<input className="mt-1 w-full border rounded-lg p-3" value={phone} onChange={e=>setPhone(e.target.value)} required/></label><label className="block text-sm">Mật khẩu<input type="password" className="mt-1 w-full border rounded-lg p-3" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<p role="alert" className="text-red-600 text-sm">{error}</p>}<button disabled={busy} className="w-full bg-amber-500 rounded-lg p-3 font-bold disabled:opacity-50">{busy?"Đang đăng nhập...":"Đăng nhập"}</button></form>;
}
