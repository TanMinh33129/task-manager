import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirmPassword:'', role:'user' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu không khớp!');
    setLoading(true);
    try {
      const res = await registerAPI({ name:form.name, email:form.email, password:form.password, role:form.role });
      login(res.data.token, res.data.user);
      toast.success('Đăng ký thành công!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>TM</div>
        <h2 style={s.title}>Tạo tài khoản</h2>
        <p style={s.sub}>Bắt đầu quản lý công việc của bạn</p>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Họ và tên</label>
            <input style={s.input} type="text" placeholder="Nguyễn Văn A"
              value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="example@gmail.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mật khẩu</label>
            <input style={s.input} type="password" placeholder="Tối thiểu 6 ký tự"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Xác nhận mật khẩu</label>
            <input style={s.input} type="password" placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword:e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Vai trò</label>
            <div style={s.roleRow}>
              <button type="button" style={form.role==='user' ? s.roleActive : s.roleBtn} onClick={() => setForm({...form, role:'user'})}>Người dùng</button>
              <button type="button" style={form.role==='admin' ? s.roleActive : s.roleBtn} onClick={() => setForm({...form, role:'admin'})}>Quản trị viên</button>
            </div>
          </div>
          <button style={loading ? {...s.btn, opacity:0.7} : s.btn} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>
        <p style={s.linkRow}>Đã có tài khoản? <Link to="/login" style={s.link}>Đăng nhập</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' },
  card:       { background:'#fff', borderRadius:'14px', padding:'40px 36px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  logo:       { width:'46px', height:'46px', background:'#185FA5', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'18px', marginBottom:'20px' },
  title:      { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'4px' },
  sub:        { fontSize:'13px', color:'#999', marginBottom:'28px' },
  field:      { marginBottom:'18px' },
  label:      { display:'block', fontSize:'13px', color:'#555', marginBottom:'6px', fontWeight:'500' },
  input:      { width:'100%', height:'42px', border:'1.5px solid #e8e8e8', borderRadius:'8px', padding:'0 14px', fontSize:'14px', outline:'none', boxSizing:'border-box' },
  btn:        { width:'100%', height:'42px', background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'8px' },
  linkRow:    { textAlign:'center', fontSize:'13px', color:'#999', marginTop:'24px' },
  link:       { color:'#185FA5', textDecoration:'none', fontWeight:'600' },
  roleRow:    { display:'flex', gap:'10px' },
  roleBtn:    { flex:1, height:'38px', border:'1.5px solid #e8e8e8', borderRadius:'8px', background:'#fff', fontSize:'13px', cursor:'pointer', color:'#666' },
  roleActive: { flex:1, height:'38px', border:'1.5px solid #185FA5', borderRadius:'8px', background:'#E6F1FB', fontSize:'13px', cursor:'pointer', color:'#0C447C', fontWeight:'600' },
};
