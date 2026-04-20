import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAPI(form);
      login(res.data.token, res.data.user);
      toast.success('Đăng nhập thành công!');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>TM</div>
        <h2 style={s.title}>Đăng nhập</h2>
        <p style={s.sub}>Chào mừng trở lại · Task Manager</p>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="example@gmail.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mật khẩu</label>
            <input style={s.input} type="password" placeholder="Nhập mật khẩu"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button style={loading ? {...s.btn, opacity:0.7} : s.btn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p style={s.linkRow}>Chưa có tài khoản? <Link to="/register" style={s.link}>Đăng ký ngay</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' },
  card:  { background:'#fff', borderRadius:'14px', padding:'40px 36px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  logo:  { width:'46px', height:'46px', background:'#185FA5', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'18px', marginBottom:'20px' },
  title: { fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'4px' },
  sub:   { fontSize:'13px', color:'#999', marginBottom:'28px' },
  field: { marginBottom:'18px' },
  label: { display:'block', fontSize:'13px', color:'#555', marginBottom:'6px', fontWeight:'500' },
  input: { width:'100%', height:'42px', border:'1.5px solid #e8e8e8', borderRadius:'8px', padding:'0 14px', fontSize:'14px', outline:'none', boxSizing:'border-box', transition:'border 0.2s' },
  btn:   { width:'100%', height:'42px', background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'8px' },
  linkRow:{ textAlign:'center', fontSize:'13px', color:'#999', marginTop:'24px' },
  link:  { color:'#185FA5', textDecoration:'none', fontWeight:'600' },
};
