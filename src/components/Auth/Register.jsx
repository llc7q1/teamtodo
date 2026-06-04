import { useState } from 'react';
import styles from './Auth.module.css';

export default function Register({ onSwitchToLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password || !displayName.trim()) {
      setError('请填写所有字段');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }
    setLoading(true);
    try {
      await onRegister(username.trim(), password, displayName.trim());
    } catch (err) {
      setError(err.message || '注册失败');
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
          <div className={styles.logoSubtitle}>创建你的团队账号</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>用户名</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                type="text"
                placeholder="设置登录用户名"
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
                placeholder="至少 6 个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <span className={styles.inputIcon}>&#128274;</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>显示名称</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.input}
                type="text"
                placeholder="团队成员看到的名字"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <span className={styles.inputIcon}>&#9997;</span>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className={styles.footer}>
          已有账号？{' '}
          <button className={styles.footerLink} onClick={onSwitchToLogin}>
            去登录
          </button>
        </div>
      </div>
    </div>
  );
}
