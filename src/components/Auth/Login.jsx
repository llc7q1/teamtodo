import { useState } from 'react';
import styles from './Auth.module.css';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      <div className={styles.card}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>T</div>
          <div className={styles.logoTitle}>TeamTodo</div>
          <div className={styles.logoSubtitle}>登录你的团队工作台</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>用户名</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                type="text"
                placeholder="输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <span className={styles.inputIcon}>&#128100;</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>密码</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <span className={styles.inputIcon}>&#128274;</span>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className={styles.footer}>
          还没有账号？{' '}
          <button className={styles.footerLink} onClick={onSwitchToRegister}>
            去注册
          </button>
        </div>
      </div>
    </div>
  );
}
