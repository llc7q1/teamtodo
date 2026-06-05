// src/components/Navbar/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>T</span>
        TeamTodo
      </div>
      <div className={styles.actions}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            placeholder="搜索任务..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.iconButton} title="通知">
          &#128276;
        </button>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.display_name?.charAt(0) || '我'}
          </div>
          <span className={styles.userName}>{user?.display_name || ''}</span>
        </div>
        <button className={styles.logoutButton} onClick={logout} title="登出">
          &#10151;
        </button>
      </div>
    </nav>
  );
}
